# E-Commerce Store

E-commerce store web application with industry standard features. Functionality for both Admin and customers.

## Getting started

Setup the backend and frontend separately, then visit http://localhost:3000/home to view the application.

### Setup backend

```bash
cd E-Commerce-Storefront/backend
pip3 install -r requirements.txt
export FLASK_APP=app.py
export FLASK_ENV=development
export FLASK_DEBUG=true
flask --app app run
```

### Setup frontend

```bash
cd E-Commerce-Storefront/frontend
npm install
npm start
```

## Note
Make sure the `key.json` is located in `E-Commerce-Storefront/backend/`
