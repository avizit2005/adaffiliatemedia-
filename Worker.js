const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const workerSchema = new mongoose.Schema({
  workerId:       { type: String, unique: true },
  fullName:       { type: String, required: true },
  email:          { type: String, required: true, unique: true, lowercase: true },
  password:       { type: String, required: true },
  address:        { type: String, default: "" },
  phone:          { type: String, default: "" },
  country:        { type: String, default: "" },
  city:           { type: String, default: "" },
  state:          { type: String, default: "" },
  zipcode:        { type: String, default: "" },
  status:         { type: String, enum: ["pending","approved","rejected"], default: "pending" },
  balance:        { type: Number, default: 0 },
  totalEarned:    { type: Number, default: 0 },
  totalLeads:     { type: Number, default: 0 },
  paymentMethod:  { type: String, default: "" },
  paymentAccount: { type: String, default: "" },
}, { timestamps: true });

// Auto-generate workerId
workerSchema.pre("save", async function(next) {
  if (!this.workerId) {
    const count = await mongoose.model("Worker").countDocuments();
    this.workerId = "W" + String(count + 1).padStart(5, "0");
  }
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

workerSchema.methods.comparePassword = function(plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model("Worker", workerSchema);
