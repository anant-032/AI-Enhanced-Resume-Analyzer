import React, { useState, useMemo } from "react";
import ResumeUpload from "../components/ResumeUpload";
import JobDescription from "../components/JobDescription";
import AnalyzeButton from "../components/AnalyzeButton";
import ResultDashboard from "../components/ResultDashboard";

/* =========================
   COMPANY → ROLE → JD PRESETS
   ========================= */
const JD_PRESETS = {
  Google: {
    "Software Engineer": `
Requirements:
- Strong knowledge of Data Structures and Algorithms
- Proficiency in Java, C++, Python, or Go
- Experience building scalable backend systems
- System design fundamentals
- APIs, databases, distributed systems
`,
    "Frontend Engineer": `
Requirements:
- JavaScript, HTML, CSS expertise
- React or similar frameworks
- Performance optimization
- Accessibility and cross-browser support
`,
    "Backend Engineer": `
Requirements:
- Backend development experience
- REST and GraphQL APIs
- Databases and caching systems
- Distributed systems fundamentals
`,
  },

  Amazon: {
    "SDE I": `
Requirements:
- Strong coding skills in Java/C++/Python
- Problem solving and debugging
- Basic system design understanding
`,
    "SDE II": `
Requirements:
- Designing scalable systems
- Ownership of services
- AWS experience preferred
`,
  },

  Startup: {
    "Full Stack Developer": `
Requirements:
- JavaScript, React, Node.js
- REST APIs and databases
- Deployment and DevOps basics
`,
  },
};

const Dashboard = () => {
  const [uploadedResume, setUploadedResume] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [company, setCompany] = useState("General");
  const [role, setRole] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  /* =========================
     RESOLVED JD
     ========================= */
  const resolvedJD = useMemo(() => {
    if (
      company !== "General" &&
      role &&
      JD_PRESETS[company] &&
      JD_PRESETS[company][role]
    ) {
      return JD_PRESETS[company][role];
    }
    return jobDesc;
  }, [company, role, jobDesc]);

  const jdSource =
    company !== "General" && role ? "company" : "manual";

  const handleAnalyze = async () => {
    if (!uploadedResume || !resolvedJD) return;

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Session expired. Please login again.");
      handleLogout();
      return;
    }

    setLoading(true);
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append("resume", uploadedResume);
    formData.append("jobDescription", resolvedJD);
    formData.append("company", company);
    formData.append("role", role);

    try {
      const response = await fetch("http://localhost:5000/api/analyze", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // 🔒 FIX
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setAnalysisResult({
        score: data.scores.overall,
        skillsMatch: data.scores.skillsMatch,
        atsCompatibility: data.scores.atsCompatibility,
        strengths: data.analysis.strengths,
        weaknesses: data.analysis.weaknesses,
        improvements: data.analysis.improvements,
        formatAnalysis: data.formatAnalysis,
        rejectionSummary: data.rejectionSummary,
        scores: data.scores,
        meta: {
          company,
          role,
          jdSource,
        },
      });
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          AI Resume Analyzer
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-5 py-2 rounded-lg"
        >
          Logout
        </button>
      </nav>

      <main className="p-8 max-w-7xl mx-auto">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <ResumeUpload onUpload={setUploadedResume} />

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-2">Company</h3>
            <select
              value={company}
              onChange={(e) => {
                setCompany(e.target.value);
                setRole("");
              }}
              className="w-full border rounded-lg p-2"
            >
              <option>General</option>
              {Object.keys(JD_PRESETS).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-2">Role</h3>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border rounded-lg p-2"
              disabled={!JD_PRESETS[company]}
            >
              <option value="">Select role</option>
              {JD_PRESETS[company] &&
                Object.keys(JD_PRESETS[company]).map((r) => (
                  <option key={r}>{r}</option>
                ))}
            </select>
          </div>

          <JobDescription
            onAdd={setJobDesc}
            disabled={jdSource === "company"}
          />

          <AnalyzeButton
            resume={uploadedResume}
            jobDescription={resolvedJD}
            loading={loading}
            onAnalyze={handleAnalyze}
          />

          <ResultDashboard result={analysisResult} />
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
