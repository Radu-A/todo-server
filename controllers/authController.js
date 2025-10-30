import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getUserByEmail } from "./userController.js";

const JWT_SECRET = process.env.JWT_SECRET;

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

  const payload = {
    userId: user._id,
    username: user.username,
    email: user.email,
  }; // Sign payload with secret

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: "24h",
  });

  console.log(`User ${user.email} successfully authenticated.`);
  return res.status(200).json({
    message: "Login successful",
    token: token,
    user: { id: user._id, email: user.email },
  });
};

export { checkLogin };
