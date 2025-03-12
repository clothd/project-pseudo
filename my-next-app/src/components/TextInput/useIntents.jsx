import { useState, useEffect } from "react";

const useIntents = (intent, setOutput) => {
  const [availableIntents, setAvailableIntents] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    // Fetch all available intents when component mounts
    fetch("/api/intents")
      .then((res) => res.json())
      .then((patterns) => {
        // Extract pattern keys to show as suggestions
        const intentList = Object.keys(patterns).map((pattern) => {
          return pattern.replace(/\^|\$/g, ""); // Remove regex anchors
        });
        setAvailableIntents(intentList);
      });
  }, []);

  // Process intent string to code
  const processIntent = (intentText, patterns) => {
    for (const [pattern, { template, params }] of Object.entries(patterns)) {
      const regex = new RegExp(`^${pattern}$`, "i");
      const match = intentText.match(regex);

      if (match) {
        const values = match
          .slice(1)
          .map((value) =>
            params.includes("symbol") ? value.toUpperCase() : value
          );
        let code = template;
        params.forEach((param, index) => {
          code = code.replace(new RegExp(param, "g"), values[index]);
        });
        return code;
      }
    }
    return `# No match for: ${intentText}`;
  };

  // Process the intent whenever it changes
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
            pythonCode +=
              "    ".repeat(indentLevel) +
              functionCode.replace(/\n/g, "\n" + "    ".repeat(indentLevel)) +
              "\n";
            lastWasCondition = false;
          }
        }

        setOutput(pythonCode.trim());
      });
  }, [intent, setOutput]);

  return {
    availableIntents,
    suggestions,
    setSuggestions,
    processIntentToCode: processIntent
  };
};

export default useIntents;