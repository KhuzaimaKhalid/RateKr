const Complaint = require("../models/Complaint");
const sendMail = require("../utils/mailer");

const findCase = (token) =>
  Complaint.findOne({ caseToken: token }).populate(
    "outletId",
    "name logo color googleReviewUrl managerEmails"
  );

const getCase = async (req, res) => {
  try {
    const complaint = await findCase(req.params.token);
    if (!complaint) return res.status(404).json({ message: "Case not found" });
    const outlet = complaint.outletId;
    res.json({
      outlet: {
        name: outlet.name,
        logo: outlet.logo,
        color: outlet.color,
        googleReviewUrl: outlet.googleReviewUrl,
      },
      status: complaint.status,
      rating: complaint.rating,
      text: complaint.text,
      actionNote: complaint.actionNote,
      customerOutcome: complaint.customerOutcome,
      messages: complaint.messages,
      createdAt: complaint.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addMessage = async (req, res) => {
  try {
    const text = String(req.body.text || "").trim();
    if (!text || text.length > 1000)
      return res.status(400).json({ message: "Message must be 1 to 1000 characters" });

    const complaint = await findCase(req.params.token);
    if (!complaint) return res.status(404).json({ message: "Case not found" });
    if (complaint.messages.length >= 50)
      return res.status(429).json({ message: "Message limit reached" });

    complaint.messages.push({ from: "customer", text });
    await complaint.save();

    sendMail(
      complaint.outletId.managerEmails,
      `Customer replied: ${complaint.outletId.name}`,
      `${complaint.name} wrote:\n\n${text}`
    );

    res.status(201).json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const confirm = async (req, res) => {
  try {
    const outcome = req.body.outcome;
    if (!["fixed", "partly", "not_fixed"].includes(outcome))
      return res.status(400).json({ message: "Outcome must be fixed, partly or not_fixed" });

    const note = String(req.body.note || "").trim().slice(0, 1000);

    const complaint = await findCase(req.params.token);
    if (!complaint) return res.status(404).json({ message: "Case not found" });
    if (!["action_taken", "closed_unconfirmed"].includes(complaint.status))
      return res.status(409).json({ message: "Nothing to confirm yet" });

    const labels = {
      fixed: "Customer confirmed the issue is fixed.",
      partly: "Customer says the issue was only partly fixed.",
      not_fixed: "Customer says the issue is not fixed.",
    };

    complaint.customerOutcome = outcome;
    if (note) complaint.messages.push({ from: "customer", text: note });
    complaint.messages.push({ from: "system", text: labels[outcome] });

    if (outcome === "fixed") {
      complaint.status = "resolved";
      complaint.resolvedAt = new Date();
    } else {
      complaint.status = "reopened";
      complaint.resolvedAt = undefined;
      sendMail(
        complaint.outletId.managerEmails,
        `Complaint reopened: ${complaint.outletId.name}`,
        `${complaint.name}: ${labels[outcome]}${note ? `\n\n${note}` : ""}`
      );
    }

    await complaint.save();
    res.json({ status: complaint.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCase,
  addMessage,
  confirm,
};