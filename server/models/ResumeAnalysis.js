import mongoose from "mongoose";

const ResumeAnalysisSchema = new mongoose.Schema(
  {
    resumeHash: { type: String, required: true, index: true },

    company: String,
    role: String,

    jdSource: String,
    jdLastUpdated: Date,

    scores: {
      overall: Number,
      skillsMatch: Number,
      atsCompatibility: Number,
      matchedRequirements: Number,
      missingRequirements: Number,
      totalRequirements: Number,
      jdQuality: Object,
    },

    analysis: {
      strengths: Array,
      weaknesses: Array,
      improvements: Array,
    },

    formatAnalysis: Object,
    rejectionSummary: String,
  },
  { timestamps: true }
);

export default mongoose.model("ResumeAnalysis", ResumeAnalysisSchema);
