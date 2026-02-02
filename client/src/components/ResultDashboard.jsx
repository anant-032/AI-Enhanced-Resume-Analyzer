import React, { useMemo } from "react";
import ScoreCard from "./ScoreCard";
import Suggestions from "./Suggestions";

const ResultDashboard = ({ result }) => {
  /* =========================
     SAFE RESULT (NO EARLY RETURN)
     ========================= */
  const safeResult = result || {};

  const overallScore = Number(safeResult.score ?? 0);
  const skillsMatch = Number(safeResult.skillsMatch ?? 0);
  const atsCompatibility = Number(safeResult.atsCompatibility ?? 0);

  const strengths = safeResult.strengths || [];
  const weaknesses = safeResult.weaknesses || [];
  const improvements = safeResult.improvements || [];
  const formatAnalysis = safeResult.formatAnalysis;
  const meta = safeResult.meta || {};
  const jdQuality = safeResult?.scores?.jdQuality;

  /* =========================
     RECRUITER DECISION
     ========================= */
  const recruiterDecision = useMemo(() => {
    if (overallScore >= 75) {
      return {
        title: "Recruiter Decision: Shortlist Potential",
        color: "bg-green-50 text-green-700 border-green-200",
      };
    }
    if (overallScore >= 60) {
      return {
        title: "Recruiter Decision: Borderline",
        color: "bg-yellow-50 text-yellow-700 border-yellow-200",
      };
    }
    return {
      title: "Recruiter Decision: Reject",
      color: "bg-red-50 text-red-700 border-red-200",
    };
  }, [overallScore]);

  /* =========================
     CONFIDENCE INDICATOR
     ========================= */
  const confidence = useMemo(() => {
    if (!jdQuality) {
      return {
        level: "Low",
        color: "bg-red-50 text-red-700 border-red-200",
        reason: "Job description quality could not be verified.",
      };
    }

    if (!jdQuality.isWeak && strengths.length + weaknesses.length >= 5) {
      return {
        level: "High",
        color: "bg-green-50 text-green-700 border-green-200",
        reason:
          "Score is based on a detailed job description with sufficient evaluated requirements.",
      };
    }

    if (!jdQuality.isWeak) {
      return {
        level: "Medium",
        color: "bg-yellow-50 text-yellow-700 border-yellow-200",
        reason:
          "Job description was acceptable, but limited requirements reduce confidence slightly.",
      };
    }

    return {
      level: "Low",
      color: "bg-red-50 text-red-700 border-red-200",
      reason:
        "Job description was vague or too short, which limits scoring reliability.",
    };
  }, [jdQuality, strengths, weaknesses]);

  /* =========================
     SCORE EXPLANATION
     ========================= */
  const scoreExplanation = useMemo(() => {
    const matched = strengths.length;
    const missing = weaknesses.length;
    const total = matched + missing;

    const reasons = [];

    if (matched > 0) {
      reasons.push(`Matched ${matched} out of ${total} required skills.`);
    }
    if (missing > 0) {
      reasons.push(`${missing} required skills were missing.`);
    }
    if (formatAnalysis?.issues?.length > 0) {
      reasons.push("Resume formatting reduced ATS compatibility.");
    }

    return reasons;
  }, [strengths, weaknesses, formatAnalysis]);

  /* =========================
     EMPTY STATE
     ========================= */
  if (!result) {
    return (
      <div className="bg-linear-to-br from-gray-50 to-gray-100 border border-dashed border-gray-300 rounded-2xl p-8 text-center text-gray-500 shadow-sm col-span-full">
        <h3 className="text-xl font-semibold mb-2 text-gray-700">
          AI Analysis Results
        </h3>
        <p className="text-sm">
          Upload your resume, select a company & role, and click
          <span className="font-semibold text-blue-500"> Analyze</span>
          to see results here.
        </p>
      </div>
    );
  }

  return (
    <div className="col-span-full space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between bg-white rounded-2xl shadow-md p-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Resume Match Analysis
          </h2>
          <p className="text-sm text-gray-500">
            AI-powered evaluation against real role requirements
          </p>
        </div>

        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold text-sm">
          Match Score: {overallScore}%
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <ScoreCard
          title="Overall Resume Score"
          value={`${overallScore}%`}
          progress={overallScore}
          color="bg-green-500"
        />
        <ScoreCard
          title="Skills Match"
          value={`${skillsMatch}%`}
          progress={skillsMatch}
          color="bg-blue-500"
        />
        <ScoreCard
          title="ATS Compatibility"
          value={`${atsCompatibility}%`}
          progress={atsCompatibility}
          color="bg-purple-500"
        />
      </div>

      {/* Confidence Indicator */}
      <div className={`border rounded-2xl p-6 shadow-md ${confidence.color}`}>
        <h3 className="text-lg font-bold mb-1">
          Confidence Level: {confidence.level}
        </h3>
        <p className="text-sm leading-relaxed">{confidence.reason}</p>
      </div>

      {/* Why this score */}
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-3">
        <h3 className="text-xl font-bold text-gray-800">Why this score?</h3>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          {scoreExplanation.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>

      {/* 🔥 NEW: Missing Skills With Reasons */}
      {weaknesses.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <h3 className="text-xl font-bold text-gray-800">
            Missing Skills – Why?
          </h3>

          <ul className="space-y-3 text-sm text-gray-700">
            {weaknesses.map((w, i) => (
              <li key={i} className="border rounded-lg p-3">
                <p className="font-semibold">{w.requirement}</p>
                {w.reason && (
                  <p className="text-xs text-gray-500 mt-1">
                    Reason: {w.reason}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recruiter Decision */}
      {safeResult.rejectionSummary && (
        <div
          className={`border rounded-2xl p-6 shadow-md ${recruiterDecision.color}`}
        >
          <h3 className="text-lg font-bold mb-2">
            {recruiterDecision.title}
          </h3>
          <p className="text-sm leading-relaxed">
            {safeResult.rejectionSummary}
          </p>
        </div>
      )}

      {/* Existing Sections (Preserved) */}
      {strengths.length > 0 && <Suggestions suggestions={strengths} />}
      {improvements.length > 0 && <Suggestions suggestions={improvements} />}

      {formatAnalysis && (
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <h3 className="text-xl font-bold text-gray-800">
            Resume Format & ATS Checks
          </h3>
          {formatAnalysis.issues?.length > 0 && (
            <Suggestions suggestions={formatAnalysis.issues} />
          )}
          {formatAnalysis.warnings?.length > 0 && (
            <Suggestions suggestions={formatAnalysis.warnings} />
          )}
          {formatAnalysis.passedChecks?.length > 0 && (
            <Suggestions suggestions={formatAnalysis.passedChecks} />
          )}
        </div>
      )}
    </div>
  );
};

export default ResultDashboard;
