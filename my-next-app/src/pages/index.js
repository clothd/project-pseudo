import { useState } from "react";
import TextInput from "@/components/TextInput";
import ProgramOutput from "@/components/ProgramOutput";

export default function Home() {
  const [output, setOutput] = useState("");

  return (
    <div className="flex">
      <TextInput setOutput={setOutput} />
      <ProgramOutput output={output} />
    </div>
  );
}
