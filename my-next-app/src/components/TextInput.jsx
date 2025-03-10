import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FiMenu, FiX } from "react-icons/fi";

// Dynamically import Preface to improve performance
const Preface = dynamic(() => import("../components/Preface"), { ssr: false });

const TextInput = ({ setOutput }) => {
  const [intent, setIntent] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  const processIntent = (intent, patterns) => {
    for (const [pattern, { template, params }] of Object.entries(patterns)) {
      const regex = new RegExp(`^${pattern}$`, 'i');
      const match = intent.match(regex);
      
      if (match) {
        const values = match.slice(1).map(value => 
          params.includes('symbol') ? value.toUpperCase() : value
        );
        let code = template;
        params.forEach((param, index) => {
          code = code.replace(new RegExp(param, 'g'), values[index]);
        });
        return code;
      }
    }
    return `# No match for: ${intent}`;
  };
  
  // In your useEffect:
  useEffect(() => {
    if (!intent.trim()) return;
  
    fetch("/api/intents")
      .then((res) => res.json())
      .then((patterns) => {
        const lines = intent.toLowerCase().split(/\s*(if|elif|else|then)\s*/);
        let pythonCode = "";
        let indentLevel = 0;
        let lastWasCondition = false;
  
        for (let i = 0; i < lines.length; i++) {
          let cmd = lines[i].trim();
          if (!cmd) continue;
  
          if (cmd === "if" || cmd === "elif") {
            indentLevel = 1;
            pythonCode += `${cmd} condition_here:\n`;
            lastWasCondition = true;
          } else if (cmd === "else") {
            indentLevel = 1;
            pythonCode += "else:\n";
            lastWasCondition = true;
          } else if (cmd === "then") {
            continue;
          } else {
            const functionCode = processIntent(cmd, patterns);
            if (lastWasCondition) {
              indentLevel = 2;
            }
            pythonCode += "    ".repeat(indentLevel) + functionCode.replace(/\n/g, "\n" + "    ".repeat(indentLevel)) + "\n";
            lastWasCondition = false;
          }
        }
  
        setOutput(pythonCode.trim());
      });
  }, [intent, setOutput]);

  return (
    <div className="relative w-1/2 h-screen bg-black text-green-500 p-4 flex">
      {/* Menu Icon */}
      <div className="w-1/20 flex items-start justify-start">
        <button
          className="text-green-500 text-2xl hover:text-green-300"
          onClick={() => setShowMenu(!showMenu)}
        >
          <FiMenu />
        </button>
      </div>

      {/* Preface Menu */}
      {showMenu && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-90 flex items-center justify-center">
          <Preface onClose={() => setShowMenu(false)} />
        </div>
      )}

      {/* Text Input */}
      <textarea
        className="flex-grow h-full bg-black text-green-500 border border-green-500 p-2 outline-none"
        placeholder="Enter intents (e.g., 'if Buy Apple Stock then Short Google elif Sell Tesla Stock then Buy Nvidia else Short Amazon')..."
        onChange={(e) => setIntent(e.target.value)}
      />
    </div>
  );
};

export default TextInput;
