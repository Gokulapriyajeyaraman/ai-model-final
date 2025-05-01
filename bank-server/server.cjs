const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('Error Connecting to DB: ', err));

mongoose.connection.once('open', () => {
  console.log('Connected to DB:', mongoose.connection.name);
});

// Schemas
const transactionSchema = new mongoose.Schema({
  accountNumber: String,
  cardNumber: String,
  expiry: String,
  amount: Number,
  timestamp: String,
  status: String,
  userName: String
});

const Transaction = mongoose.model('Transaction', transactionSchema, 'transactions');

const userSchema = new mongoose.Schema({
  name: String,
  accountNumber: String,
  cardNumber: String,
  expiry: String,
  cvv: String,
  balance: Number
});

const User = mongoose.model('User', userSchema, 'users');

// ✅ Only process already VERIFIED transactions (no AI check here)
app.post('/bank-process', async (req, res) => {
  const { cardNumber, expiry, cvv, amount, timestamp = new Date().toISOString() } = req.body;

  console.log('🟢 Processing verified transaction:', req.body);

  // Input validation
  if (!cardNumber || !expiry || !cvv || !amount) {
    return res.status(400).json({ status: 'Failed', message: 'Missing required fields' });
  }

  try {
    const user = await User.findOne({ cardNumber });

    if (!user || user.cvv !== cvv || user.expiry !== expiry) {
      console.log('❌ Invalid card details');
      await new Transaction({
        cardNumber, expiry, amount, timestamp, status: 'Failed', userName: 'Unknown'
      }).save();
      return res.status(403).json({ status: 'Failed', message: 'Invalid user or card details' });
    }

    // Balance Check
    if (user.balance < amount) {
      console.log('⚠️ Insufficient balance');
      await new Transaction({
        accountNumber: user.accountNumber,
        cardNumber,
        expiry,
        amount,
        timestamp,
        status: 'Failed',
        userName: user.name
      }).save();
      return res.json({ status: 'Failed', message: 'Insufficient balance' });
    }

    // ✅ Transaction Success
    user.balance -= amount;
    await user.save();

    await new Transaction({
      accountNumber: user.accountNumber,
      cardNumber,
      expiry,
      amount,
      timestamp,
      status: 'Success',
      userName: user.name
    }).save();

    console.log('✅ Transaction completed');
    return res.json({ status: 'Success', message: 'Payment processed successfully' });

  } catch (error) {
    console.error('❗ Error:', error.message);
    return res.status(500).json({ status: 'Failed', message: 'Server error. Please try again.' });
  }
});

// Admin routes
app.get('/get-transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ timestamp: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching transactions', error: err.message });
  }
});

app.get('/get-users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
});

app.post('/add-user', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json({ message: 'User added successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Error adding user', error: err.message });
  }
});

app.put('/update-user/:id', async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'User updated', user: updated });
  } catch (err) {
    res.status(400).json({ message: 'Error updating user', error: err.message });
  }
});

app.delete('/delete-user/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Error deleting user', error: err.message });
  }
});

app.listen(5000, () => {
  console.log('✅ Bank server running on port 5000');
});
