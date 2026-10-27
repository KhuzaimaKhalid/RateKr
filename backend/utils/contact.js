const normalizePhone = (value) => {
    let digits = String(value || "").replace(/\D/g, "");
    if (digits.startsWith("00")) digits = digits.slice(2);
    if (digits.startsWith("0")) digits = `92${digits.slice(1)}`;
    if (digits.length === 10 && digits.startsWith("3")) digits = `92${digits}`;
    return digits.length >= 11 && digits.length <= 15 ? digits : "";
  };
  
  const caseUrl = (token) =>
    `${process.env.CLIENT_URL || "http://localhost:5173"}/case/${token}`;
  
  const whatsappLink = (phone, text) =>
    phone ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}` : "";
  
  module.exports = { normalizePhone, caseUrl, whatsappLink };