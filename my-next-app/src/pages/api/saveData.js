import connectDB from "../../lib/mongodb";
import JsonData from "../../models/JsonData";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  await connectDB(); // Connect to the database

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password, input, output } = req.body;

  if (!email || !password || !input || !output) {
    console.log(email, password, input, output);
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    let user = await JsonData.findOne({ email });

    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = new JsonData({ email, password: hashedPassword });
    }

    user.initialization = { input, output };
    await user.save();

    return res.status(200).json({ message: "Data saved successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
