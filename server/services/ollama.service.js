function extractJSON(text) {
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("No JSON object found in model output");
  }

  const jsonString = text.slice(firstBrace, lastBrace + 1);
  return JSON.parse(jsonString);
}

/* =========================
   NORMALIZATION HELPERS
   ========================= */
function normalizeList(list, defaultMatch = null) {
  if (!Array.isArray(list)) return [];

  return list
    .map(item => {
      if (typeof item === "object" && item !== null) {
        return {
          requirement: String(
            item.requirement ||
            item.skill ||
            item.name ||
            "Unspecified requirement from job description"
          ),
          match: item.match || defaultMatch,
        };
      }

      if (typeof item === "string") {
        return {
          requirement: item,
          match: defaultMatch,
        };
      }

      return null;
    })
    .filter(Boolean);
}

/* =========================
   REQUIRED SKILLS NORMALIZER
   ========================= */
function normalizeRequiredSkills(list) {
  if (!Array.isArray(list)) return [];

  return list
    .map(item => {
      if (!item || typeof item !== "object" || !item.skill) return null;

      return {
        requirement: String(item.skill),
        match: item.present === true ? "Matched" : "Missing",
        reason: item.reason ? String(item.reason) : null
      };
    })
    .filter(Boolean);
}

export async function analyzeResume(
  resumeText,
  jobDescription = "",
  company = "General"
) {
  const prompt = `
You are a STRICT ATS (Applicant Tracking System).

NON-NEGOTIABLE RULES:
- The Job Description is the ONLY source of requirements
- Do NOT infer skills
- Do NOT assume role similarity
- If a skill is not explicitly written in the JD, IGNORE IT
- If JD lacks clear requirements, return an EMPTY required_skills array
- Be deterministic. No creativity.

TASK:
For EACH REQUIRED SKILL found in the Job Description:
- Check if it exists in the Resume text
- Mark present: true or false
- If false, briefly state WHY (missing keyword, no evidence)

RETURN STRICT JSON ONLY.
NO MARKDOWN. NO COMMENTS. NO EXTRA TEXT.

JSON FORMAT (EXACT):

{
  "summary": "",
  "required_skills": [
    {
      "skill": "",
      "present": true,
      "reason": ""
    }
  ],
  "improvements": []
}

JOB DESCRIPTION:
"""${jobDescription || "Not provided"}"""

RESUME:
"""${resumeText}"""
`;

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3",
      prompt,
      stream: false,
      options: {
        temperature: 0,
        top_p: 0.05,
        repeat_penalty: 1.2
      }
    }),
  });

  if (!response.ok) {
    throw new Error("Ollama request failed");
  }

  const data = await response.json();

  try {
    const parsed = extractJSON(data.response);

    /* =========================
       HARD ATS DERIVATION
       ========================= */
    const requiredSkills = normalizeRequiredSkills(parsed.required_skills);

    const strengths = requiredSkills.filter(
      r => r.match === "Matched"
    );

    const weaknesses = requiredSkills.filter(
      r => r.match === "Missing"
    );

    return {
      summary: String(parsed.summary || ""),

      // compatibility preserved
      skills: requiredSkills,

      strengths,
      weaknesses,

      improvements: normalizeList(parsed.improvements),
    };

  } catch (err) {
    console.error("RAW MODEL OUTPUT ↓↓↓");
    console.error(data.response);
    console.error("RAW MODEL OUTPUT ↑↑↑");
    throw new Error("Ollama returned invalid JSON");
  }
}
