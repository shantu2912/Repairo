// backend/index.js
const twilio = require("twilio");

// Replace these with YOUR actual Twilio credentials
const accountSid = "ACb8ba8748a44336e97431339ba07584b2"; // Twilio Account SID
const authToken = "97b9c652be718144f78c7892793f7794";    // Twilio Auth Token
const twilioPhone = "+12544427616";          // Your Twilio number

const client = twilio(accountSid, authToken); // THIS MUST HAVE BOTH

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");


require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());


// In-memory OTP store (for demo purposes)
const otpStore = {};

app.post("/send-otp", async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Phone required" });

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000);

  try {
    await client.messages.create({
      body: `Your Repairo OTP is: ${otp}`,
      from: twilioPhone, // Your Twilio number
      to: phone
    });

    // Store OTP temporarily
    otpStore[phone] = otp;

    res.json({ success: true });
  } catch (err) {
    console.error(err);
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
