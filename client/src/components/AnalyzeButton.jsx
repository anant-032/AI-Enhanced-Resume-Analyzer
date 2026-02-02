import React from "react";

const AnalyzeButton = ({ resume, jobDescription, onAnalyze, loading }) => {
  /* =========================
     JD QUALITY ENFORCEMENT
     ========================= */

  const jdText = jobDescription.trim();

  const jdTooShort = jdText.length < 80;

  const keywordList = [
    "experience",
    "skills",
    "responsibilities",
    "requirements",
    "knowledge",
    "proficiency",
    "develop",
    "design",
    "implement",
    "framework",
    "frontend",
    "backend",
    "database",
    "api",
    "testing",
    "deployment"
  ];

  const keywordMatches = keywordList.filter(keyword =>
    jdText.toLowerCase().includes(keyword)
  ).length;

  const jdTooVague = keywordMatches < 3;

  const jdInvalid = jdTooShort || jdTooVague;

  const isDisabled = !resume || jdInvalid || loading;

  /* =========================
     UI MESSAGE LOGIC
     ========================= */

  let statusMessage = "Ready to analyze your resume";

  if (!resume) {
    statusMessage = "Upload a resume to enable analysis";
  } else if (jdTooShort) {
    statusMessage = "Job description is too short (add more details)";
  } else if (jdTooVague) {
    statusMessage = "Job description is too vague (add responsibilities & skills)";
  } else if (loading) {
    statusMessage = "Analyzing resume…";
  }

  return (
    <div className="bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white hover:shadow-2xl transition duration-300 flex flex-col justify-between">
      
      <h3 className="text-xl font-bold mb-2">AI Resume Analysis</h3>

      <p className="text-sm text-blue-100 mb-6">
        Our AI analyzes your resume strictly against the job description.
        Low-quality job descriptions are automatically rejected.
      </p>

      <button
        onClick={onAnalyze}
        disabled={isDisabled}
        className={`w-full py-3 rounded-xl font-semibold text-lg transition duration-300
          flex items-center justify-center gap-3
          ${
            isDisabled
              ? "bg-white/40 text-gray-700 cursor-not-allowed"
              : "bg-white text-blue-600 hover:bg-blue-100"
          }`}
      >
        {loading && (
          <span className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
        )}
        <span>
          {loading ? "Analyzing Resume…" : "🚀 Analyze Resume"}
        </span>
      </button>

      <p className="text-xs text-blue-100 mt-4 text-center">
        {statusMessage}
      </p>
    </div>
  );
};

export default AnalyzeButton;
