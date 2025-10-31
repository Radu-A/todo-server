import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: false,
    },
    googleId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // Añade automáticamente createdAt y updatedAt
  }
);

const User = mongoose.model("User", userSchema);

// Exportación ESM
export default User;
