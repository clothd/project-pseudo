import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { FiMenu, FiX, FiSave } from "react-icons/fi";

// Dynamically import Preface to improve performance
const Preface = dynamic(() => import("../components/Preface"), { ssr: false });

const TextInput = ({ setOutput, onSave }) => {
  const [intent, setIntent] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [email, setEmail] = useState("");
  const [savedEmail, setSavedEmail] = useState("");
  const [password, setPassword] = useState("");
  // New state for suggestions
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ top: 0, left: 0 });
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const textareaRef = useRef(null);
  const [availableIntents, setAvailableIntents] = useState([]);

  useEffect(() => {
    // Check if email exists in localStorage on component mount
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      setSavedEmail(storedEmail);
    }

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

  const handleSave = () => {
    const storedEmail = localStorage.getItem("userEmail");
    setShowEmailInput(true);

    if (storedEmail) {
      setSavedEmail(storedEmail);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email.trim() && email.includes("@") && password.trim()) {
      localStorage.setItem("userEmail", email);
      setSavedEmail(email);
      // Call the parent's onSave function instead of directly calling the API
      onSave(email, password, intent);
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

  // Get the exact cursor coordinates
  const getCursorCoordinates = () => {
    if (!textareaRef.current) return { top: 0, left: 0 };

    const textarea = textareaRef.current;
    const selectionEnd = textarea.selectionEnd;

    // Create a hidden div to measure text
    const div = document.createElement("div");
    div.style.position = "absolute";
    div.style.top = "0";
    div.style.left = "0";
    div.style.visibility = "hidden";
    div.style.whiteSpace = "pre-wrap";
    div.style.wordWrap = "break-word";
    div.style.overflow = "hidden";
    div.style.fontSize = window.getComputedStyle(textarea).fontSize;
    div.style.fontFamily = window.getComputedStyle(textarea).fontFamily;
    div.style.lineHeight = window.getComputedStyle(textarea).lineHeight;
    div.style.padding = window.getComputedStyle(textarea).padding;
    div.style.width = window.getComputedStyle(textarea).width;

    // Create a span at cursor position
    const textBeforeCursor = textarea.value.substring(0, selectionEnd);
    div.textContent = textBeforeCursor;
    const span = document.createElement("span");
    span.id = "cursor-position-span";
    div.appendChild(span);

    document.body.appendChild(div);

    // Get the position of the span
    const rect = span.getBoundingClientRect();
    const textareaRect = textarea.getBoundingClientRect();

    // Clean up the DOM
    document.body.removeChild(div);

    // Return the position relative to the textarea
    return {
      top:
        rect.top -
        textareaRect.top +
        textarea.scrollTop +
        parseInt(window.getComputedStyle(textarea).lineHeight),
      left: rect.left - textareaRect.left + textarea.scrollLeft,
    };
  };

  // Function to update suggestions based on current text and cursor position
  const updateSuggestions = () => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const text = textarea.value;
    const cursorPos = textarea.selectionStart;

    // Find the current word being typed
    let startPos = cursorPos;
    while (startPos > 0 && !/\s/.test(text.charAt(startPos - 1))) {
      startPos--;
    }

    const currentWord = text.substring(startPos, cursorPos).toLowerCase();

    if (currentWord.length < 1) {
      setShowSuggestions(false);
      return;
    }

    // Filter available intents that match the current word
    const matchingSuggestions = availableIntents.filter((intent) =>
      intent.toLowerCase().startsWith(currentWord)
    );

    if (matchingSuggestions.length > 0) {
      setSuggestions(matchingSuggestions);
      setSelectedSuggestionIndex(0);
      setShowSuggestions(true);

      // Calculate exact cursor position
      const position = getCursorCoordinates();
      setCursorPosition(position);
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle text input change
  const handleIntentChange = (e) => {
    setIntent(e.target.value);
    updateSuggestions();
  };

  // Handle clicking on a suggestion
  const handleSuggestionClick = (suggestion) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const text = textarea.value;
    const cursorPos = textarea.selectionStart;

    // Find the start of the current word
    let startPos = cursorPos;
    while (startPos > 0 && !/\s/.test(text.charAt(startPos - 1))) {
      startPos--;
    }

    // Replace the current word with the selected suggestion
    const newText =
      text.substring(0, startPos) + suggestion + text.substring(cursorPos);
    setIntent(newText);

    // Set cursor position after the inserted suggestion
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        startPos + suggestion.length,
        startPos + suggestion.length
      );
      setShowSuggestions(false);
    }, 0);
  };

  // Handle keyboard navigation in suggestions
  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Tab":
      case "Enter":
        if (suggestions.length > 0) {
          e.preventDefault();
          handleSuggestionClick(suggestions[selectedSuggestionIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        break;
    }
  };

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
              >
                Submit
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
        ref={textareaRef}
        className="flex-grow h-full bg-black text-green-500 border border-green-500 p-2 outline-none ml-2"
        placeholder="Enter intents (e.g., 'if Buy Apple Stock then Short Google elif Sell Tesla Stock then Buy Nvidia else Short Amazon')..."
        onChange={handleIntentChange}
        onKeyDown={handleKeyDown}
        onClick={updateSuggestions}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
        onFocus={updateSuggestions}
        value={intent}
      />

      {/* Suggestions Box */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          className="absolute bg-black border border-green-500 text-green-500 z-10 max-h-60 overflow-y-auto"
          style={{
            top: `${cursorPosition.top+30}px`,
            left: `${cursorPosition.left+120}px`,
            width: "300px",
          }}
        >
          <ul>
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className={`p-1 cursor-pointer hover:bg-green-900 ${
                  index === selectedSuggestionIndex ? "bg-green-800" : ""
                }`}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <span className="text-blue-500">●</span> {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TextInput;
