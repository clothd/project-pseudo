import { useState, useEffect } from "react";

const TextInput = ({ setOutput }) => {
  const [intent, setIntent] = useState("");

  useEffect(() => {
    if (!intent.trim()) return;

    fetch("/api/intents")
      .then((res) => res.json())
      .then((data) => {
        const lines = intent.toLowerCase().split(/\s*(if|elif|else|then)\s*/);
        let pythonCode = "";
        let indentLevel = 0;
        let lastWasCondition = false;

        for (let i = 0; i < lines.length; i++) {
          let cmd = lines[i].trim();
          if (!cmd) continue;

          if (cmd === "if" || cmd === "elif") {
            indentLevel = 1;
            pythonCode += `${cmd} condition_here:\n`; // Placeholder for condition
            lastWasCondition = true;
          } else if (cmd === "else") {
            indentLevel = 1;
            pythonCode += "else:\n";
            lastWasCondition = true;
          } else if (cmd === "then") {
            continue; // 'then' is just a separator, no need to add it in Python syntax
          } else {
            const functionCode = data[cmd] || `# No match for: ${cmd}`;
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
    <div className="w-1/2 h-screen bg-black text-green-500 p-4">
      <textarea
        className="w-full h-full bg-black text-green-500 border border-green-500 p-2 outline-none"
        placeholder="Enter intents (e.g., 'if Buy Apple Stock then Short Google elif Sell Tesla Stock then Buy Nvidia else Short Amazon')..."
        onChange={(e) => setIntent(e.target.value)}
      />
    </div>
  );
};

export default TextInput;
