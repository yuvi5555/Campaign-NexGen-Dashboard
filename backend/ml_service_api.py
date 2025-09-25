from flask import Flask, request, jsonify
from flask_cors import CORS
from ml_service import predict  # import your existing predict function

app = Flask(__name__)
CORS(app, origins=["https://campaign-nex-gen-dashboard.vercel.app"])  # replace with your Vercel URL

@app.route("/predict", methods=["POST"])
def predict_endpoint()
    try:
        payload = request.get_json(force=True)
        result = predict(payload)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
