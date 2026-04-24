import jwt from "jsonwebtoken";

/**
 * Middleware to verify JWT token and authorize user
 * Attaches userId to request if valid
 */
const isAuth = (req, res, next) => {
  try {
    // ✅ Get token from cookie
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided",
      });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token structure",
      });
    }

    // ✅ Attach user ID to request
    req.userId = decoded.id;

    // ✅ Proceed to next middleware
    next();
  } catch (error) {
    console.error("❌ JWT Verification Error:", error.message);

    // Token-specific error handling
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Authentication failed.",
      });
    }

    // Generic error
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication",
    });
  }
};

export default isAuth;
