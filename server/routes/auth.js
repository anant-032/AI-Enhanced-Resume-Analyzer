import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

/* =========================
   ENV SAFETY
   ========================= */
const JWT_SECRET =
  process.env.JWT_SECRET || "DEV_ONLY_SECRET_CHANGE_THIS";

/* =========================
   REGISTER USER
   ========================= */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    /* Basic validation */
    if (!name || !email || !password) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
      });
    }

    /* Check existing user */
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        error: "User already registered",
      });
    }

    /* Create user */
    const user = await User.create({
      name,
      email,
      password,
    });

    /* Generate token */
    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({
      error: "Registration failed",
    });
  }
});

/* =========================
   LOGIN USER
   ========================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    /* Validation */
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password required",
      });
    }

    /* Find user (explicitly include password) */
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    /* Compare password */
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    /* Generate token */
    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({
      error: "Login failed",
    });
  }
});

export default router;
