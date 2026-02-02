import React from "react";

const ScoreCard = ({ title, value, progress, color, explanation }) => {
  return (
    <div className="relative bg-white rounded-2xl shadow-lg p-6 overflow-hidden hover:shadow-2xl transition duration-300">
      
      {/* Decorative Accent */}
      <div
        className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2`}
      />

      {/* Title */}
      <h4 className="text-sm font-semibold text-gray-500 mb-2">
        {title}
      </h4>

      {/* Value */}
      <div className="text-3xl font-extrabold text-gray-800 mb-2">
        {value}
      </div>

      {/* Explanation (NEW) */}
      {explanation && (
        <p className="text-xs text-gray-500 mb-3 leading-snug">
          {explanation}
        </p>
      )}

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`${color} h-3 rounded-full transition-all duration-700`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Progress Label */}
      <p className="text-xs text-gray-400 mt-2">
        {progress}% match
      </p>
    </div>
  );
};

export default ScoreCard;
