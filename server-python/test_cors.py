import re
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://wayconnect.vercel.app",
    None,
    re.compile(r"https://.*\.onrender\.com")
]

try:
    CORS(app, resources={r"/api/*": {"origins": [o for o in ALLOWED_ORIGINS if o]}}, supports_credentials=True)
    print("CORS setup successful!")
except Exception as e:
    print(f"Error: {e}")
