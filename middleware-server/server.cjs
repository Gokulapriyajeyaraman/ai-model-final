const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express(); // Initialize express

app.use(cors());
app.use(bodyParser.json());

app.post("/predict", async (req, res) => {
  const transactionData = req.body;

  try {
    // Step 1: Call Flask model
    const response = await axios.post("http://localhost:5001/predict", transactionData);
    const prediction = response.data;

    console.log("📦 Model Prediction Received:", prediction);

    if (prediction.isFraud) {
      return res.status(400).json({ message: "❌ Fraud detected" });
    }

    // Step 2: Forward to bank server
    const bankResponse = await axios.post("http://localhost:5000/bank-process", transactionData);
    console.log("🏦 Bank Response:", bankResponse.data);

    res.json(bankResponse.data);
  } catch (error) {
    console.error("❗ Middleware error:", error.message);
    res.status(500).json({ message: "Error processing transaction" });
  }
});

// ✅ Start the server
app.listen(6001, () => {
  console.log("✅ Middleware server running on port 6001");
});
