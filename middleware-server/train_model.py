import pymongo
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, GRU, Conv1D, MaxPooling1D, Flatten, Dense, Dropout
from sklearn.model_selection import train_test_split
import os
from dotenv import load_dotenv

# Load environment variables (make sure you have .env file with MONGO_URI)
load_dotenv()
mongo_uri = os.getenv("MONGO_URI")

# ✅ Connect to MongoDB Atlas
client = pymongo.MongoClient(mongo_uri)
db = client['test']  # Your database name
collection = db['transactions']  # Your collection name

# ✅ Fetch the transaction data
data = collection.find({}, {"_id": 0, "cardNumber": 1, "expiry": 1, "cvv": 1, "amount": 1, "status": 1})

# ✅ Convert to pandas DataFrame
df = pd.DataFrame(list(data))

# ✅ Handle empty data
if df.empty:
    print("No data found in the collection.")
    exit()

# ✅ Dynamically assign 'isFraud' based on 'status' field
df['isFraud'] = df['status'].apply(lambda x: 1 if x in ['Fraud Detected'] else 0)

# ✅ Preprocess expiry (e.g., convert '04/26' into two columns)
df['expiry_month'] = df['expiry'].apply(lambda x: int(x.split('/')[0]) if isinstance(x, str) and len(x.split('/')) == 2 else 0)
df['expiry_year'] = df['expiry'].apply(lambda x: int(x.split('/')[1]) if isinstance(x, str) and len(x.split('/')) == 2 else 0)

# ✅ Select and preprocess features
X = df[['cardNumber', 'expiry_month', 'expiry_year', 'cvv', 'amount']].copy()

# Encode cardNumber and cvv to numbers (example encoding)
X['cardNumber'] = X['cardNumber'].apply(lambda x: hash(x) % 1000000)
X['cvv'] = X['cvv'].apply(lambda x: hash(x) % 1000000)

# Normalize amount
scaler = MinMaxScaler()
X['amount'] = scaler.fit_transform(X[['amount']])

# ✅ Labels
y = df['isFraud']

# ✅ Reshape for LSTM input
X = X.values.reshape(X.shape[0], X.shape[1], 1)

# ✅ Split the data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# ✅ Build hybrid CNN + LSTM + GRU model
model = Sequential()

# CNN layer for feature extraction
model.add(Conv1D(filters=32, kernel_size=3, activation='relu', input_shape=(X_train.shape[1], 1)))
model.add(MaxPooling1D(pool_size=2))

# LSTM layer for sequential dependencies
model.add(LSTM(50, return_sequences=True))
model.add(Dropout(0.2))

# GRU layer for sequential dependencies (alternative to LSTM)
model.add(GRU(50, return_sequences=False))
model.add(Dropout(0.2))

# Flatten and dense layers for output
model.add(Flatten())
model.add(Dense(50, activation='relu'))
model.add(Dropout(0.2))
model.add(Dense(1, activation='sigmoid'))

# ✅ Compile the model
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

# ✅ Train the model
history = model.fit(X_train, y_train, epochs=10, batch_size=32, validation_data=(X_test, y_test))

# ✅ Evaluate the model
loss, accuracy = model.evaluate(X_test, y_test)
print(f"Test Accuracy: {accuracy:.4f}")

# ✅ Save the trained model
model.save('fraud_detection_model.h5')
print("✅ Model saved as fraud_detection_model.h5")
