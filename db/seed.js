import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./connect.js";
import User from "../models/User.js";
import Task from "../models/Task.js";

dotenv.config();

const URI = process.env.MONGODB_URI;
// ID Temporal y fijo para el usuario que crearemos
const DUMMY_USER_ID = "60c72b1f9b1e8b0015f4a6e5";

const seedDB = async () => {
  try {
    // Conexión a MongoDB Atlas
    await connectDB();
    console.log("✅ Conexión a MongoDB establecida para seeding."); // 1. LIMPIEZA: Eliminar datos existentes

    await User.deleteMany({});
    await Task.deleteMany({});
    console.log("🗑️ Datos existentes de User y Task eliminados."); // 2. CREAR USUARIO DUMMY

    const dummyUser = new User({
      _id: new mongoose.Types.ObjectId(DUMMY_USER_ID),
      username: "Test",
      email: "test@example.com",
      password: "$2a$12$im3wfbo.IrHZvNEOpreeieOlW5TjCeF9892BI7YI/iTh2bU5YS4Ay", // password-123
    });

    await dummyUser.save();
    console.log(
      `👤 Usuario Dummy '${dummyUser.username}' creado con ID: ${DUMMY_USER_ID}`
    ); // 3. CREAR TAREAS DE PRUEBA Y ASIGNAR POSICIÓN // 💡 Contadores de posición para cada lista

    let todoPosition = 0;
    let donePosition = 0;

    const initialTasks = [
      {
        title: "Configurar el servidor Express",
        status: "done",
        userId: DUMMY_USER_ID,
      },
      {
        title: "Definir los esquemas Mongoose (User y Task)",
        status: "done",
        userId: DUMMY_USER_ID,
      },
      {
        title: "Implementar el script de seeding",
        status: "done",
        userId: DUMMY_USER_ID,
      },
      {
        title: "Crear la ruta POST /tasks",
        status: "todo",
        userId: DUMMY_USER_ID,
      },
      {
        title: "Conectar el Frontend (fetch/axios)",
        status: "todo",
        userId: DUMMY_USER_ID,
      },
      {
        title: "Estudiar las diferencias entre PATCH y PUT",
        status: "todo",
        userId: DUMMY_USER_ID,
      },
    ]; // 4. MAPEO: Asignar la posición correcta a cada tarea

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
      `📝 ${tasksWithPositions.length} tareas iniciales cargadas exitosamente (con posición).`
    );
  } catch (error) {
    console.error("❌ Error durante el seeding:", error.message);
  } finally {
    // Desconexión
    await mongoose.disconnect();
    console.log("🔌 Conexión a MongoDB cerrada.");
  }
};

seedDB();
