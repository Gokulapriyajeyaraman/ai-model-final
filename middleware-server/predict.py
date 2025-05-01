import tensorflow as tf
from flask import Flask, request, jsonify
import numpy as np

model = tf.keras.models.load_model('fraud_detection_model.h5')
app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json

    # Process input
    cvvToken = hash(data['cvv']) % 1000000  # Fixed from 'cvvToken'
    expiry_month = int(data['expiry'].split('/')[0])
    expiry_year = int(data['expiry'].split('/')[1])
    amount = float(data['amount'])  # Removed scaling

    transaction = np.array([[expiry_month, expiry_year, cvvToken, amount]])
    transaction = transaction.reshape(transaction.shape[0], transaction.shape[1], 1)

    prediction = model.predict(transaction)

    return jsonify({'isFraud': bool(prediction[0][0] > 0.5)})

if __name__ == '__main__':
     app.run(debug=True, port=5001)

