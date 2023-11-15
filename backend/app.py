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
        usersRef = db.collection('Users')
        data = request.json
        username = str(data['username'])
        password = str(data['password'])
        userID = hashlib.sha1(username.encode('utf-8')).hexdigest()
        hashPassword = hashlib.sha1(password.encode('utf-8')).hexdigest()

        userInfo = usersRef.document(userID).get().to_dict()

        if userInfo is None:
            return jsonify(alert="error")

        if username == userInfo['username'] and hashPassword == userInfo['password']:
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
        hashPassword = hashlib.sha1(password.encode('utf-8')).hexdigest()
        userInfo = usersRef.document(userID).get().to_dict()

        if userInfo is None:
            verification_code = random.randint( (10**(5)), ((10**6)-1) ) # random 6 digit number
            msg = Message('Email Verification', sender = 'cps714group19@gmail.com', recipients=[email])
            msg.html =  f"""
                            <html>
                                <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; text-align: center;">

                                    <div style="background-color: #3498db; color: #ffffff; padding: 20px;">
                                        <h2>Email Verification</h2>
                                    </div>

                                    <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; margin: 20px 0;">
                                        <p>Dear {username},</p>
                                        <p>Thank you for registering with us! Please use the following code to verify your email:</p>
                                        <h3 style="color: #3498db;">{verification_code}</h3>
                                    </div>

                                    <p style="color: #7f8c8d;">This is an automated email. Please do not reply.</p>
                                </body>
                            </html>
                        """

            try:
                mail.send(msg)
            except:
                print('email sending failed')
                return jsonify(alert="error")

            usersRef.document(userID).set({
                'username': username,
                'password': hashPassword,
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



@app.route("/addproduct", methods = ['POST'])
def addproduct():
    if request.method == 'POST':
        productsRef = db.collection('Products')
        data = request.json
        productName = str(data['productName'])
        productDescription = str(data['productDescription'])
        category = str(data['category'])
        price = float(data['price'])
        productImage = str(data['picture'])

        productID = hashlib.sha1(productName.encode('utf-8')).hexdigest()

        if session['isAdmin'] == True:
            productsRef.document(productID).set({
                'productName': productName,
                'productImage': productImage,
                'price': price,
                'stockQuantity': 1,
                'description': productDescription,
                'category': category
            })
            return jsonify(alert="success")
        else:
            return jsonify(alert="error")

    return jsonify(alert="error")



@app.route("/addexistingproduct", methods = ['POST'])
def addExistingProduct():
    if request.method == 'POST':
        productsRef = db.collection('Products')
        data = request.json
        productID = str(data['productID'])
        
        if not productID:
            try:
                for product in productsRef.stream():
                    tempProductName = product.to_dict()['productName']
                    productID = hashlib.sha1(tempProductName.encode('utf-8')).hexdigest()
                    break
            except:
                return jsonify(alert='error')

        if session['isAdmin'] == True:
            productInfo = productsRef.document(productID)
            newProductQuantity = int(productInfo.get().to_dict()['stockQuantity']) + 1
            productInfo.update({'stockQuantity': str(newProductQuantity)})

            return jsonify(alert='success')

    return jsonify(alert='error')




@app.route("/getexistingproducts")
def getExistingProduct():
    productsRef = db.collection('Products')

    payload = []
    for product in productsRef.stream():
        productInfo = product.to_dict()
        productID = hashlib.sha1(productInfo['productName'].encode('utf-8')).hexdigest()
        content = {'id': productID, 'productName': productInfo['productName']}
        payload.append(content)
        content = {}

    return jsonify(payload)


@app.route("/getallproducts")
def getAllProducts():
    productsRef = db.collection('Products')

    payload = []
    for product in productsRef.stream():
        productInfo = product.to_dict()
        productID = hashlib.sha1(productInfo['productName'].encode('utf-8')).hexdigest()
        content = {'id': productID, 'quantity': productInfo['stockQuantity'], 'productName': productInfo['productName'], 'productDesc': productInfo['description'], 'category': productInfo['category'], 'price': productInfo['price'], 'picture': productInfo['productImage']}
        payload.append(content)
        content = {}

    return jsonify(payload)



@app.route("/deleteproduct", methods = ['POST'])
def deleteProduct():
    productsRef = db.collection('Products')
    data = request.json
    id = data['id']

    if session['isAdmin'] == True:
        productInfo = productsRef.document(id).delete()
    
    payload = []
    for product in productsRef.stream():
        productInfo = product.to_dict()
        productID = hashlib.sha1(productInfo['productName'].encode('utf-8')).hexdigest()
        content = {'id': productID, 'quantity': productInfo['stockQuantity'], 'productName': productInfo['productName'], 'productDesc': productInfo['description'], 'category': productInfo['category'], 'price': productInfo['price'], 'picture': productInfo['productImage']}
        payload.append(content)
        content = {}

    return jsonify(payload)



@app.route("/alterfilter", methods = ['POST'])
def alterFilter():
    productsRef = db.collection('Products')
    data = request.json
    category = str(data['category'])

    payload = []
    for product in productsRef.stream():
        productInfo = product.to_dict()

        if category != productInfo['category'] and category != 'All':
            continue
        productID = hashlib.sha1(productInfo['productName'].encode('utf-8')).hexdigest()
        content = {'id': productID, 'quantity': productInfo['stockQuantity'], 'productName': productInfo['productName'], 'productDesc': productInfo['description'], 'category': productInfo['category'], 'price': productInfo['price'], 'picture': productInfo['productImage']}
        payload.append(content)
        content = {}

    return jsonify(payload)



@app.route("/searchproduct", methods = ['POST'])
def searchProduct():
    productsRef = db.collection('Products')
    data = request.json
    searchQuery = str(data['search']).lower()

    payload = []
    for product in productsRef.stream():
        productInfo = product.to_dict()
        
        if not productInfo['productName'].lower().startswith(searchQuery):
            continue

        productID = hashlib.sha1(productInfo['productName'].encode('utf-8')).hexdigest()
        content = {'id': productID, 'quantity': productInfo['stockQuantity'], 'productName': productInfo['productName'], 'productDesc': productInfo['description'], 'category': productInfo['category'], 'price': productInfo['price'], 'picture': productInfo['productImage']}
        payload.append(content)
        content = {}

    return jsonify(payload)



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
        if str(verification_code) == str(stored_verification_code):
            # Update the user's verification status in the database
            user_doc.update({'isVerified': True})

            return jsonify(alert="success")

    return jsonify(alert="error")



@app.route("/addtocart", methods=['POST'])
def addToCart():
    if request.method == 'POST':
        cartsRef = db.collection('Carts')
        data = request.json

        productID = str(data['productID'])
        userID = str(session['id'])

        currentDate = datetime.now().strftime("%Y/%m/%d %H:%M:%S")

        cartID = hashlib.sha1(currentDate.encode('utf-8')).hexdigest()

        if session['isAdmin'] != True:         
            cartsRef.document(cartID).set({
                "productId": productID,
                "userId": userID,
                "date": currentDate
            })
            return jsonify(alert="success")

        return jsonify(alert="error")
    

@app.route("/removefromcart", methods = ['POST'])
def removeFromCart():
    if request.method == 'POST':
        data = request.json
        cartsRef = db.collection('Carts')
        productID = str(data['productID'])
        userID = str(session['id'])

        if session['isAdmin'] != True:
            query = cartsRef.where('productId', '==', productID).where('userId', '==', userID)
            for doc in query.get():
                doc.reference.delete()

            return jsonify(alert="success")
        
        return jsonify(alert="error")
    


@app.route("/getallcart")
def getAllCart():
    userId = str(session['id'])

    if session['isAdmin'] != True:
        # Assuming you have 'carts' and 'products' collections in Firestore
        cartsRef = db.collection('Carts')
        productRef = db.collection('Products')

        # Query to get cart items for the user
        cart_query = cartsRef.where('userId', '==', userId).stream()

        # Retrieve product information for each cart item
        payload = []
        all_categories = {
            0: 'Tshirt',
            1: 'Pants',
            2: 'Jacket',
            3: 'Sweater',
            4: 'Socks'
        }

        for cart_item in cart_query:
            product_id = cart_item.get('productId')
            product_doc = productRef.document(product_id).get()
            cart_item_data = {
                'id': cart_item.id,
                'date': cart_item.get('date'),
                'productName': product_doc.get('productName'),
                'category': all_categories.get((product_doc.get('category'))),
                'price': product_doc.get('price'),
                'productImage': product_doc.get('productImage'),
                'quantity': 1
            }
            payload.append(cart_item_data)

        return jsonify(payload)

    return jsonify(alert="error", message="Unauthorized")


@app.route("/getcart")
def getCart():
    userId = int(session['id'])
    cartsRef = db,collection('Carts')
    cart_query = cartsRef.where('userId', '==', userId).stream()
    payload = []

    for item in cart_query:
        payload.append(item.get('productId'))

    return jsonify(payload)



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
    if str(session['isAdmin']) == 'True':
        return jsonify(type = 'admin')
    return jsonify(type = 'customer')



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