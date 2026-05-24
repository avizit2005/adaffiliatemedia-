const router = require("express").Router();
const Withdrawal = require("../models/Withdrawal");
const Worker = require("../models/Worker");
const auth = require("../middleware/auth");

const MIN_WITHDRAW = 50;

// Submit withdrawal (worker)
router.post("/", auth, async (req, res) => {
  try {
    const { amount, method, account } = req.body;
    if (!method || !account) return res.status(400).json({ error: "Method and account required" });
    if (!["Bkash","Nagad","Rocket"].includes(method)) return res.status(400).json({ error: "Invalid payment method" });

    const worker = await Worker.findById(req.user.id);
    if (!worker) return res.status(404).json({ error: "Worker not found" });
    if (worker.balance < MIN_WITHDRAW) return res.status(400).json({ error: `Minimum withdrawal is $${MIN_WITHDRAW}` });

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < MIN_WITHDRAW) return res.status(400).json({ error: `Minimum withdrawal is $${MIN_WITHDRAW}` });
    if (amt > worker.balance) return res.status(400).json({ error: "Insufficient balance" });

    // Deduct balance immediately
    await Worker.findByIdAndUpdate(req.user.id, { $inc: { balance: -amt } });

    const wd = await Withdrawal.create({
      workerId:   worker.workerId,
      workerName: worker.fullName,
      amount:     amt,
      method,
      account,
      invoiceData: {
        workerEmail: worker.email,
        workerAddress: `${worker.address}, ${worker.city}, ${worker.country}`,
      },
    });

    res.json({ message: "Withdrawal request submitted. Pending admin approval.", withdrawal: wd });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get worker's own withdrawals
router.get("/mine", auth, async (req, res) => {
  const workerId = req.user.workerId;
  const wds = await Withdrawal.find({ workerId }).sort({ createdAt: -1 });
  res.json(wds);
});

// All withdrawals (admin)
router.get("/", auth.adminOnly, async (req, res) => {
  const wds = await Withdrawal.find().sort({ createdAt: -1 });
  res.json(wds);
});

// Approve withdrawal (admin)
router.patch("/:id/approve", auth.adminOnly, async (req, res) => {
  const wd = await Withdrawal.findByIdAndUpdate(
    req.params.id,
    { status: "paid", paidAt: new Date() },
    { new: true }
  );
  res.json(wd);
});

// Reject withdrawal (admin) — refund balance
router.patch("/:id/reject", auth.adminOnly, async (req, res) => {
  const wd = await Withdrawal.findById(req.params.id);
  if (!wd) return res.status(404).json({ error: "Not found" });
  // Refund balance
  await Worker.findOneAndUpdate({ workerId: wd.workerId }, { $inc: { balance: wd.amount } });
  wd.status = "rejected";
  await wd.save();
  res.json(wd);
});

module.exports = router;
