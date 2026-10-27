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

app.use(express.json({ }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api", require("./routes"));

app.get("/", (req, res) => {
  res.send("welcome");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT || 5000, () => console.log("Server running"));
    startCloseJob();
  })
  .catch((err) => console.error("DB connection failed:", err.message));