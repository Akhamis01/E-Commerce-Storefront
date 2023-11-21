from flask import Flask, request, jsonify, session, url_for
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
import secrets
from datetime import datetime, timedelta
from itsdangerous import URLSafeTimedSerializer

app = Flask(__name__)
app.secret_key = "12345"
CORS(app)

app.config['MAIL_SERVER']='smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USERNAME'] = 'cps714group19@gmail.com'
app.config['MAIL_PASSWORD'] = 'tmsahizvhpitrubh'
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['SECURITY_PASSWORD_SALT'] = 'secure'
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


##############################################################################
#             Reset Password  Functions                                      #
##############################################################################

def send_password_reset_email(username, reset_token, email):
    reset_url = url_for('reset_password', token=reset_token, _external=True)
    msg = Message('Password Reset Request', sender='cps714group19@gmail.com', recipients=[email])
    msg.html = f"""
                <html>
                <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; text-align: center;">

                    <div style="background-color: #3498db; color: #ffffff; padding: 20px;">
                    <h2>Password Reset Request</h2>
                    </div>

                    <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <p>Hello {username},</p>
                    <p>We received a request to reset your password. Please use the following link to reset your password:</p>
                    <a href="http://localhost:3000/reset-password?token={reset_token}" style="display: inline-block; padding: 10px 20px; background-color: #3498db; color: #ffffff; text-decoration: none; border-radius: 5px;">Reset Password</a>
                    <p>If you did not request this, please ignore this email. Your reset token is: {reset_token}</p>
                    </div>

                    <p style="color: #7f8c8d;">This is an automated email. Please do not reply.</p>
                </body>
                </html>
                """
    mail.send(msg)

def generate_reset_token(userId):
    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    return serializer.dumps(userId, salt=app.config['SECURITY_PASSWORD_SALT'])

# Function to save reset token in the database
def save_reset_token(userId, reset_token):
    reset_expiry = datetime.now() + timedelta(hours=1)  # Token expires in 1 hour
    db.collection('PasswordReset').document(userId).set({
        'reset_token': reset_token,
        'expiry_time': reset_expiry
    })

def verify_reset_token(reset_token):
    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    try:
        userId = serializer.loads(reset_token, salt=app.config['SECURITY_PASSWORD_SALT'], max_age=3600)
        return userId
    except Exception as e:
        print(f"Error verifying reset token: {e}")
        return None

@app.route("/forgot-password", methods=['POST'])
def forgot_password():
    print("HERE")
    data = request.json
    email = data.get('email')

    user_query = db.collection('Users').where('email', '==', email).limit(1)
    user = user_query.get()

    if user_query.stream():
        print("one")
     
        user_data = user[0].to_dict()
        userId = user[0].id
        print(user_data)
        print(userId)
        reset_token = generate_reset_token(userId)
        save_reset_token(userId, reset_token)

        # Assuming 'username' is a field in your user data
        send_password_reset_email(user_data.get('username'), reset_token, email)

        return jsonify(alert="success")
    else:
        print("two")
        return jsonify(alert="error", message="User not found")

@app.route("/reset-password", methods=['POST'])
def reset_password():
    data = request.json
    reset_token = data.get('resetToken')
    new_password = data.get('newPassword')

    userId = verify_reset_token(reset_token)

    if userId:
        hashed_password = hashlib.sha1(new_password.encode('utf-8')).hexdigest()
        db.collection('Users').document(userId).update({'password': hashed_password})
        return jsonify(alert="success", message="Password reset successfully")
    else:
        return jsonify(alert="error", message="Invalid or expired reset token")

##############################################################################
#             Add Products Functions                                        #
##############################################################################

###########            Add Products                             ###########
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

###########            Remove Products                             ###########
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

###########            Get existing Products                             ###########
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


###########            Add existing Products                             ###########
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


###########            Get all Products                             ###########
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

###########            Search Products                             ###########
@app.route("/searchproduct", methods = ['POST'])
def searchProduct():
    productsRef = db.collection('Products')
    data = request.json
    searchQuery = str(data['search'])

    payload = []
    for product in productsRef.stream():
        productInfo = product.to_dict()
        
        if not productInfo['productName'].startswith(searchQuery):
            continue

        productID = hashlib.sha1(productInfo['productName'].encode('utf-8')).hexdigest()
        content = {'id': productID, 'quantity': productInfo['stockQuantity'], 'productName': productInfo['productName'], 'productDesc': productInfo['description'], 'category': productInfo['category'], 'price': productInfo['price'], 'picture': productInfo['productImage']}
        payload.append(content)
        content = {}

    return jsonify(payload)

##############################################################################
#             Discounts Functions                                            #
##############################################################################
@app.route("/getdiscount")
def getDiscount():
    currentDate = datetime.now().strftime("%Y/%m/%d")

    discountRef = db.collection('Discount Table')
    query = discountRef.where('discountDate', '==', currentDate).limit(1).stream()

    for doc in query:
        discount_data = doc.to_dict()
        discount = float(discount_data.get('discountPercent', 0.0))
        return jsonify({"discount": discount})

    return jsonify({"discount": 0.0})

##############################################################################
#             Orders Functions                                              #
##############################################################################


