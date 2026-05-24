const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema({
  withdrawalId: { type: String, unique: true },
  workerId:     { type: String, required: true },
  workerName:   { type: String, required: true },
  amount:       { type: Number, required: true },
  method:       { type: String, required: true, enum: ["Bkash","Nagad","Rocket"] },
  account:      { type: String, required: true },
  status:       { type: String, enum: ["pending","paid","rejected"], default: "pending" },
  paidAt:       { type: Date },
  invoiceData:  { type: Object },
}, { timestamps: true });

withdrawalSchema.pre("save", async function(next) {
  if (!this.withdrawalId) {
    const count = await mongoose.model("Withdrawal").countDocuments();
    this.withdrawalId = "WD" + String(count + 1).padStart(6, "0");
  }
  next();
});

module.exports = mongoose.model("Withdrawal", withdrawalSchema);
