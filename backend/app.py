from flask import Flask, request, jsonify
from flask_cors import CORS
import re
from collections import Counter

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
