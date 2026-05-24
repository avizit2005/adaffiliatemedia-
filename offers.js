const router = require("express").Router();
const auth = require("../middleware/auth");

const OFFERS = [
  { id: "1", name: "Rent To Own Gateway",              payout: 1.0,  link: "https://getownrenthomeus.netlify.app/",   category: "CPA", status: "active" },
  { id: "2", name: "Rent2Own",                          payout: 1.3,  link: "https://renttoownhomeus.netlify.app/",    category: "CPA", status: "active" },
  { id: "3", name: "CreditScoreIQ - $1 7 Day Trial",   payout: 15.0, link: "https://creditscore1dollar.netlify.app/", category: "CPA", status: "active" },
  { id: "4", name: "TransUnion Credit Scores Trial",   payout: 30.0, link: "https://transunionscore.netlify.app/",   category: "CPA", status: "active" },
  { id: "5", name: "Win a $1000 Amazon Gift Card",     payout: 1.0,  link: "https://amazonreward998.netlify.app/",   category: "CPA", status: "active" },
  { id: "6", name: "Cash App Gift Card",               payout: 1.3,  link: "https://cashappreward664.netlify.app/",  category: "CPA", status: "active" },
  { id: "7", name: "FlexJobs Work Opportunities",      payout: 3.0,  link: "https://usremoteflexjob.netlify.app/",   category: "CPA", status: "active" },
];

const SMARTLINKS = [
  { id: "sl1", name: "General Smartlink",  description: "Auto-optimized — best converting offer", baseLink: "https://adaffiliatemedia.com/go/general" },
  { id: "sl2", name: "Finance Smartlink",  description: "Finance-focused rotator",                baseLink: "https://adaffiliatemedia.com/go/finance" },
];

// Get all offers (workers + admin)
router.get("/", auth, (req, res) => {
  const workerId = req.user.workerId || req.user.id;
  const offers = OFFERS.map(o => ({
    ...o,
    trackingLink: `${o.link}?click_id=${workerId}_${Date.now()}&aff=${workerId}&offer=${o.id}`,
  }));
  res.json(offers);
});

// Get smartlinks
router.get("/smartlinks", auth, (req, res) => {
  const workerId = req.user.workerId || "DEMO";
  const links = SMARTLINKS.map(sl => ({
    ...sl,
    link: `${sl.baseLink}?wid=${workerId}`,
  }));
  res.json(links);
});

module.exports = router;
