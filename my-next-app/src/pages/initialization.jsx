import { useState } from "react";
import TextInput from "../components/TextInput/index";
import ProgramOutput from "@/components/ProgramOutput";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const [output, setOutput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  if (user) {
    localStorage.setItem("email", user.email);
  }
  const saveData = async (email, password, intent) => {
    try {
      setIsSaving(true);
      const response = await fetch("/api/saveData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          input: intent,
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

  return (
    <div className="flex">
      <TextInput setOutput={setOutput} output={output} onSave={saveData} />
      <ProgramOutput output={output} />
      {isSaving && <div>Saving...</div>}
    </div>
  );
}
