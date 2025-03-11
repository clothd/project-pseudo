import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FiMenu, FiX, FiSave } from "react-icons/fi";

// Dynamically import Preface to improve performance
const Preface = dynamic(() => import("../components/Preface"), { ssr: false });

const TextInput = ({ setOutput, output }) => {
  const [intent, setIntent] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [email, setEmail] = useState("");
  const [savedEmail, setSavedEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Check if email exists in localStorage on component mount
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      setSavedEmail(storedEmail);
    }
  }, []);

  const saveData = async (userEmail, userPassword, userIntent) => {
    try {
      setIsSaving(true);
      const response = await fetch("/api/saveData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          password: userPassword,
          input: userIntent,
          output: output,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert("Data saved successfully!");
      } else {
        alert(`Error: ${data.error || "Failed to save data"}`);
      }
    } catch (error) {
      alert(`An error occurred: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = () => {
    const storedEmail = localStorage.getItem("userEmail");  
    setShowEmailInput(true);
  
    if (storedEmail ) {
      setSavedEmail(storedEmail);
    } 

  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email.trim() && email.includes("@") && password.trim()) {
      localStorage.setItem("userEmail", email);
      setSavedEmail(email);      
      await saveData(email, password, intent);
      setShowEmailInput(false);
    } else {
      alert("Please enter a valid email address and password");
    }
  };

  const processIntent = (intent, patterns) => {
    for (const [pattern, { template, params }] of Object.entries(patterns)) {
      const regex = new RegExp(`^${pattern}$`, "i");
      const match = intent.match(regex);

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
  return (
    <div className="relative w-1/2 h-screen bg-black text-green-500 p-4 flex">
      {/* Menu and Save Icons */}
      <div className="w-1/20 flex flex-col items-start justify-start gap-4">
        <button
          className="text-green-500 text-2xl hover:text-green-300"
          onClick={() => setShowMenu(!showMenu)}
        >
          <FiMenu />
        </button>
        <button
          className="text-green-500 text-2xl hover:text-green-300"
          onClick={handleSave}
          disabled={isSaving}
          title={savedEmail ? `Save (${savedEmail})` : "Save"}
        >
          <FiSave />
        </button>
      </div>

      {/* Email Input Popup */}
      {showEmailInput && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="border border-green-500 p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-green-500 text-xl">Enter Your Credentials</h3>
              <button
                onClick={() => setShowEmailInput(false)}
                className="text-green-500 hover:text-green-300"
              >
                <FiX className="text-red-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email"
                className="w-full p-2 mb-4 bg-black text-green-500 border border-green-500 outline-none"
                required
              />
              <input
                type="password"
                value={password}
                placeholder="password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 mb-4 bg-black text-green-500 border border-green-500 outline-none"
                required
              />
              <button
                type="submit"
                className="w-full p-2 bg-green-700 text-black hover:bg-green-600 transition-colors"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Submit"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Preface Menu */}
      {showMenu && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-90 flex items-center justify-center">
          <Preface onClose={() => setShowMenu(false)} />
        </div>
      )}

      {/* Text Input */}
      <textarea
        className="flex-grow h-full bg-black text-green-500 border border-green-500 p-2 outline-none ml-2"
        placeholder="Enter intents (e.g., 'if Buy Apple Stock then Short Google elif Sell Tesla Stock then Buy Nvidia else Short Amazon')..."
        onChange={(e) => setIntent(e.target.value)}
        value={intent}
      />
    </div>
  );
};

export default TextInput;