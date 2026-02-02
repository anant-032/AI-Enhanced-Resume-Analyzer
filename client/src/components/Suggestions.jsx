import React from "react";

const Suggestions = ({ suggestions }) => {
  if (!Array.isArray(suggestions) || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="relative bg-white rounded-2xl shadow-lg p-6 transition duration-300 overflow-hidden w-full">
      {/* Decorative Accent */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500 opacity-10 rounded-full" />

      {/* Header */}
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Analysis Details
      </h3>

      {/* Suggestions List */}
      <ul className="space-y-4">
        {suggestions.map((item, index) => {
          /* =========================
             CASE 1: Plain string
             ========================= */
          if (typeof item === "string") {
            return (
              <li
                key={index}
                className="w-full bg-gray-50 p-4 rounded-xl"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>

                  <p className="text-gray-700 text-sm leading-relaxed break-words w-full">
                    {item}
                  </p>
                </div>
              </li>
            );
          }

          /* =========================
             CASE 2: ATS-style object
             ========================= */
          if (typeof item === "object" && item !== null) {
            const requirementText =
              item.requirement ||
              item.skill ||
              item.expectation ||
              "Unspecified requirement detected from job description";

            const matchStatus = item.match || "Missing";
            const reason = item.reason;

            return (
              <li
                key={index}
                className="w-full bg-gray-50 p-4 rounded-xl space-y-2"
              >
                <p className="text-sm font-semibold text-gray-800 break-words">
                  Requirement:
                  <span className="font-normal text-gray-700 ml-1">
                    {requirementText}
                  </span>
                </p>

                <p
                  className={`text-xs font-medium ${
                    matchStatus === "Matched"
                      ? "text-green-600"
                      : matchStatus === "Partial"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  Match Status: {matchStatus}
                </p>

                {/* 🔹 NEW: Reason (if provided by ATS) */}
                {reason && (
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Reason: {reason}
                  </p>
                )}
              </li>
            );
          }

          return null;
        })}
      </ul>
    </div>
  );
};

export default Suggestions;
