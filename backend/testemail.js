require("dotenv").config();
const nodemailer = require("nodemailer");

const t = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

t.sendMail({
  from: process.env.EMAIL_USER,
  to: "khuzaimaswati5@gmail.com",
  subject: "Test",
  text: "It works",
})
  .then((i) => console.log("Sent:", i.response))
  .catch((e) => console.error("FAILED:", e.message));