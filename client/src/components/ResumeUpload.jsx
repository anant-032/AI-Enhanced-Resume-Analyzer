import React, { useState } from "react";

const ResumeUpload = ({ onUpload }) => {
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      onUpload(file);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition duration-300 flex flex-col justify-between">
      
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-gray-800">
          Upload Resume
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Upload your resume (PDF or DOCX) for AI analysis.
        </p>
      </div>

      {/* Upload Box */}
      <label
        htmlFor="resume-upload"
        className="cursor-pointer border-2 border-dashed border-blue-400 rounded-xl p-6 text-center hover:bg-blue-50 transition"
      >
        <input
          id="resume-upload"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="text-blue-500 text-4xl mb-2">📄</div>
        <p className="text-gray-700 font-medium">
          Click to upload resume
        </p>
        <p className="text-xs text-gray-400 mt-1">
          PDF, DOC, DOCX (Max 2MB)
        </p>
      </label>

      {/* File Info */}
      {fileName && (
        <div className="mt-4 bg-green-50 text-green-700 text-sm p-3 rounded-lg">
          ✅ Uploaded: <span className="font-medium">{fileName}</span>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
