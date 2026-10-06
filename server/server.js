const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const participantRoutes = require("./routes/participants");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/participants", participantRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Mini Management System API is working"
  });
});

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });