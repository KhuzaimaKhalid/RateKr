const mongoose = require("mongoose");

const outletSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    type: { type: String, trim: true },
    googleReviewUrl: { type: String, required: true, trim: true },
    logo: { type: String, trim: true },
    color: { type: String, default: "#00a6ff", trim: true },
    managerEmails: [{ type: String, lowercase: true, trim: true }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Outlet", outletSchema);