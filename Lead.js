const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
  workerId:  { type: String, required: true },
  offerId:   { type: String, default: "unknown" },
  offerName: { type: String, default: "" },
  payout:    { type: Number, default: 0 },
  status:    { type: String, enum: ["lead","sale","reject"], default: "lead" },
  clickId:   { type: String, default: "" },
  ip:        { type: String, default: "" },
  userAgent: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("Lead", leadSchema);
