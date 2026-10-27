const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const Outlet = require("../models/Outlet");
const User = require("../models/User");

const removeFile = (filePath) => {
  if (filePath) fs.unlink(filePath, () => {});
};

const logoToPath = (logo) => path.join(__dirname, "..", logo);

const parseEmails = (value) => {
  if (!value) return [];
  const list = Array.isArray(value) ? value : [value];
  return list
    .flatMap((item) => String(item).split(","))
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
};

const createOutlet = async (req, res) => {
  try {
    console.log(req.body)
    const data = { ...req.body, managerEmails: parseEmails(req.body.managerEmails) };
    if (req.file) data.logo = `/uploads/logos/${req.file.filename}`;
    const outlet = await Outlet.create(data);
    res.status(201).json(outlet);
  } catch (error) {
    removeFile(req.file?.path);
    res.status(400).json({ message: error.message });
  }
};

const listOutlets = async (req, res) => {
  try {
    res.json(await Outlet.find().sort({ createdAt: -1 }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOutlet = async (req, res) => {
  try {
    const outlet = await Outlet.findById(req.params.id);
    if (!outlet) {
      removeFile(req.file?.path);
      return res.status(404).json({ message: "Outlet not found" });
    }
    const oldLogo = outlet.logo;
    const data = { ...req.body };
    if (req.body.managerEmails !== undefined) data.managerEmails = parseEmails(req.body.managerEmails);
    if (req.file) data.logo = `/uploads/logos/${req.file.filename}`;
    outlet.set(data);
    await outlet.save();
    if (req.file && oldLogo?.startsWith("/uploads/logos/")) removeFile(logoToPath(oldLogo));
    res.json(outlet);
  } catch (error) {
    removeFile(req.file?.path);
    res.status(400).json({ message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { email, password, role, outletIds } = req.body;
    if (!email || !password || password.length < 8)
      return res.status(400).json({ message: "Email and a password of 8+ characters required" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, role, outletIds });
    res.status(201).json({ id: user._id, email: user.email, role: user.role });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createOutlet,
  listOutlets,
  updateOutlet,
  createUser,
};