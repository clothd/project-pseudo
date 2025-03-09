import { useState, useEffect } from "react";

const TextInput = ({ setOutput }) => {
  const [intent, setIntent] = useState("");

  useEffect(() => {
    if (!intent.trim()) return;

    fetch("/api/intents")
      .then((res) => res.json())
      .then((data) => {
        const commands = intent.toLowerCase().split(/\s*then\s*/);
        let pythonCode = "";

        commands.forEach((cmd) => {
          const formattedCmd = cmd.trim();
          const functionCode = data[formattedCmd] || `# No match for: ${formattedCmd}`;
          pythonCode += functionCode + "\n\n";
        });

        setOutput(pythonCode.trim());
      });
  }, [intent, setOutput]);

  return (
    <div className="w-1/2 h-screen bg-black text-green-500 p-4">
      <textarea
        className="w-full h-full bg-black text-green-500 border border-green-500 p-2 outline-none"
        placeholder="Enter intents (e.g., 'Buy Apple Stock then Sell Tesla Stock')..."
        onChange={(e) => setIntent(e.target.value)}
      />
    </div>
  );
};

export default TextInput;
