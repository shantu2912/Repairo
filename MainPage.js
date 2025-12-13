// backend/index.js
require("dotenv").config();
const twilio = require("twilio");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// Environment variables
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE;

const client = twilio(accountSid, authToken);

const app = express();
app.use(cors());
app.use(bodyParser.json());

// In-memory OTP store
const otpStore = {};

app.post("/send-otp", async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Phone required" });

  const otp = Math.floor(100000 + Math.random() * 900000);

  try {
    await client.messages.create({
      body: `Your Repairo OTP is: ${otp}`,
      from: twilioPhone,
      to: phone
    });

    otpStore[phone] = otp;
    res.json({ success: true });
  } catch (err) {
    console.error("Twilio error:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

app.post("/verify-otp", (req, res) => {
  const { phone, otp } = req.body;
  if (otpStore[phone] && otpStore[phone].toString() === otp.toString()) {
    delete otpStore[phone]; // OTP consumed
    res.json({ success: true });
  } else {
    res.status(400).json({ error: "Invalid OTP" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));

// ADMIN LOGIN
app.post("/admin-login", (req, res) => {
  const { username, password } = req.body;

  // Hardcoded admin credentials (CHANGE THESE)
  const ADMIN_USER = "Repairo2027";
  const ADMIN_PASS = "123456789";

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.json({ success: true });
  }

  return res.status(401).json({ success: false, message: "Invalid admin login" });
});
