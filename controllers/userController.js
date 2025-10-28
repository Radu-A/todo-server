import User from "../models/User.js";
import bcrypt from "bcrypt";

// ID Temporal y fijo para el usuario que crearemos
const dummyUser = {
  _id: "60c72b1f9b1e8b0015f4a6e5",
  username: "Test",
  email: "test@example.com",
  password: "$2a$12$im3wfbo.IrHZvNEOpreeieOlW5TjCeF9892BI7YI/iTh2bU5YS4Ay", // Usamos el HASH generado de "password-123"
};

const getUserByEmail = async (email) => {
  try {
    // User.findOne returns the user object or null if not found.
    const user = await User.findOne({ email: email }).exec();
    return user;
  } catch (err) {
    // If the DB connection fails, we throw the error so checkLogin can catch it as a 500.
    throw new Error("DB_CONNECTION_ERROR");
  }
};

/**
 * Verifica si un email existe en la base de datos.
 * Esta función es llamada por una ruta POST o GET desde el frontend
 * para validar la existencia del usuario antes del login.
 * * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 */
const searchEmail = async (req, res) => {
  // Asumimos que el email viene en el cuerpo de la solicitud (req.body)
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  // 1. CONSULTA A LA BASE DE DATOS
  let user;
  try {
    // Reutilizamos la función que ya existe
    user = await getUserByEmail(email);
  } catch (error) {
    // Manejo de errores de conexión a la DB (Status 500)
    console.error("Error en la consulta a la DB para verificar email:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }

  // 2. VERIFICACIÓN DE EXISTENCIA
  if (user) {
    // Email encontrado
    console.log(`Email ${email} found in DB.`);
    return res.status(200).json({
      message: "User found",
      exists: true, // Indica explícitamente que existe
    });
  } else {
    // Email NO encontrado
    console.log(`Email ${email} not found in DB.`);
    // Para este tipo de endpoint, un 404 (Not Found) es adecuado,
    // o un 200 con 'exists: false' si quieres evitar dar pistas sobre la ruta.
    // Usaremos 200 para mantener el formato 'exists: true/false'.
    return res.status(200).json({
      message: "User not found",
      exists: false,
    });
  }
};

const createUser = async (req, res) => {
  const { username, email, password } = req.body;

  // Log incoming data (use 'username' for consistency)
  console.log(`Attempting to register user: ${username}, ${email}`);

  // --- HASHING ---
  // Correction: bcrypt.hash handles salt generation internally, simplifying the code.
  try {
    // Generate hash directly (saltRounds=10 is standard)
    const hash = await bcrypt.hash(password, 10);

    // --- DATABASE INSERTION ---
    const response = await User.create({
      username,
      email,
      password: hash, // Store the hash
    });

    // SUCCESS: Status 201 (Created) is more appropriate for new resources
    return res.status(201).json({
      message: `User ${username} created successfully.`,
      // Optional: You could generate and return a JWT here too!
    });
  } catch (error) {
    // --- ERROR HANDLING ---
    console.error("User registration failed:", error.message);

    // Check for specific MongoDB error (e.g., duplicate key/email)
    if (error.code === 11000) {
      return res.status(409).json({
        // Status 409 Conflict
        message: "Error: This email address is already registered.",
      });
    }

    // Handle validation errors (e.g., missing field) or generic DB errors
    return res.status(400).json({
      // Status 400 Bad Request
      message: "Registration failed due to invalid data or server error.",
      details: error.message, // Include Mongoose error message for debugging
    });
  }
};

export { getUserByEmail, searchEmail, createUser };
