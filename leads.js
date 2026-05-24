const router = require("express").Router();
const Lead = require("../models/Lead");
const auth = require("../middleware/auth");

// All leads (admin)
router.get("/", auth.adminOnly, async (req, res) => {
  const leads = await Lead.find().sort({ createdAt: -1 }).limit(500);
  res.json(leads);
});

// Worker's own leads
router.get("/mine", auth, async (req, res) => {
  const workerId = req.user.workerId;
  const leads = await Lead.find({ workerId }).sort({ createdAt: -1 });
  res.json(leads);
});

// Stats (admin)
router.get("/stats", auth.adminOnly, async (req, res) => {
  const total = await Lead.countDocuments();
  const totalPayout = await Lead.aggregate([{ $group: { _id: null, sum: { $sum: "$payout" } } }]);
  res.json({ total, totalPayout: totalPayout[0]?.sum || 0 });
});

module.exports = router;
