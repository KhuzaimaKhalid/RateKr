const mongoose = require("mongoose");
const Complaint = require("../models/Complaint");
const Rating = require("../models/Rating");
const { caseUrl, whatsappLink } = require("../utils/contact");
const notifyCustomer = require("../utils/notify");

const scope = (user) =>
  user.role === "admin"
    ? {}
    : { outletId: { $in: user.outletIds.map((id) => new mongoose.Types.ObjectId(id)) } };

const findScoped = (req) =>
  Complaint.findOne({ _id: req.params.id, ...scope(req.user) }).populate("outletId", "name");

const listComplaints = async (req, res) => {
  try {
    const filter = scope(req.user);
    if (req.query.status) filter.status = req.query.status;
    const complaints = await Complaint.find(filter)
      .select("-messages")
      .populate("outletId", "name")
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getComplaint = async (req, res) => {
  try {
    const complaint = await findScoped(req);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    const data = complaint.toObject();
    data.caseUrl = caseUrl(complaint.caseToken);
    data.whatsappLink = whatsappLink(
      complaint.phone,
      `Hello ${complaint.name}, this is ${complaint.outletId.name} about your feedback. You can see our reply here: ${data.caseUrl}`
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const replyToCustomer = async (req, res) => {
  try {
    const text = String(req.body.text || "").trim();
    if (!text || text.length > 1000)
      return res.status(400).json({ message: "Reply must be 1 to 1000 characters" });

    const complaint = await findScoped(req);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    if (complaint.status === "resolved")
      return res.status(409).json({ message: "Case is already resolved" });

    complaint.messages.push({ from: "manager", text });
    if (!complaint.firstResponseAt) complaint.firstResponseAt = new Date();
    if (["new", "reopened"].includes(complaint.status)) complaint.status = "contacted";
    await complaint.save();

    notifyCustomer(complaint, `${complaint.outletId.name} replied to your complaint`, text);

    res.json({ status: complaint.status, messages: complaint.messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const takeAction = async (req, res) => {
  try {
    const note = String(req.body.note || "").trim();
    if (!note || note.length > 1000)
      return res.status(400).json({ message: "Describe what was done in 1 to 1000 characters" });

    const complaint = await findScoped(req);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    if (!["new", "contacted", "reopened"].includes(complaint.status))
      return res.status(409).json({ message: `Cannot take action when status is ${complaint.status}` });

    complaint.status = "action_taken";
    complaint.actionNote = note;
    complaint.actionTakenAt = new Date();
    if (!complaint.firstResponseAt) complaint.firstResponseAt = new Date();
    complaint.messages.push({ from: "manager", text: `Action taken: ${note}` });
    await complaint.save();

    notifyCustomer(
      complaint,
      `Update on your complaint at ${complaint.outletId.name}`,
      `Action taken: ${note}\n\nPlease let us know whether the issue is fixed.`
    );

    res.json({ status: complaint.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const stats = async (req, res) => {
  try {
    const filter = scope(req.user);
    const [totalRatings, avg, totalComplaints, unresolved, resolved, response] = await Promise.all([
      Rating.countDocuments(filter),
      Rating.aggregate([{ $match: filter }, { $group: { _id: null, avg: { $avg: "$rating" } } }]),
      Complaint.countDocuments(filter),
      Complaint.countDocuments({
        ...filter,
        status: { $in: ["new", "contacted", "action_taken", "reopened"] },
      }),
      Complaint.countDocuments({ ...filter, status: "resolved" }),
      Complaint.aggregate([
        { $match: { ...filter, firstResponseAt: { $ne: null } } },
        { $group: { _id: null, avg: { $avg: { $subtract: ["$firstResponseAt", "$createdAt"] } } } },
      ]),
    ]);
    res.json({
      totalRatings,
      averageRating: avg[0] ? Number(avg[0].avg.toFixed(2)) : null,
      totalComplaints,
      unresolved,
      resolved,
      avgFirstResponseMinutes: response[0] ? Math.round(response[0].avg / 60000) : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  listComplaints,
  getComplaint,
  replyToCustomer,
  takeAction,
  stats,
};