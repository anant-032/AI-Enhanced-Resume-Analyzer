import express from "express";
import multer from "multer";
import { createRequire } from "module";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { analyzeResume } from "../services/ollama.service.js";

/* 🔹 AUTH */
import authMiddleware from "../middleware/authMiddleware.js";

/* 🔹 MongoDB Model */
import ResumeAnalysis from "../models/ResumeAnalysis.js";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse-fork");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/* =========================
   IN-MEMORY ANALYSIS CACHE
   ========================= */
const analysisCache = new Map();

/* =========================
   LOAD COMPANY JD DATA
   ========================= */
const jdFilePath = path.join(__dirname, "../data/company_jds.json");
let COMPANY_JDS = {};
try {
  COMPANY_JDS = JSON.parse(fs.readFileSync(jdFilePath, "utf-8"));
} catch {
  COMPANY_JDS = {};
}

function isJDStale(jdEntry) {
  if (!jdEntry?.lastUpdated) return true;
  const diffDays =
    (Date.now() - new Date(jdEntry.lastUpdated)) /
    (1000 * 60 * 60 * 24);
  return diffDays > 30;
}

/* =========================
   RESUME FORMAT ANALYSIS
   ========================= */
function analyzeFormat(resumeText) {
  const text = resumeText.toLowerCase();
  const lines = resumeText.split("\n").map(l => l.trim()).filter(Boolean);

  const issues = [];
  const warnings = [];
  const passedChecks = [];

  const hasEmail = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(resumeText);
  const hasPhone = /\b\d{10}\b|\+\d{1,3}[-.\s]?\d{10}\b/.test(resumeText);

  hasEmail || hasPhone
    ? passedChecks.push("Contact information detected")
    : issues.push("Missing contact information (email or phone)");

  const sections = {
    experience: /(experience|work experience)/i.test(text),
    education: /education/i.test(text),
    skills: /skills/i.test(text),
  };

  Object.entries(sections).forEach(([section, exists]) =>
    exists
      ? passedChecks.push(`${section} section found`)
      : issues.push(`Missing ${section} section`)
  );

  const bulletLines = lines.filter(l => /^[-•*]/.test(l));
  bulletLines.length === 0
    ? warnings.push("Experience section may lack bullet points")
    : passedChecks.push("Bullet points detected");

  const avgLineLength =
    lines.reduce((sum, l) => sum + l.length, 0) / (lines.length || 1);

  avgLineLength > 180
    ? warnings.push("Lines are very long; resume may use columns")
    : passedChecks.push("Text layout appears ATS-readable");

  return { issues, warnings, passedChecks };
}

/* =========================
   JD QUALITY CHECK
   ========================= */
function analyzeJDQuality(jobDescription) {
  const jd = jobDescription.trim().toLowerCase();
  const keywords = [
    "experience",
    "skills",
    "responsibilities",
    "frontend",
    "backend",
    "api",
    "database",
  ];
  const matches = keywords.filter(k => jd.includes(k)).length;

  return {
    length: jd.length,
    keywordMatches: matches,
    isWeak: jd.length < 80 || matches < 3,
  };
}

/* =========================
   RECRUITER SUMMARY
   ========================= */
function generateRejectionSummary({ overallScore, matched, missing, jdQuality }) {
  if (jdQuality.isWeak)
    return "Evaluation limited due to vague job requirements.";
  if (overallScore >= 75)
    return "Candidate aligns well with most role requirements.";
  if (matched === 0)
    return "No meaningful alignment with required skills.";
  if (missing > matched)
    return "Several critical requirements are missing.";
  return "Partial alignment; improvements required.";
}

/* =========================
   MAIN ANALYZE ROUTE
   ========================= */
router.post(
  "/",
  authMiddleware, // 🔒 AUTH REQUIRED
  upload.any(),
  async (req, res) => {
    try {
      if (!req.files?.length) {
        return res.status(400).json({ error: "No resume uploaded" });
      }

      const file = req.files[0];
      const userJD = req.body.jobDescription || "";
      const company = req.body.company || "General";
      const role = req.body.role || "";

      const parsed = await pdfParse(file.buffer);
      if (!parsed.text?.trim()) {
        return res.status(400).json({ error: "PDF contains no readable text" });
      }

      const resumeHash = crypto
        .createHash("sha256")
        .update(parsed.text)
        .digest("hex");

      /* =========================
         DATABASE CACHE (USER SCOPED)
         ========================= */
      const dbHit = await ResumeAnalysis.findOne({
        resumeHash,
        company,
        role,
        userId: req.userId,
      }).lean();

      if (dbHit) {
        return res.json({
          success: true,
          ...dbHit,
          cached: "database",
        });
      }

      const jdEntry = COMPANY_JDS?.[company]?.[role];
      const finalJD =
        jdEntry && !isJDStale(jdEntry) ? jdEntry.jd : userJD;

      const cacheKey = crypto
        .createHash("sha256")
        .update(parsed.text + finalJD + company + role)
        .digest("hex");

      if (analysisCache.has(cacheKey)) {
        return res.json({
          success: true,
          ...analysisCache.get(cacheKey),
          cached: "memory",
        });
      }

      const analysis = await analyzeResume(parsed.text, finalJD, company);

      const matched = analysis.strengths.length;
      const missing = analysis.weaknesses.length;
      const total = matched + missing || 1;

      let overallScore = Math.round((matched / total) * 100);
      let skillsMatch = Math.min(100, overallScore + 5);
      let atsCompatibility = Math.max(0, overallScore - 5);

      const jdQuality = analyzeJDQuality(finalJD);
      if (jdQuality.isWeak) {
        overallScore = Math.min(overallScore, 65);
        skillsMatch = Math.min(skillsMatch, 70);
        atsCompatibility = Math.min(atsCompatibility, 60);
      }

      const formatAnalysis = analyzeFormat(parsed.text);
      const rejectionSummary = generateRejectionSummary({
        overallScore,
        matched,
        missing,
        jdQuality,
      });

      const payload = {
        userId: req.userId,
        analysis,
        scores: {
          overall: overallScore,
          skillsMatch,
          atsCompatibility,
          matchedRequirements: matched,
          missingRequirements: missing,
          totalRequirements: total,
          jdQuality,
        },
        rejectionSummary,
        formatAnalysis,
        meta: {
          company,
          role,
          jdSource: jdEntry ? "company-simulated-realtime" : "user",
          jdLastUpdated: jdEntry?.lastUpdated || null,
        },
      };

      analysisCache.set(cacheKey, payload);

      await ResumeAnalysis.create({
        resumeHash,
        company,
        role,
        userId: req.userId,
        ...payload,
      });

      res.json({
        success: true,
        ...payload,
        cached: false,
      });

    } catch (error) {
      console.error("ANALYZE ERROR:", error);
      res.status(500).json({
        error: "Failed to process resume",
        details: error.message,
      });
    }
  }
);

export default router;
