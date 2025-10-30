import Task from "../models/Task.js";

// ===================================
// 1. GET TASKS
// ===================================
const getTasks = async (req, res) => {
  // Get userId from the auth middleware
  const { userId } = req.user;

  try {
    // Find all tasks for the user and sort them by 'position' ascending.
    const tasks = await Task.find({ userId: userId }).sort({ position: 1 });

    return res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return res.status(500).json({
      message: "Server error while fetching tasks",
      error: error.message,
    });
  }
};

// ===================================
// 2. CREATE TASK
// ===================================
const createTask = async (req, res) => {
  const { title } = req.body;
  const { userId } = req.user;

  if (!title) {
    return res.status(400).json({ message: "Task title is required." });
  }

  try {
    const newTask = new Task({
      title,
      userId: userId, // Assign the authenticated user's ID
    });
    const savedTask = await newTask.save();
    return res.status(201).json(savedTask);
  } catch (error) {
    console.error("Error creating task:", error);
    return res.status(500).json({
      message: "Server error while creating task",
      error: error.message,
    });
  }
};

// ===================================
// 3. UPDATE TASK
// ===================================
const updateTask = async (req, res) => {
  const taskId = req.params.id;
  const { userId } = req.user;
  const updateData = req.body;

  // Whitelist allowed fields for update
  const allowedUpdates = ["title", "status"];
  const updates = Object.keys(updateData);
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).json({
      message: "Invalid update. Only 'title' and 'status' are allowed.",
    });
  }

  try {
    // Search criteria: Task ID must match AND it must belong to the authenticated user.
    // This ensures a user cannot update another user's task.
    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, userId: userId },
      { $set: updateData },
      { new: true, runValidators: true } // 'new: true' returns the modified document
    );

    if (!updatedTask) {
      return res
        .status(404)
        .json({ message: "Task not found or user does not have permission." });
    }

    return res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid Task ID format." });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({
      message: "Server error while updating task",
      error: error.message,
    });
  }
};

// ===================================
// 4. DELETE TASK
// ===================================
const deleteTask = async (req, res) => {
  const taskId = req.params.id;
  const { userId } = req.user;

  try {
    // Search criteria: Task ID must match AND it must belong to the authenticated user.
    const deletedTask = await Task.findOneAndDelete({
      _id: taskId,
      userId: userId,
    });

    if (!deletedTask) {
      return res
        .status(404)
        .json({ message: "Task not found or user does not have permission." });
    }

    return res.status(200).json({
      message: "Task deleted successfully.",
      task: deletedTask,
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid Task ID format." });
    }
    return res.status(500).json({
      message: "Server error while deleting task",
      error: error.message,
    });
  }
};

// ===================================
// 5. REORDER TASKS
// ===================================
/**
 * Reorders a task.
 * Receives the task ID, its status, its old position, and the new position.
 * Updates the moved task and shifts all other affected tasks.
 */
const reorderTask = async (req, res) => {
  try {
    const { id } = req.params; // ID of the moved task
    const { oldPosition, newPosition, status } = req.body;
    const { userId } = req.user; // From isAuth middleware

    // 1. If there's no movement, do nothing.
    if (oldPosition === newPosition) {
      return res.status(200).json({ message: "No change in position." });
    }

    // 2. Determine the movement direction
    // If (new > old), it moves "down" (e.g., 1 -> 3). Tasks in between must subtract 1 (-1).
    // If (new < old), it moves "up" (e.g., 3 -> 1). Tasks in between must add 1 (+1).
    const direction = newPosition > oldPosition ? -1 : 1;

    // 3. Determine the range of tasks to "shift"
    let start, end;
    if (direction === -1) {
      // Move down (e.g., 1 -> 3)
      // Affects tasks at positions 2 and 3 (oldPosition + 1 ... newPosition)
      start = oldPosition + 1;
      end = newPosition;
    } else {
      // Move up (e.g., 3 -> 1)
      // Affects tasks at positions 1 and 2 (newPosition ... oldPosition - 1)
      start = newPosition;
      end = oldPosition - 1;
    }

    // 4. Create the 'bulk' operations list
    const operations = [
      // Operation 1: Shift all tasks in the affected range
      {
        updateMany: {
          filter: {
            userId: userId,
            status: status,
            position: { $gte: start, $lte: end },
          },
          update: {
            $inc: { position: direction }, // Add 1 or subtract 1
          },
        },
      },
      // Operation 2: Update the position of the task we actually moved
      {
        updateOne: {
          filter: { _id: id, userId: userId },
          update: {
            $set: { position: newPosition },
          },
        },
      },
    ];

    // 5. Execute the operations atomically
    await Task.bulkWrite(operations);

    res.status(200).json({ message: "Tasks reordered successfully." });
  } catch (error) {
    console.error("Error in reorderTask:", error.message);
    res
      .status(500)
      .json({ message: "Server error during reorder", error: error.message });
  }
};

export { getTasks, createTask, updateTask, deleteTask, reorderTask };
