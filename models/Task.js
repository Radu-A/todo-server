import mongoose from "mongoose";

const Schema = mongoose.Schema;

const taskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    status: { type: String, enum: ["todo", "done"], default: "todo" },
    userId: { type: Schema.Types.ObjectId, required: true },
    position: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;
