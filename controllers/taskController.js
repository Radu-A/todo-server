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

export { getTasks, createTask };
