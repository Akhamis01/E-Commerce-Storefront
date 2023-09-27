from flask import Flask, request, jsonify, session
import json
import os
import random
from datetime import datetime

app = Flask(__name__)

@app.route("/home")
def main():
    return jsonify(name="home")