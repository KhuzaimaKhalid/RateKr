const Outlet = require("../models/Outlet");
const Rating = require("../models/Rating");
const Complaint = require("../models/Complaint");
const sendMail = require("../utils/mailer");
const { normalizePhone, caseUrl } = require("../utils/contact");
const notifyCustomer = require("../utils/notify");

const COMPLAINT_MAX_STAR = 3;

const getOutlet = async (req, res) => {
  try {
    const outlet = await Outlet.findOne({ slug: req.params.slug, isActive: true })
      .select("name slug type googleReviewUrl logo color");
    if (!outlet) return res.status(404).json({ message: "Outlet not found" });
    res.json(outlet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createRating = async (req, res) => {
  try {
    const outletSlug = String(req.body.outletSlug || "");
    const rating = Number(req.body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5)
      return res.status(400).json({ message: "Rating must be 1 to 5" });

    const outlet = await Outlet.findOne({ slug: outletSlug, isActive: true });
    if (!outlet) return res.status(404).json({ message: "Outlet not found" });

    await Rating.create({ outletId: outlet._id, rating });

    if (rating <= COMPLAINT_MAX_STAR) {
      sendMail(
        outlet.managerEmails,
        `${rating}-star rating at ${outlet.name}`,
        `A customer just gave ${rating} stars at ${outlet.name}. They are filling in the complaint form now, and you will get a second email with details.`
      );
    }
    res.status(201).json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createComplaint = async (req, res) => {
  try {
    const outletSlug = String(req.body.outletSlug || "");
    const submissionId =
      typeof req.body.submissionId === "string" ? req.body.submissionId : undefined;
    const name = String(req.body.name || "").trim();
    const text = String(req.body.text || "").trim();
    const rating = Number(req.body.rating);

    if (!name || !text)
      return res.status(400).json({ message: "Name and complaint are required" });
    if (text.length > 2000)
      return res.status(400).json({ message: "Complaint is too long" });
    if (!Number.isInteger(rating) || rating < 1 || rating > 5)
      return res.status(400).json({ message: "Rating must be 1 to 5" });

    const rawEmail = String(req.body.email || "").trim().toLowerCase();
    const email = /^\S+@\S+\.\S+$/.test(rawEmail) ? rawEmail : "";
    const phone = normalizePhone(req.body.phone);
    let contactPreference = ["whatsapp", "email"].includes(req.body.contactPreference)
      ? req.body.contactPreference
      : "none";
    if (contactPreference === "whatsapp" && !phone) contactPreference = "none";
    if (contactPreference === "email" && !email) contactPreference = "none";

    const outlet = await Outlet.findOne({ slug: outletSlug, isActive: true });
    if (!outlet) return res.status(404).json({ message: "Outlet not found" });

    if (submissionId) {
      const existing = await Complaint.findOne({ submissionId });
      if (existing) {
        Object.assign(existing, { name, email, phone, contactPreference, text });
        await existing.save();
        return res.json({
          id: existing._id,
          caseUrl: caseUrl(existing.caseToken),
          duplicate: true,
        });
      }
    }

    const complaint = await Complaint.create({
      outletId: outlet._id,
      submissionId,
      rating,
      name,
      email,
      phone,
      contactPreference,
      text,
    });

    const contactLine =
      contactPreference === "whatsapp"
        ? `WhatsApp: ${phone}`
        : contactPreference === "email"
        ? `Email: ${email}`
        : "Contact: not provided";

    sendMail(
      outlet.managerEmails,
      `Complaint at ${outlet.name} (${rating} stars)`,
      `Name: ${name}\n${contactLine}\nRating: ${rating}\n\nComplaint:\n${text}`
    );

    notifyCustomer(
      complaint,
      `We received your complaint at ${outlet.name}`,
      "Thank you for telling us. The manager has been notified and will get back to you."
    );

    res.status(201).json({ id: complaint._id, caseUrl: caseUrl(complaint.caseToken) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOutlet,
  createRating,
  createComplaint,
};