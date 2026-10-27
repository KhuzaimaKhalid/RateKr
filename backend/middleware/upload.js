const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const dir = path.join(__dirname, "..", "uploads", "logos");
fs.mkdirSync(dir, { recursive: true });

const extensions = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, dir),
  filename: (req, file, cb) => cb(null, `${crypto.randomUUID()}${extensions[file.mimetype]}`),
});

const fileFilter = (req, file, cb) => {
  if (extensions[file.mimetype]) return cb(null, true);
  cb(new Error("Only PNG, JPG or WEBP images are allowed"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single("logo");

const uploadLogo = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
};

module.exports = { uploadLogo };