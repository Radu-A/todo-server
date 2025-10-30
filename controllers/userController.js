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