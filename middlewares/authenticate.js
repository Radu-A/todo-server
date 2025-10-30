import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware to protect routes.
 * Verifies the JWT token from the Authorization header.
 */
const protect = (req, res, next) => {
  // 1. Get token from the authorization header
  const authHeader = req.headers.authorization;

  // Check if token exists and is in Bearer format
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Access denied. No token provided.",
    });
  }
  const token = authHeader.split(" ")[1];

  try {
    // 2. Verify the token using the secret
    const decoded = jwt.verify(token, JWT_SECRET);

    // 3. Attach the user payload (decoded token) to the request object
    // The payload (e.g., { userId, email }) is now available in req.user
    req.user = decoded;

    // 4. Pass to the next middleware or controller
    next();
  } catch (error) {
    // This catches errors from jwt.verify (e.g., expired token, invalid signature)
    return res.status(401).json({
      message: "Access denied. Token is invalid or has expired.",
    });
  }
};

export { protect };
