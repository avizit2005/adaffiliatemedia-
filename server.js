const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "https://*.vercel.app",
    "https://*.netlify.app",
    /\.vercel\.app$/,
    /\.netlify\.app$/,
  ],
  credentials: true,
}));
app.use(express.json());

// Routes
app.use("/api/auth",       require("./routes/auth"));
app.use("/api/workers",    require("./routes/workers"));
app.use("/api/offers",     require("./routes/offers"));
app.use("/api/leads",      require("./routes/leads"));
app.use("/api/withdrawals",require("./routes/withdrawals"));
app.use("/postback",       require("./routes/postback"));

// Health check
app.get("/", (req, res) => res.json({ status: "ADaffiliateMedia API running", version: "1.0.0" }));

// Connect MongoDB + Start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch(err => { console.error("MongoDB error:", err); process.exit(1); });
