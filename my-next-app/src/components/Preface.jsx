import { useState } from "react";
import { useRouter } from "next/router";
import { FiX } from "react-icons/fi";

const Preface = ({ onClose }) => {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLoadGame = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/getUserData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to load data");
      }

      console.log("User data:", data); // Handle user data (e.g., set state)
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90">
      <div className="relative bg-black text-green-400 p-6 border-2 border-green-500 shadow-lg text-center w-80">
        {/* Close Icon */}
        <button
          className="absolute top-2 right-2 text-green-400 text-2xl hover:text-red-500"
          onClick={onClose}
        >
          <FiX />
        </button>

        <h2 className="text-2xl mb-4 font-mono">Choose Your Path</h2>

        {/* Main Options */}
        {!selectedOption && (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setSelectedOption("load")}
              className="px-4 py-2 border border-green-400 bg-black text-green-400 hover:bg-green-800 hover:text-black transition-all duration-200"
            >
              LOAD
            </button>
            <button
              onClick={() => setSelectedOption("new")}
              className="px-4 py-2 border border-green-400 hover:bg-green-700 hover:text-black transition-all duration-200"
            >
              NEW
            </button>
          </div>
        )}

        {/* Load Strategy Options */}
        {selectedOption === "load" && (
          <div className="flex flex-col gap-2 mt-2">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-2 border border-green-400 bg-black text-green-400 focus:outline-none"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-3 py-2 border border-green-400 bg-black text-green-400 focus:outline-none"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              onClick={handleLoadGame}
              className="px-4 py-2 border border-green-400 hover:bg-green-700 hover:text-black transition-all duration-200"
              disabled={loading}
            >
              {loading ? "Loading..." : "Submit"}
            </button>
            <button
              onClick={() => setSelectedOption(null)}
              className="text-sm text-red-400 mt-2 hover:text-red-500"
            >
              Back
            </button>
          </div>
        )}

        {/* New Strategy Options */}
        {selectedOption === "new" && (
          <div className="flex flex-col gap-2 mt-2">
            <button onClick={() => router.push("/initialization")} className="px-4 py-2 border border-green-400 hover:bg-green-700 hover:text-black transition-all duration-200">
              Initialization
            </button>
            <button onClick={() => router.push("/buy")} className="px-4 py-2 border border-green-400 hover:bg-green-700 hover:text-black transition-all duration-200">
              Buy
            </button>
            <button onClick={() => router.push("/sell")} className="px-4 py-2 border border-green-400 hover:bg-green-700 hover:text-black transition-all duration-200">
              Sell
            </button>
            <button onClick={() => router.push("/buy_back")} className="px-4 py-2 border border-green-400 hover:bg-green-700 hover:text-black transition-all duration-200">
              Buy Back
            </button>
            <button
              onClick={() => setSelectedOption(null)}
              className="text-sm text-red-400 mt-2 hover:text-red-500"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Preface;
