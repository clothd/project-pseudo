
import { useRouter } from "next/router";
import { FiX } from "react-icons/fi";

const Preface = ({ onClose }) => {
  const router = useRouter();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90">
      <div className="relative bg-black text-green-400 p-6 border-2 border-green-500 shadow-lg text-center">
        {/* Close Icon */}
        <button
          className="absolute top-2 right-2 text-green-400 text-2xl hover:text-red-500"
          onClick={onClose}
        >
          <FiX />
        </button>
        
        <h2 className="text-2xl mb-4 font-mono">Choose Your Path</h2>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => router.push("/initialization")}
            className="px-4 py-2 border border-green-400 hover:bg-green-700 hover:text-black transition-all duration-200"
          >
            Initialization
          </button>
          <button
            onClick={() => router.push("/warm-up")}
            className="px-4 py-2 border border-green-400 hover:bg-green-700 hover:text-black transition-all duration-200"
          >
            Warm up
          </button>
          <button
            onClick={() => router.push("/strategy")}
            className="px-4 py-2 border border-green-400 hover:bg-green-700 hover:text-black transition-all duration-200"
          >
            Strategy
          </button>
        </div>
      </div>
    </div>
  );
};

export default Preface;
