import React from "react";

const SuggestionBox = ({ suggestions, selectedIndex, position, onSuggestionClick }) => {
  return (
    <div
      className="absolute bg-black border border-green-500 text-green-500 z-10 max-h-60 overflow-y-auto"
      style={{
        top: `${position.top + 30}px`,
        left: `${position.left + 120}px`,
        width: "300px",
      }}
    >
      <ul>
        {suggestions.map((suggestion, index) => (
          <li
            key={index}
            className={`p-1 cursor-pointer hover:bg-green-900 ${
              index === selectedIndex ? "bg-green-800" : ""
            }`}
            onClick={() => onSuggestionClick(suggestion)}
          >
            <span className="text-blue-500">●</span> {suggestion}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SuggestionBox;