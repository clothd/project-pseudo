import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { FiMenu, FiSave } from "react-icons/fi";
import SuggestionBox from "./SuggestionBox";
import EmailModal from "./EmailModal";
import useIntents from "./useIntents";
import { getCursorCoordinates } from "./text";

// Dynamically import Preface to improve performance
const Preface = dynamic(() => import("../Preface"), { ssr: false });

const TextInput = ({ setOutput, onSave }) => {
  const [intent, setIntent] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [email, setEmail] = useState("");
  const [savedEmail, setSavedEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ top: 0, left: 0 });
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const textareaRef = useRef(null);

  const { availableIntents, suggestions, setSuggestions, processIntentToCode } =
    useIntents(intent, setOutput);

  useEffect(() => {
    // Check if email exists in localStorage on component mount
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      setSavedEmail(storedEmail);
    }
  }, []);

  const handleSave = () => {
    setShowEmailInput(true);
  };

  const handleSubmitCredentials = (userEmail, userPassword) => {
    localStorage.setItem("userEmail", userEmail);
    setSavedEmail(userEmail);
    onSave(userEmail, userPassword, intent);
    setShowEmailInput(false);
  };

  // Update suggestions based on current text and cursor position
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
      const position = getCursorCoordinates(textareaRef.current);
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
        <EmailModal
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          onClose={() => setShowEmailInput(false)}
          onSubmit={handleSubmitCredentials}
        />
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
        <SuggestionBox
          suggestions={suggestions}
          selectedIndex={selectedSuggestionIndex}
          position={cursorPosition}
          onSuggestionClick={handleSuggestionClick}
        />
      )}
    </div>
  );
};

export default TextInput;
