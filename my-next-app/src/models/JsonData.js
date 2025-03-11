import mongoose from "mongoose";

const jsonDataSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    initialization: { type: Object, default: {} },
    buy: { type: Object, default: {} },
    sell: { type: Object, default: {} },
    buy_back: { type: Object, default: {} },
  },
  { timestamps: true }
);

export default mongoose.models.JsonData ||
  mongoose.model("JsonData", jsonDataSchema);
