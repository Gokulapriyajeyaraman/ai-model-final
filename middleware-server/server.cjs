const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/predict", async (req, res) => {
  const transactionData = req.body;

  try {
    // Call Python Flask API on port 5001
    const response = await axios.post("http://localhost:5001/predict", transactionData);
    const prediction = response.data;

    if (prediction.isFraud) {
      return res.status(400).json({ message: "Fraud detected" });
    }

    // Forward to bank server
    const bankResponse = await axios.post("http://localhost:5000/bank-process", transactionData);
    res.json(bankResponse.data);
  } catch (error) {
    console.error("Middleware error:", error.message);
    res.status(500).json({ message: "Error processing transaction" });
  }
});

app.listen(6001, () => {
  console.log("✅ Middleware server running on port 6001");
});
