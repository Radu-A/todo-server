import Task from "../models/Task.js";

const dummyUserId = "60c72b1f9b1e8b0015f4a6e5";

const getTasks = async (req, res) => {
  try {
    // Buscamos SOLO las tareas donde el campo 'userId' coincida con el ID del usuario (dummy)
    const tasks = await Task.find({ userId: dummyUserId }); // Devolvemos el array de tareas
    return res.status(200).json(tasks);
  } catch (error) {
    console.error("Error al obtener las tareas:", error);
    return res.status(500).json({
      message: "Error en el servidor al obtener las tareas",
      error: error.message,
    });
  }
};

const createTask = async (req, res) => {
  // 1. Obtener el 'title' del cuerpo de la solicitud
  const { title } = req.body;

  // 2. Validación simple
  if (!title) {
    return res
      .status(400)
      .json({ message: "El título de la tarea es obligatorio." });
  }
  try {
    const newTask = new Task({
      title,
      userId: dummyUserId,
    });
    // 4. Guardar en la base de datos
    const savedTask = await newTask.save();

    // 5. Responder con el objeto de la tarea creada y el código 201 (Created)
    return res.status(201).json(savedTask);
  } catch (error) {
    // Manejar errores de Mongoose (ej. validación fallida)
    console.error("Error al crear la tarea:", error);
    return res.status(500).json({
      message: "Error en el servidor al crear la tarea",
      error: error.message,
    });
  }
};

const updateTask = async (req, res) => {
  // 1. Obtener los IDs necesarios
  const taskId = req.params.id;
  const userId = dummyUserId; // Temporalmente para validación de propiedad
  // const { userId } = req.query;

  // 2. Obtener los campos a actualizar del cuerpo de la solicitud (puede ser 'title' y/o 'status')
  const updateData = req.body;

  if (!userId) {
    return res.status(400).json({
      message:
        "El userId es obligatorio como query parameter para validar la propiedad.",
    });
  }

  // Opcional: Validación extra para asegurar que solo se actualicen campos permitidos
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
    // 3. Buscar la tarea por _id Y userId (seguridad) y aplicar los cambios
    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, userId: userId }, // Criterios de búsqueda (ID de tarea y ID de usuario)
      { $set: updateData }, // Datos a actualizar ($set asegura que solo se actualicen los campos pasados)
      { new: true, runValidators: true } // Opciones: devolver el documento nuevo y ejecutar validadores de Schema
    );

    // 4. Verificar si se encontró y actualizó la tarea
    if (!updatedTask) {
      // Tarea no encontrada o no pertenece al usuario
      return res
        .status(404)
        .json({ message: "Tarea no encontrada o no pertenece al usuario." });
    }

    // 5. Responder con el objeto actualizado
    return res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error al actualizar la tarea:", error);
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ message: "Formato de ID de tarea inválido." });
    }
    // Manejar error de validación de Schema (ej. status inválido)
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({
      message: "Error en el servidor al actualizar la tarea",
      error: error.message,
    });
  }
};

const deleteTask = async (req, res) => {
  // 1. Obtener el ID de la tarea desde los parámetros de la ruta
  const taskId = req.params.id;

  // 2. Obtener el ID del usuario (temporalmente desde el body, en la fase de auth será req.user.id)
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      message: "El userId es obligatorio en el body para validar la propiedad.",
    });
  }

  try {
    // 3. Buscar y eliminar la tarea:
    // Utilizamos findOneAndDelete para eliminar solo si el _id de la tarea Y el userId coinciden.
    const deletedTask = await Task.findOneAndDelete({
      _id: taskId,
      userId: userId, // <-- Condición de seguridad
    });

    // 4. Verificar si se encontró y eliminó la tarea
    if (!deletedTask) {
      // Esto significa que:
      // a) La tarea no existe con ese taskId, O
      // b) La tarea existe, pero el userId NO COINCIDE.
      return res
        .status(404)
        .json({ message: "Tarea no encontrada o no pertenece al usuario." });
    }

    // 5. Responder con éxito y el objeto eliminado
    return res.status(200).json({
      message: "Tarea eliminada con éxito.",
      task: deletedTask,
    });
  } catch (error) {
    console.error("Error al eliminar la tarea:", error);
    // Manejar errores si el ID de la tarea no es válido (ej. formato incorrecto de ObjectId)
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
