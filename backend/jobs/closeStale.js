const Complaint = require("../models/Complaint");

const closeStaleCases = async () => {
  try {
    const limit = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const stale = await Complaint.find({
      status: "action_taken",
      actionTakenAt: { $lte: limit },
    });
    for (const complaint of stale) {
      complaint.status = "closed_unconfirmed";
      complaint.closedAt = new Date();
      complaint.messages.push({
        from: "system",
        text: "Closed automatically because we did not hear back from the customer.",
      });
      await complaint.save();
    }
  } catch (error) {
    console.error("Close job failed:", error.message);
  }
};

const startCloseJob = () => {
  closeStaleCases();
  setInterval(closeStaleCases, 60 * 60 * 1000);
};

module.exports = { startCloseJob };