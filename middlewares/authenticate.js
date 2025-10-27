import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;

const protect = (req, res, next) => {
  // Provisional
  console.log("Protect");

  // Get token
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Denied access. No token provided.",
    });
  }
  const token = authHeader.split(" ")[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    // Send user info to req
    req.user = decoded;
    // Provisional check
    console.log("Operation getTasks accepted");

    // Continue
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

export { protect };
