import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from '../components/navbar';
import { API_URL } from "../config";



const ComplainPage = () => {
  const location = useLocation();

  const outlet = location.state?.outlet || {
    name: 'Burger Lab, Dolmen',
    slug: 'burger-lab-dolmen',
    googleReviewUrl: 'https://www.google.com/maps',
  };
  const rating = location.state?.rating || 3;

  const [name, setName] = useState("");
  const [complaint, setComplaint] = useState("");
  const [copied, setCopied] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [contactMethod, setContactMethod] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submissionId] = useState(() =>
    crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
  );

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  };

  const saveComplaint = async () => {
    if (!complaint.trim()) return;
    try {
      await fetch(`${API_URL}/complaints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outletSlug: outlet.slug,
          submissionId,
          rating,
          name: name.trim() || "Anonymous",
          text: complaint,
          contactPreference: contactMethod || "none",
          phone,
          email,
        }),
      });
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const handleCopy = async () => {
    await copyText(complaint);
    setCopied(true);
    saveComplaint();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveComplaint();
    window.location.href = outlet.googleReviewUrl;
  };

  return (
    <div>
      <Navbar />

      <form onSubmit={handleSubmit} className="container mt-4" style={{ maxWidth: "600px" }}>
        <h3 className="mb-3">We're sorry your experience wasn't great.</h3>
        <p className="text-muted">Tell us what happened at {outlet.name} so management can fix it.</p>

        <div className="mb-3 text-start">
          <label htmlFor="nameInput" className="form-label">Your Name</label>
          <input
            type="text"
            className="form-control"
            id="nameInput"
            placeholder="Enter your name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="mb-3 text-start">
          <label htmlFor="complaintTextarea" className="form-label">What went wrong?</label>
          <textarea
            className="form-control"
            id="complaintTextarea"
            rows="4"
            placeholder="Describe your issue..."
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
          ></textarea>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <button type="submit" className="btn btn-primary">
            Continue to Google
          </button>

          <button
            type="button"
            className="btn btn-outline-success"
            onClick={() => setShowContact(!showContact)}
          >
            {showContact ? "Hide contact options" : "How can we reach you?"}
          </button>

          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleCopy}
            disabled={!complaint.trim()}
          >
            {copied ? "Copied!" : "Copy my review"}
          </button>
        </div>

        {showContact && (
          <div className="card card-body mt-3 text-start">
            <p className="mb-2">How would you like us to reach you?</p>

            <div className="btn-group mb-3" role="group">
              <input
                type="radio"
                className="btn-check"
                name="contactMethod"
                id="viaWhatsapp"
                checked={contactMethod === "whatsapp"}
                onChange={() => setContactMethod("whatsapp")}
              />
              <label className="btn btn-outline-success" htmlFor="viaWhatsapp">WhatsApp</label>

              <input
                type="radio"
                className="btn-check"
                name="contactMethod"
                id="viaEmail"
                checked={contactMethod === "email"}
                onChange={() => setContactMethod("email")}
              />
              <label className="btn btn-outline-primary" htmlFor="viaEmail">Email</label>
            </div>

            {contactMethod === "whatsapp" && (
              <div className="mb-2">
                <label htmlFor="phoneInput" className="form-label">WhatsApp Number</label>
                <input
                  type="tel"
                  className="form-control"
                  id="phoneInput"
                  placeholder="03XX XXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            )}

            {contactMethod === "email" && (
              <div className="mb-2">
                <label htmlFor="emailInput" className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  id="emailInput"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            )}

            <div className="form-text">
              The manager may contact you about this complaint. Your details are used only for that.
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ComplainPage;