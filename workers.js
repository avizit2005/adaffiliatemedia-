const router = require("express").Router();
const Worker = require("../models/Worker");
const auth = require("../middleware/auth");

// Get all workers (admin)
router.get("/", auth.adminOnly, async (req, res) => {
  const workers = await Worker.find({}, "-password").sort({ createdAt: -1 });
  res.json(workers);
});

// Get pending workers (admin)
router.get("/pending", auth.adminOnly, async (req, res) => {
  const workers = await Worker.find({ status: "pending" }, "-password").sort({ createdAt: -1 });
  res.json(workers);
});

// Approve worker (admin)
router.patch("/:id/approve", auth.adminOnly, async (req, res) => {
  const worker = await Worker.findByIdAndUpdate(req.params.id, { status: "approved" }, { new: true, select: "-password" });
  res.json(worker);
});

// Reject worker (admin)
router.patch("/:id/reject", auth.adminOnly, async (req, res) => {
  const worker = await Worker.findByIdAndUpdate(req.params.id, { status: "rejected" }, { new: true, select: "-password" });
  res.json(worker);
});

// Get own profile (worker)
router.get("/me", auth, async (req, res) => {
  const worker = await Worker.findById(req.user.id, "-password");
  res.json(worker);
});

// Update own profile (worker)
router.patch("/me", auth, async (req, res) => {
  const allowed = ["fullName","address","phone","country","city","state","zipcode","paymentMethod","paymentAccount"];
  const update = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
  const worker = await Worker.findByIdAndUpdate(req.user.id, update, { new: true, select: "-password" });
  res.json(worker);
});

module.exports = router;
