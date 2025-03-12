import React from "react";
import { FiX } from "react-icons/fi";

const EmailModal = ({ email, setEmail, password, setPassword, onClose, onSubmit }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim() && email.includes("@") && password.trim()) {
      onSubmit(email, password);
    } else {
      alert("Please enter a valid email address and password");
    }
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="border border-green-500 p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-green-500 text-xl">Enter Your Credentials</h3>
          <button
            onClick={onClose}
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
  );
};

export default EmailModal;