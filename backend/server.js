require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const { startCloseJob } = require("./jobs/closeStale");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api", require("./routes"));

app.get("/", (req, res) => {
  res.send("welcome");
});

// Database connection cached for serverless efficiency
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("MongoDB connected");
  } catch (err) {
    console.error("DB connection failed:", err.message);
  }
}

// Connect on function boot
connectDB();

// Only listen locally during development (not on Vercel production)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startCloseJob();
  });
}

// REQUIRED for Vercel serverless deployment
module.exports = app;