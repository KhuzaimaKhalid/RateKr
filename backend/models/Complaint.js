const mongoose = require("mongoose");
const crypto = require("crypto");

const messageSchema = new mongoose.Schema(
  {
    from: { type: String, enum: ["manager", "customer", "system"], required: true },
    text: { type: String, trim: true, required: true, maxlength: 1000 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const complaintSchema = new mongoose.Schema(
  {
    outletId: { type: mongoose.Schema.Types.ObjectId, ref: "Outlet", required: true },
    submissionId: { type: String, unique: true, sparse: true },
    caseToken: {
      type: String,
      unique: true,
      sparse: true,
      default: () => crypto.randomBytes(24).toString("hex"),
    },
    rating: { type: Number, min: 1, max: 5, required: true },
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    contactPreference: { type: String, enum: ["whatsapp", "email", "none"], default: "none" },
    text: { type: String, trim: true, required: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ["new", "contacted", "action_taken", "resolved", "reopened", "closed_unconfirmed"],
      default: "new",
    },
    actionNote: { type: String, trim: true, maxlength: 1000 },
    customerOutcome: { type: String, enum: ["fixed", "partly", "not_fixed"] },
    messages: [messageSchema],
    firstResponseAt: Date,
    actionTakenAt: Date,
    resolvedAt: Date,
    closedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);