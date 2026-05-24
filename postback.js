const router = require("express").Router();
const Worker = require("../models/Worker");
const Lead = require("../models/Lead");

const OFFER_PAYOUTS = { "1":1.0,"2":1.3,"3":15.0,"4":30.0,"5":1.0,"6":1.3,"7":3.0 };
const OFFER_NAMES   = { "1":"Rent To Own Gateway","2":"Rent2Own","3":"CreditScoreIQ","4":"TransUnion","5":"Amazon Gift Card","6":"Cash App Gift Card","7":"FlexJobs" };

// GET /postback?worker_id=W00001&offer_id=3&payout=15&status=lead&click_id=abc123
router.get("/", async (req, res) => {
  try {
    const { worker_id, offer_id, payout, status = "lead", click_id } = req.query;
    if (!worker_id) return res.status(400).json({ error: "worker_id required" });

    const worker = await Worker.findOne({ workerId: worker_id });
    if (!worker) return res.status(404).json({ error: "Worker not found" });
    if (worker.status !== "approved") return res.status(403).json({ error: "Worker not approved" });

    const resolvedPayout = parseFloat(payout) || OFFER_PAYOUTS[offer_id] || 0;

    const lead = await Lead.create({
      workerId:  worker_id,
      offerId:   offer_id || "unknown",
      offerName: OFFER_NAMES[offer_id] || offer_id || "Unknown",
      payout:    resolvedPayout,
      status,
      clickId:   click_id || "",
      ip:        req.ip,
      userAgent: req.headers["user-agent"] || "",
    });

    // Credit worker if not rejected
    if (status !== "reject") {
      await Worker.findOneAndUpdate(
        { workerId: worker_id },
        { $inc: { balance: resolvedPayout, totalEarned: resolvedPayout, totalLeads: 1 } }
      );
    }

    res.json({ success: true, lead: lead._id, credited: resolvedPayout });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST version too
router.post("/", async (req, res) => {
  req.query = { ...req.query, ...req.body };
  // re-use GET handler logic
  const { worker_id, offer_id, payout, status = "lead", click_id } = req.query;
  try {
    if (!worker_id) return res.status(400).json({ error: "worker_id required" });
    const worker = await Worker.findOne({ workerId: worker_id });
    if (!worker) return res.status(404).json({ error: "Worker not found" });
    const resolvedPayout = parseFloat(payout) || OFFER_PAYOUTS[offer_id] || 0;
    await Lead.create({ workerId: worker_id, offerId: offer_id || "unknown", offerName: OFFER_NAMES[offer_id] || "", payout: resolvedPayout, status, clickId: click_id || "", ip: req.ip });
    if (status !== "reject") {
      await Worker.findOneAndUpdate({ workerId: worker_id }, { $inc: { balance: resolvedPayout, totalEarned: resolvedPayout, totalLeads: 1 } });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
