import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

import User from "../models/User.js";
import { getUserByEmail } from "./userController.js";

const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const checkLogin = async (req, res) => {
  const { email, password } = req.body;
  let user; // 1. Find the user by email

  try {
    user = await getUserByEmail(email);
  } catch (error) {
    console.error("Error during database query:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  } // 2. Verify user existence // If the user is not found, send a generic 401 error. // This prevents user enumeration attacks.

  if (!user) {
    console.log(`Login attempt failed: User ${email} not found.`);
    return res.status(401).json({
      message: "Invalid credentials",
    });
  } // 3. Compare the provided password with the stored hash

  let isMatch;
  try {
    // Compare the plain password with the hashed password from the DB
    isMatch = await bcrypt.compare(password, user.password);
  } catch (error) {
    // Handles errors during the bcrypt comparison (e.g., malformed hash)
    console.error("Bcrypt comparison failed:", error);
    return res.status(500).json({ message: "Internal server error" });
  } // 4. Verify password match // If passwords don't match, send the same generic 401 error.

  if (!isMatch) {
    console.log(`Login attempt failed: Wrong password for user ${email}.`);
    return res.status(401).json({ message: "Invalid credentials" });
  } // 5. Success: Generate and send JWT

  const jwtPayload = {
    userId: user._id,
    username: user.username,
    email: user.email,
  }; // Sign payload with secret

  const jwtToken = jwt.sign(jwtPayload, JWT_SECRET, {
    expiresIn: "24h",
  });

  console.log(`User ${user.email} successfully authenticated.`);
  return res.status(200).json({
    message: "Login successful",
    token: jwtToken,
    user: { id: user._id, email: user.email },
  });
};

const googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { name, email, sub: googleId } = payload;

    let user = await User.findOne({ email: email });

    if (!user) {
      user = new User({
        username: username,
        email: email,
        googleId: googleId,
      });
      await user.save();
    }

    const jwtPayload = {
      userId: user._id,
      username: user.username,
      email: user.email,
    };

    const jwtToken = jwt.sign(jwtPayload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      ok: true,
      message: "Autenticación exitosa",
      token: jwtToken,
      userId: user.id,
      username: user.username,
    });
  } catch (error) {
    console.error("Error en Google auth:", error);
    res.status(400).json({
      ok: false,
      message: "Token de Google no válido o error del servidor",
    });
  }
};

export { checkLogin, googleLogin };
