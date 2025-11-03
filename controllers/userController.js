import User from "../models/User.js";
import bcrypt from "bcrypt";

/**
 * Helper function to find a user by email.
 * @param {string} email - The email to search for.
 * @returns {Promise<Document|null>} - The Mongoose user document or null.
 */
const getUserByEmail = async (email) => {
  try {
    // User.findOne returns the user object or null if not found.
    const user = await User.findOne({ email: email }).exec();
    return user;
  } catch (err) {
    // If the DB connection fails, we throw the error so the caller
    // (e.g., checkLogin) can catch it as a 500.
    console.error("Database query error in getUserByEmail:", err.message);
    throw new Error("DB_QUERY_FAILED");
  }
};

/**
 * Checks if an email already exists in the database.
 * NOTE: This endpoint exposes the application to user enumeration vulnerabilities.
 * It is strongly recommended to remove this function and rely on
 * the main login/registration flows for validation.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
const searchEmail = async (req, res) => {
  // Email is expected in the request body
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  // 1. Database query
  let user;
  try {
    // Reuse existing helper function
    user = await getUserByEmail(email);
  } catch (error) {
    // Handle DB connection errors
    console.error("Database query error during email check:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }

  // 2. Check for existence
  if (user) {
    // Email found
    return res.status(200).json({
      message: "User found",
      exists: true, // Explicitly state that it exists
    });
  } else {
    // Email NOT found
    return res.status(200).json({
      message: "User not found",
      exists: false,
    });
  }
};

/**
 * Creates a new user in the database.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
const createUser = async (req, res) => {
  const { username, email, password } = req.body;

  console.log(`Attempting to register user: ${username}, ${email}`);

  // --- HASHING ---
  try {
    // Generate hash (saltRounds=10 is standard and built-in)
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
      // Optional: You could generate and return a JWT here for immediate login
    });
  } catch (error) {
    // --- ERROR HANDLING ---
    console.error("User registration failed:", error.message);

    // 1. Check for duplicate key error (email already exists)
    if (error.code === 11000) {
      return res.status(409).json({
        // Status 409 Conflict
        message: "Error: This email address is already registered.",
      });
    }

    // 2. Check specifically for Mongoose Validation Errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        // Status 400 Bad Request
        message: "Registration failed due to invalid data.",
        details: error.message, // O un mensaje más amigable
      });
    }

    // 3. For any other error (DB connection, etc.), send a 500
    return res.status(500).json({
      message: "An internal server error occurred during registration.",
    });
  }
};

export { getUserByEmail, searchEmail, createUser };
