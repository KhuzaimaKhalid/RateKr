const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { uploadLogo } = require("../middleware/upload");
const pub = require("../controllers/publicController");
const auth = require("../controllers/authController");
const dash = require("../controllers/dashboardController");
const admin = require("../controllers/adminController");
const caseCtrl = require("../controllers/caseController");

const publicLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 60 });
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
const caseLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 60 });

router.get("/outlets/:slug", pub.getOutlet);
router.post("/ratings", publicLimiter, pub.createRating);
router.post("/complaints", publicLimiter, pub.createComplaint);

router.post("/auth/login", loginLimiter, auth.login);

router.get("/cases/:token", caseCtrl.getCase);
router.post("/cases/:token/messages", caseLimiter, caseCtrl.addMessage);
router.post("/cases/:token/confirm", caseLimiter, caseCtrl.confirm);

router.get("/dashboard/stats", requireAuth, dash.stats);
router.get("/dashboard/complaints", requireAuth, dash.listComplaints);
router.get("/dashboard/complaints/:id", requireAuth, dash.getComplaint);
router.post("/dashboard/complaints/:id/messages", requireAuth, dash.replyToCustomer);
router.post("/dashboard/complaints/:id/action", requireAuth, dash.takeAction);

router.post("/admin/outlets", requireAuth, requireAdmin, uploadLogo, admin.createOutlet);
router.get("/admin/outlets", requireAuth, requireAdmin, admin.listOutlets);
router.patch("/admin/outlets/:id", requireAuth, requireAdmin, uploadLogo, admin.updateOutlet);
router.post("/admin/users", requireAuth, requireAdmin, admin.createUser);

module.exports = router;