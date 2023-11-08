from flask import Flask, request, jsonify, session
from functools import wraps
import json
import os
import random
import firebase_admin
from flask_cors import CORS
from datetime import datetime
from firebase_admin import credentials, initialize_app, db, firestore
from flask_mail import Mail, Message
import hashlib

app = Flask(__name__)
app.secret_key = "12345"
CORS(app)

app.config['MAIL_SERVER']='smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USERNAME'] = 'cps714group19@gmail.com'
app.config['MAIL_PASSWORD'] = 'tmsahizvhpitrubh'
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
mail = Mail(app)

cred = credentials.Certificate("./key.json")
initialize_app(cred)
db = firestore.client()

def logged_in(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if 'loggedIn' in session:
            return f(*args, **kwargs)
        else:
            return '<h1>Must be logged in to access this page</h1>'
    return wrap



@app.route('/login', methods = ['POST'])
def login():
    if request.method == 'POST':
        print('LOGIN POST')
        usersRef = db.collection('Users')
        data = request.json
        username = str(data['username'])
        password = str(data['password'])
        userID = hashlib.sha1(username.encode('utf-8')).hexdigest()
        userInfo = usersRef.document(userID).get().to_dict()

        if userInfo is None:
            return jsonify(alert="error")

        if username == userInfo['username'] and password == userInfo['password']:
            session['loggedIn'] = True
            session['username'] = username
            session['id'] = userID
            session['isAdmin'] = userInfo['isAdmin']

            is_verified = userInfo.get('isVerified', False)
            response_data = {
                'alert':'success',
                'isVerified': is_verified
            }
            return jsonify(response_data)

        return jsonify(alert="error")

    return jsonify(alert="error")



@app.route('/register', methods = ['POST'])
def register():
    if request.method == 'POST':
        usersRef = db.collection('Users')
        data = request.json
        username = str(data['username'])
        password = str(data['password'])
        email = str(data['email'])
        phone = str(data['phone'])
        address = str(data['address'])
        firstName = str(data['firstName'])
        lastName = str(data['lastName'])
        isAdmin = False
        userID = hashlib.sha1(username.encode('utf-8')).hexdigest()

        userInfo = usersRef.document(userID).get().to_dict()
        if userInfo is None:

            verification_code = "123456"
            msg = Message('Email Verification', sender = 'cps714group19@gmail.com', recipients=[email])
            msg.body = f'Here is your email verification code: {verification_code}'
            mail.send(msg)

            usersRef.document(userID).set({
                'username': username, 
                'password': password, 
                'email': email, 
                'phone': phone, 
                'address': address, 
                'firstName': firstName, 
                'lastName': lastName, 
                'isAdmin': isAdmin,
                'verification_code': verification_code,
                'isVerified': False
                })
            session['loggedIn'] = False
            session['username'] = username
            session['id'] = userID
            session['isAdmin'] = isAdmin
        else:
            return jsonify(alert="error")

        return jsonify(alert="success")

    return jsonify(alert="error")

@app.route('/verify', methods=['POST'])
def verify():
    if request.method == 'POST':
        data = request.json
        verification_code = data.get('verificationCode', '')

        if not verification_code:
            return jsonify(alert="error")

        username = session.get('username')
        if not username:
            return jsonify(alert="error")

        user_doc = db.collection('Users').document(hashlib.sha1(username.encode('utf-8')).hexdigest())
        user_data = user_doc.get().to_dict()

        if not user_data:
            return jsonify(alert="error")

        stored_verification_code = user_data.get('verification_code', '')
        if verification_code == stored_verification_code:
            # Update the user's verification status in the database
            user_doc.update({'isVerified': True, 'verification_code': ''})

            return jsonify(alert="success")

    return jsonify(alert="error")

@app.route('/contact', methods=['POST'])
def contact():
        if request.method == 'POST':
            data = request.json
            name = data.get('name', '')
            email = data.get('email', '')
            message = data.get('message', '')

            if not name or not email or not message:
                return jsonify(alert="error")

            usersRef = db.collection('Feedback')
            userID = session['id']
            usersRef.document(userID).set({
                'name': name, 
                'email': email, 
                'message': message
                })
            print(jsonify(alert="success"))
            return jsonify(alert="success")
        print(jsonify(alert="error"))
        return jsonify(alert="error")


@app.route("/getusertype")
@logged_in
def getUserType():
    return jsonify(type = str(session['isAdmin']))

@app.route("/getusername")
@logged_in
def getUsername():
    return jsonify(username = str(session['username']))

@app.route("/home")
def main():
    return jsonify(name="home")

@app.route("/logout", methods = ['GET'])
@logged_in
def logout():
    session.clear()
    return jsonify(alert="success")


if __name__ == "__main__":
    app.run(debug=True)