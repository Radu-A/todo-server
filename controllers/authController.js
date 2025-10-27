import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getUserByEmail } from "./userController.js";

const JWT_SECRET = process.env.JWT_SECRET;

// ID Temporal y fijo para el usuario que crearemos
const dummyUser = {
  _id: "60c72b1f9b1e8b0015f4a6e5",
  username: "Test",
  email: "test@example.com",
  password: "$2a$12$im3wfbo.IrHZvNEOpreeieOlW5TjCeF9892BI7YI/iTh2bU5YS4Ay", // Usamos el HASH generado de "password-123"
};

const checkLogin = async (req, res) => {
  const { email, password } = req.body;
  let user;
  // 1. SEARCH USER => SERVER ERROR
  try {
    user = await getUserByEmail(email);
    console.log("El usuario con el email introducido es: ", user);
  } catch (error) {
    console.error("Error en la consulta a la DB:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }

  // 2. VERIFY USER EXISTENCE & WRONG PASSWORD (Status 401)

  // If user is null OR password comparison fails, we return the SAME generic error.
  if (!user) {
    console.log(`Login attempt failed: User ${email} not found.`);
    return res.status(401).json({
      message: "Invalid credentials", // Ambiguous error in Spanish
    });
  }

  // 3. COMPARE PASSWORD & SERVER ERROR HANDLING (Status 500)
  let isMatch;
  try {
    // Compare the plain password with the hashed password from the DB (user.password)
    isMatch = await bcrypt.compare(password, user.password);
  } catch (error) {
    // Handles errors during the hashing/comparison process (e.g., hash corruption)
    console.error("Bcrypt comparison failed:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }

  // 4. COMPARE PASSWORD FINAL CHECK (Status 401)
  if (!isMatch) {
    console.log(`Login attempt failed: Wrong password for user ${email}.`);
    return res.status(401).json({ message: "Credenciales inválidas" }); // Ambiguous error
  }

  // 5. SUCCESS (Status 200)
  // Token data
  const payload = {
    userId: user._id,
    email: user.email,
  };
  // Sign payload with secret
  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: "24h",
  });
  console.log(`User ${user.email} successfully authenticated.`);
  return res.status(200).json({
    message: "Successfully connected",
    token: token,
    user: { id: user._id, email: user.email },
  });
};

export { checkLogin };
