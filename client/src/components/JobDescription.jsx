import React, { useState } from "react";

const JobDescription = ({ onAdd }) => {
  const [description, setDescription] = useState("");
  const [expanded, setExpanded] = useState(false);

  const handleAdd = () => {
    if (description.trim()) {
      onAdd(description);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition duration-300 flex flex-col">
      
      {/* Header */}
      <div className="mb-3">
        <h3 className="text-xl font-bold text-gray-800">
          Role Requirements (Optional)
        </h3>
        <p className="text-sm text-gray-500">
          Used only when no company-role preset is available.
        </p>
      </div>

      {/* Context Clarifier */}
      <div className="mb-4 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="mb-1 font-semibold text-gray-700">
          How this is used:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            If you select a company & role, AI uses real hiring-style requirements.
          </li>
          <li>
            This field is for <span className="font-medium">custom roles</span> or
            when applying to startups or unknown companies.
          </li>
          <li>
            Weak or vague descriptions will reduce score confidence.
          </li>
        </ul>
      </div>

      {/* Toggle (UX improvement, no removal) */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-blue-600 hover:underline self-start mb-2"
      >
        {expanded ? "Hide manual role description" : "Add manual role description"}
      </button>

      {/* Textarea */}
      {expanded && (
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={`Example:
Frontend Developer role requiring React, REST APIs,
state management, and responsive UI development.`}
          rows={6}
          className="
            w-full 
            resize-none 
            border border-gray-300 
            rounded-xl 
            p-4 
            text-gray-900 
            placeholder-gray-400 
            text-sm 
            focus:outline-none 
            focus:ring-2 
            focus:ring-blue-500 
            focus:border-blue-500 
            bg-gray-50
            transition
          "
        />
      )}

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {description.length} characters
        </span>

        <button
          onClick={handleAdd}
          disabled={!description.trim()}
          className={`px-5 py-2 rounded-lg font-semibold transition
            ${
              description.trim()
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
        >
          Save Role Info
        </button>
      </div>
    </div>
  );
};

export default JobDescription;
