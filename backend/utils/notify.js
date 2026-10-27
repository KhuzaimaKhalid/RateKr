const sendMail = require("./mailer");
const { caseUrl } = require("./contact");

const notifyCustomer = (complaint, subject, text) => {
  if (complaint.contactPreference !== "email" || !complaint.email) return;
  sendMail(complaint.email, subject, `${text}\n\nView your case: ${caseUrl(complaint.caseToken)}`);
};

module.exports = notifyCustomer;