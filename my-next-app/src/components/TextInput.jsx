const TextInput = ({ onChange }) => {
    return (
      <div className="w-1/2 h-screen bg-black text-green-500 p-4">
        <textarea
          className="w-full h-full bg-black text-green-500 border border-green-500 p-2 outline-none"
          placeholder="Enter intent..."
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  };
  
  export default TextInput;
  