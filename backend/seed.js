// server/seed.js  — run: node seed.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Outlet = require("./models/Outlet");
const User = require("./models/User");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    // 1. Upsert the Outlet and return the saved document (using new: true)
    const outlet = await Outlet.findOneAndUpdate(
      { slug: "burger-lab-dolmen" },
      {
        name: "Khuzaima Shop",
        slug: "burger-lab-dolmen",
        type: "restaurant",
        googleReviewUrl: "https://www.google.com/maps",
        color: "#d62828",
        managerEmails: ["khuzaimaswati5@gmail.com"],
        isActive: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 2. Upsert the Admin User
    await User.findOneAndUpdate(
      { email: "admin@test.com" },
      {
        email: "admin@test.com",
        passwordHash: await bcrypt.hash("ChangeMe12345", 10),
        role: "admin",
      },
      { upsert: true }
    );

    // 3. Upsert the Manager User and securely link them to the outlet
    await User.findOneAndUpdate(
      { email: "khuzaimaswati5@gmail.com" },
      {
        email: "khuzaimaswati5@gmail.com",
        passwordHash: await bcrypt.hash("ManagerPassword123", 10), // Change this password if needed
        role: "manager",
        outletIds: [outlet._id], // Links the manager directly to the outlet
      },
      { upsert: true }
    );

    console.log("Seeding completed successfully! 🌱");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
})();