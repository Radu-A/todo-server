import Task from "../models/Task.js";

// El ID DUMMY se usa para SIMULAR el ID que el middleware de auth inyectará en req.user.id
const dummyUserId = "60c72b1f9b1e8b0015f4a6e5";

// ===================================
// 1. GET TASKS
// ===================================
const getTasks = async (req, res) => {
  const { userId } = req.user;
  try {
    // Filtra por el ID fijo. En el futuro, será: Task.find({ userId: req.user.id });
    const tasks = await Task.find({ userId: userId });
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
// 2. CREATE TASK
// ===================================
const createTask = async (req, res) => {
  const { title } = req.body;
  const { userId } = req.user;
  if (!title) {
    return res
      .status(400)
      .json({ message: "El título de la tarea es obligatorio." });
  }
  try {
    const newTask = new Task({
      title,
      userId: userId, // Asigna el ID fijo. En el futuro, será: userId: req.user.id,
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
// 3. UPDATE TASK
// ===================================
const updateTask = async (req, res) => {
  // El ID de la tarea a modificar
  const taskId = req.params.id;
  const { userId } = req.user;

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
// 4. DELETE TASK
// ===================================
const deleteTask = async (req, res) => {
  // El ID de la tarea a eliminar
  const taskId = req.params.id;
  const { userId } = req.user;

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

// ===================================
// 5. REORDER TASKS
// ===================================
/**
 * Reordena una tarea.
 * Recibe el ID de la tarea, su status, su posición antigua y la nueva.
 * Actualiza la tarea movida y "desplaza" todas las otras tareas afectadas.
 */
const reorderTask = async (req, res) => {
  try {
    const { id } = req.params; // ID de la tarea movida
    const { oldPosition, newPosition, status } = req.body;
    const userId = req.userId; // Obtenido desde el middleware isAuth

    // 1. Si no hay movimiento, no hacer nada.
    if (oldPosition === newPosition) {
      return res.status(200).json({ message: "No change in position." });
    }

    // 2. Determinar la dirección del movimiento
    // Si (new > old), se mueve "hacia abajo" (ej: 1 -> 3). Las tareas en medio deben restar 1 (-1).
    // Si (new < old), se mueve "hacia arriba" (ej: 3 -> 1). Las tareas en medio deben sumar 1 (+1).
    const direction = newPosition > oldPosition ? -1 : 1;

    // 3. Determinar el rango de tareas a "desplazar"
    let start, end;
    if (direction === -1) {
      // Mover hacia abajo (ej: 1 -> 3)
      // Afecta a las tareas en las posiciones 2 y 3 (oldPosition + 1 ... newPosition)
      start = oldPosition + 1;
      end = newPosition;
    } else {
      // Mover hacia arriba (ej: 3 -> 1)
      // Afecta a las tareas en las posiciones 1 y 2 (newPosition ... oldPosition - 1)
      start = newPosition;
      end = oldPosition - 1;
    }

    // 4. Crear la lista de operaciones 'bulk'
    const operations = [
      // Operación 1: Desplazar todas las tareas en el rango
      {
        updateMany: {
          filter: {
            userId: userId,
            status: status,
            position: { $gte: start, $lte: end },
          },
          update: {
            $inc: { position: direction }, // Suma 1 o resta 1
          },
        },
      },
      // Operación 2: Actualizar la posición de la tarea que movimos
      {
        updateOne: {
          filter: { _id: id, userId: userId },
          update: {
            $set: { position: newPosition },
          },
        },
      },
    ];

    // 5. Ejecutar las operaciones en una transacción atómica
    await Task.bulkWrite(operations);

    res.status(200).json({ message: "Tasks reordered successfully." });
  } catch (error) {
    console.error("Error en reorderTask:", error.message);
    res
      .status(500)
      .json({ message: "Server error during reorder", error: error.message });
  }
};

export { getTasks, createTask, updateTask, deleteTask, reorderTask };
