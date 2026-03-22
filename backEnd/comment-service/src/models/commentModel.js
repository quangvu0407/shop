import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  Id: { type: String, required: true },
  description: { type: String, required: true, trim: true },
  rate: { type: Number, required: true, min: 0, max: 5 },
  date: { type: Number, required: true },
});

const commentModel =
  mongoose.models.comment || mongoose.model("comment", commentSchema);

export default commentModel;
