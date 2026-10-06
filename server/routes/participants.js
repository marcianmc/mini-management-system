const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Participant = require("../models/Participant");
const auth = require("../middleware/auth");

const router = express.Router();

// REGISTER PARTICIPANT
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    const existingParticipant = await Participant.findOne({ email });

    if (existingParticipant) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const participant = await Participant.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "Participant registered successfully",
      participant: {
        id: participant._id,
        name: participant.name,
        email: participant.email
      }
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    res.status(500).json({
      message: "Server error"
    });
  }
});

// LOGIN PARTICIPANT
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const participant = await Participant.findOne({ email });

    if (!participant) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      participant.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      { participantId: participant._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      participant: {
        id: participant._id,
        name: participant.name,
        email: participant.email
      }
    });
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      message: "Server error"
    });
  }
});

// GET LOGGED-IN PARTICIPANT
router.get("/me", auth, async (req, res) => {
  try {
    const participant = await Participant.findById(
      req.participantId
    ).select("-password");

    if (!participant) {
      return res.status(404).json({
        message: "Participant not found"
      });
    }

    res.status(200).json(participant);
  } catch (error) {
    console.error("Authentication error:", error.message);

    res.status(500).json({
      message: "Server error"
    });
  }
});

module.exports = router;