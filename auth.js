const router = require("express").Router();
const jwt = require("jsonwebtoken");
const Worker = require("../models/Worker");

const sign = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

// Register worker
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword, address, phone, country, city, state, zipcode } = req.body;
    if (!fullName || !email || !password) return res.status(400).json({ error: "Required fields missing" });
    if (password !== confirmPassword) return res.status(400).json({ error: "Passwords do not match" });
    const exists = await Worker.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already registered" });
    const worker = await Worker.create({ fullName, email, password, address, phone, country, city, state, zipcode });
    res.json({ message: "Registered successfully. Awaiting admin approval.", workerId: worker.workerId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Worker login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    // Admin check
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = sign({ role: "admin", email });
      return res.json({ token, user: { role: "admin", email, fullName: "Administrator" } });
    }
    const worker = await Worker.findOne({ email });
    if (!worker) return res.status(400).json({ error: "Invalid credentials" });
    const ok = await worker.comparePassword(password);
    if (!ok) return res.status(400).json({ error: "Invalid credentials" });
    if (worker.status === "pending") return res.status(403).json({ error: "Account awaiting admin approval" });
    if (worker.status === "rejected") return res.status(403).json({ error: "Account has been rejected" });
    const token = sign({ role: "worker", id: worker._id, workerId: worker.workerId, email });
    const { password: _, ...safeWorker } = worker.toObject();
    res.json({ token, user: { ...safeWorker, role: "worker" } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
