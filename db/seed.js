import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./connect.js";
import User from "../models/User.js";
import Task from "../models/Task.js";

dotenv.config();

// Fixed temporary ID for the user we are creating
const DUMMY_USER_ID = "60c72b1f9b1e8b0015f4a6e5";

const seedDB = async () => {
  try {
    // 1. Connect to MongoDB Atlas
    await connectDB();
    console.log("✅ MongoDB connection established for seeding.");

    // 2. CLEANUP: Delete existing data
    await User.deleteMany({});
    await Task.deleteMany({});
    console.log("🗑️ Existing User and Task data deleted.");

    // 3. CREATE DUMMY USER
    const dummyUser = new User({
      _id: new mongoose.Types.ObjectId(DUMMY_USER_ID),
      username: "Test",
      email: "test@example.com",
      password: "$2a$12$im3wfbo.IrHZvNEOpreeieOlW5TjCeF9892BI7YI/iTh2bU5YS4Ay", // password-123
      googleId: null,
    });

    await dummyUser.save();
    console.log(
      `👤 Dummy user '${dummyUser.username}' created with ID: ${DUMMY_USER_ID}`
    );

    // 4. CREATE TEST TASKS & ASSIGN POSITIONS
    // Position counters for each status list
    let todoPosition = 0;
    let donePosition = 0;

    const initialTasks = [
      {
        title: "Set up the Express server",
        status: "done",
        userId: DUMMY_USER_ID,
      },
      {
        title: "Define Mongoose schemas (User and Task)",
        status: "done",
        userId: DUMMY_USER_ID,
      },
      {
        title: "Implement the seeding script",
        status: "done",
        userId: DUMMY_USER_ID,
      },
      {
        title: "Create the POST /tasks route",
        status: "todo",
        userId: DUMMY_USER_ID,
      },
      {
        title: "Connect the Frontend (fetch/axios)",
        status: "todo",
        userId: DUMMY_USER_ID,
      },
      {
        title: "Study the differences between PATCH and PUT",
        status: "todo",
        userId: DUMMY_USER_ID,
      },
    ];

    // 5. MAP: Assign the correct position to each task based on its status
    const tasksWithPositions = initialTasks.map((task) => {
      let position;
      if (task.status === "todo") {
        position = todoPosition++;
      } else if (task.status === "done") {
        position = donePosition++;
      }
      return { ...task, position };
    });

    await Task.insertMany(tasksWithPositions);
    console.log(
      `📝 ${tasksWithPositions.length} initial tasks loaded successfully (with positions).`
    );
  } catch (error) {
    console.error("❌ Error during seeding:", error.message);
  } finally {
    // 6. Disconnect
    await mongoose.disconnect();
    console.log("🔌 MongoDB connection closed.");
  }
};

seedDB();