@app.route("/getorders")
def getOrders():
    all_categories = {
        0: 'Tshirt',
        1: 'Pants',
        2: 'Jacket',
        3: 'Sweater',
        4: 'Socks'
    }
    userId = session['id']

    if session['isAdmin'] == True:
        ordersRef = db.collection('Orders')
        productsRef = db.collection('Products')

        order_query = ordersRef.stream()
        payload = []

        for order in order_query:
            productId = order.get('productId')
            productDoc = productsRef.document(productId).get()
            
            content = {
                'productId': productId,
                'order_id': order.id,
                'userId': order.get('userId'),
                'quantity': order.get('quantity'),
                'date': order.get('datePurchased'),
                'productName': productDoc.get('productName'),
                'category': all_categories.get(productDoc.get('category')),
                'price': productDoc.get('price')
            }
            payload.append(content)

        return jsonify(payload)

    else:
        ordersRef = db.collection('Orders')
        productsRef = db.collection('Products')

        order_query = ordersRef.where('userId', '==', userId).stream()
        payload = []

        for order in order_query:
            productId = order.get('productId')
            productDoc = productsRef.document(productId).get()
            
            content = {
                'productId': productId,
                'orderId': order.id,
                'userId': order.get('userId'),
                'quantity': order.get('quantity'),
                'date': order.get('datePurchased'),
                'productName': productDoc.get('productName'),
                'category': all_categories.get(productDoc.get('category')),
                'price': productDoc.get('price')
            }
            payload.append(content)

        return jsonify(payload)


##############################################################################
#             Payment Functions                                               #
##############################################################################

@app.route("/addpayment", methods=['POST'])
def addPayment():
    if request.method == 'POST':
        data = request.json
        userId = session['id']
        cardType = data['cardType']
        cartName = data['cardName']
        cardNum = int(data['cardNum'])
        cardDate = str(data['cardDate'])
        cardCvv = int(data['cardCVV'])

        if session['isAdmin'] != True:
            user_payments_ref = db.collection('User Payments')
            payment_id = hashlib.sha1(f"{userId}{cardNum}".encode('utf-8')).hexdigest()

            existing_payment = user_payments_ref.where('userId', '==', userId).limit(1).stream()

            if not any(existing_payment):
                user_payments_ref.document(payment_id).set({
                    'paymentProvider': cardType,
                    'cardNum': cardNum,
                    'paymentExpiryDate': cardDate,
                    'cvv': cardCvv,
                    'paymentName': cartName,
                    'userId': userId
                })
                return jsonify(alert="success")

        return jsonify(alert="error")

@app.route("/trypaymentinfo", methods=['POST'])
def tryPaymentInfo():
    userId = session['id']
    user_payments_ref = db.collection('User Payments')
    
    payment_query = user_payments_ref.where('userId', '==', userId).limit(1).stream()

    for payment in payment_query:
        payment_info = payment.to_dict()
        content = {
            'alert': 'success',
            'paymentProvider': payment_info.get('paymentProvider', ''),
            'cardNum': int(payment_info.get('cardNum', 0)),
            'date': payment_info.get('paymentExpiryDate', ''),
            'cvv': int(payment_info.get('cvv', 0)),
            'name': payment_info.get('paymentName', '')
        }
        return jsonify(content)

    return jsonify(alert="error")


##############################################################################
#             CART Functions                                                 #
##############################################################################

@app.route("/addtocart", methods=['POST'])
def addToCart():
    if request.method == 'POST':
        cartsRef = db.collection('Carts')
        data = request.json

        productID = str(data['productID'])
        userID = session['id']

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
        print("HERE")
        data = request.json
        cartsRef = db.collection('Carts')
        productID = str(data['productID'])
        print(productID)
        userID = session['id']
        print(userID)

        if session['isAdmin'] != True: 
            query = cartsRef.where('productId', '==', productID).where('userId', '==', userID)
            for doc in query.get():
                doc.reference.delete()

            return jsonify(alert="success")
        
        return jsonify(alert="error")


@app.route("/getallcart")
def getAllCart():
    userId = session['id']

    if session['isAdmin'] != True:
        cartsRef = db.collection('Carts')
        productRef = db.collection('Products')
        cart_query = cartsRef.where('userId', '==', userId).stream()
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
    userId = session['id']
    cartsRef = db.collection('Carts')
    cart_query = cartsRef.where('userId', '==', userId).stream()
    payload = []

    for item in cart_query:
        payload.append(item.get('productId'))

    return jsonify(payload)


@app.route("/clearcart")
def clearCart():
    userId = session['id']
    cartsRef = db.collection('Carts')
    if session['isAdmin'] != True:
        clearCartQuery = cartsRef.where('userId', '==', userId)
        for doc in clearCartQuery.get():
            doc.reference.delete()

    return jsonify(alert="success")

###########            Remove from Cart and Add to Orders           ###########
@app.route("/removefrominventory")
def removeFromInventory():
    userId = session['id']
    currentDate = datetime.now().strftime("%Y/%m/%d %H:%M:%S")

    if session['isAdmin'] != True:
        cartsRef = db.collection('Carts')
        productsRef = db.collection('Products')

        cartQuery = cartsRef.where('userId', '==', userId).stream()

        productIdsArray = []
        for item in cartQuery:
            productId = item.get('productId')
            productIdsArray.append(productId)

        for productId in productIdsArray:
            ordersId = hashlib.sha1(f"{userId}{random.randint(0, 1000)}".encode('utf-8')).hexdigest()
            productsRef.document(productId).update({'stockQuantity': firestore.Increment(-1)})

            db.collection('Orders').document(ordersId).set({
                'userId': userId,
                'productId': productId,
                'quantity': 1,
                'datePurchased': currentDate
            })

        return jsonify(alert="success")

    return jsonify(alert="error")


##############################################################################
#             Filter Functions                                               #
##############################################################################

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


##############################################################################
#             Login Functions                                                #
##############################################################################

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


##############################################################################
#             Registration Functions                                         #
##############################################################################

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


##############################################################################
#             Verification Functions                                         #
##############################################################################

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
            user_doc.update({'isVerified': True})

            return jsonify(alert="success")

    return jsonify(alert="error")


##############################################################################
#             CONTACT Functions                                              #
##############################################################################

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


##############################################################################
#             Common Functions                                               #
##############################################################################

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

##############################################################################