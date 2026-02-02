import jwt from "jsonwebtoken";

/* =========================
   AUTH MIDDLEWARE
   ========================= */
export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Authorization token missing",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "DEV_ONLY_SECRET_CHANGE_THIS"
    );

    // Attach userId to request
    req.userId = decoded.userId;

    next();
  } catch (err) {
    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }
}
