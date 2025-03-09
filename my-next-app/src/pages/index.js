import { useState } from "react";
import TextInput from "@/components/TextInput";
import ProgramOutput from "@/components/ProgramOutput";

export default function Home() {
  const [intent, setIntent] = useState("");

  return (
    <div className="flex">
      <TextInput onChange={setIntent} />
      <ProgramOutput output={intent} />
    </div>
  );
}
