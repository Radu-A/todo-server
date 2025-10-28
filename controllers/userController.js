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

const createUser = async (req, res) => {
  const { userName, email, password } = req.body;
  console.log(userName, email, password);

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  try {
    const response = await User.create({
      username: userName,
      email: email,
      password: hash,
    });
    return res.status(200).json({
      message: `User ${userName} created`,
    });
  } catch (error) {
    return res.status(400).json({
      message: error,
    });
  }
};

export { getUserByEmail, createUser };
