import Task from "../models/Task.js";

// El ID DUMMY se usa para SIMULAR el ID que el middleware de auth inyectará en req.user.id
// En el futuro, TODAS las referencias a dummyUserId serán reemplazadas por req.user.id.
const dummyUserId = "60c72b1f9b1e8b0015f4a6e5";

// ===================================
// 1. GET TASKS (Unificado: Usa dummyUserId)
// ===================================
const getTasks = async (req, res) => {
  try {
    // Filtra por el ID fijo. En el futuro, será: Task.find({ userId: req.user.id });
    const tasks = await Task.find({ userId: dummyUserId });
    return res.status(200).json(tasks);
  } catch (error) {
    console.error("Error al obtener las tareas:", error);
    return res.status(500).json({
      message: "Error en el servidor al obtener las tareas",
      error: error.message,
    });
  }
};

// ===================================
// 2. CREATE TASK (Unificado: Usa dummyUserId)
// ===================================
const createTask = async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res
      .status(400)
      .json({ message: "El título de la tarea es obligatorio." });
  }
  try {
    const newTask = new Task({
      title,
      userId: dummyUserId, // Asigna el ID fijo. En el futuro, será: userId: req.user.id,
    });
    const savedTask = await newTask.save();
    return res.status(201).json(savedTask);
  } catch (error) {
    console.error("Error al crear la tarea:", error);
    return res.status(500).json({
      message: "Error en el servidor al crear la tarea",
      error: error.message,
    });
  }
};

// ===================================
// 3. UPDATE TASK (Unificado: Usa dummyUserId, Elimina req.query.userId)
// ===================================
const updateTask = async (req, res) => {
  // El ID de la tarea a modificar
  const taskId = req.params.id; // El ID del usuario propietario. En el futuro, será: const userId = req.user.id;
  const userId = dummyUserId;

  const updateData = req.body; // Eliminamos la validación de req.query.userId porque ya no se necesita

  const allowedUpdates = ["title", "status"];
  const updates = Object.keys(updateData);
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).json({
      message: "Actualización inválida. Solo se permiten title y status.",
    });
  }

  try {
    // Criterios de búsqueda: ID de tarea Y ID de usuario fijo para seguridad
    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, userId: userId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res
        .status(404)
        .json({ message: "Tarea no encontrada o no pertenece al usuario." });
    }

    return res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error al actualizar la tarea:", error);
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ message: "Formato de ID de tarea inválido." });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({
      message: "Error en el servidor al actualizar la tarea",
      error: error.message,
    });
  }
};

// ===================================
// 4. DELETE TASK (Unificado: Usa dummyUserId, Elimina req.body.userId)
// ===================================
const deleteTask = async (req, res) => {
  // El ID de la tarea a eliminar
  const taskId = req.params.id; // El ID del usuario propietario. En el futuro, será: const userId = req.user.id;

  const userId = dummyUserId; // Eliminamos la validación de req.body.userId porque ya no se necesita

  try {
    // Criterios de búsqueda: ID de tarea Y ID de usuario fijo para seguridad
    const deletedTask = await Task.findOneAndDelete({
      _id: taskId,
      userId: userId,
    });

    if (!deletedTask) {
      return res
        .status(404)
        .json({ message: "Tarea no encontrada o no pertenece al usuario." });
    }

    return res.status(200).json({
      message: "Tarea eliminada con éxito.",
      task: deletedTask,
    });
  } catch (error) {
    console.error("Error al eliminar la tarea:", error);
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ message: "Formato de ID de tarea inválido." });
    }
    return res.status(500).json({
      message: "Error en el servidor al eliminar la tarea",
      error: error.message,
    });
  }
};

export { getTasks, createTask, updateTask, deleteTask };
