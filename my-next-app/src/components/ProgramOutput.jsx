const ProgramOutput = ({ output }) => {
    return (
      <div className="w-1/2 h-screen bg-gray-900 text-green-400 p-4">
        <pre className="whitespace-pre-wrap">{output || "Incoming..."}</pre>
      </div>
    );
  };
  
  export default ProgramOutput;
  