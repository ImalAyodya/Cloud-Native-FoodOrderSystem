# 🍽️ Cloud-Native Food Order System

This is a cloud-native microservices-based food ordering system built using Node.js, Express, MongoDB, and React. It includes:

- 🔐 User Management and Payment Service  
- 📦 Order Management and Notification Service  
- 🍴 Restaurant Management Service  
- 🚚 Delivery Management Service  
- 💻 Frontend Interface

---

## 📥 Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/Cloud-Native-FoodOrderSystem.git
cd Cloud-Native-FoodOrderSystem

```
🛠️ **Step 2: Backend Services Setup**
---
🔐 User Management and Payment Service
```bash
cd User_Management_And_Payment_Service/backend
npm install
```

Create a .env file in the above directory with:

```bash
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://your-mongo-connection-string
JWT_SECRET=your-jwt-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=your-mailgun-domain
MAILGUN_URL=https://api.mailgun.net/v3
FRONTEND_URL=https://your-frontend-url.com
EMAIL_SERVICE=gmail
EMAIL_USER=salemanager516@gmail.com
EMAIL_PASS=byklfvxpgjyvrddf
EMAIL_FROM=salemanager516@gmail.com
TWILIO_ACCOUNT_SID=ACef89d944edc0577252aeac6c34f68001
TWILIO_AUTH_TOKEN=a34230519e165846f26e7ae42fe63568
TWILIO_PHONE_NUMBER=+15076323529
TWILIO_WHATSAPP_PHONE_NUMBER=+14155238886
STRIPE_SECRET_KEY=sk_test##########
STRIPE_WEBHOOK_SECRET=whse_############
```

📦 Order Management and Notification Service
```bash

cd Order_Mangement_And_Notification_Service/backend
npm install
```
Create a .env file:
```bash
PORT=5001
MONGO_URI=mongodb+srv://your-mongo-connection-string
EMAIL_USER=salemanager516@gmail.com
EMAIL_PASS=byklfvxpgjyvrddf
TWILIO_ACCOUNT_SID=ACef89d944edc0577252aeac6c34f68001
TWILIO_AUTH_TOKEN=a34230519e165846f26e7ae42fe63568
TWILIO_PHONE_NUMBER=+15076323529
```

🍴 Restaurant Management Service
```bash

cd Restaurant_Management_Service/backend
npm install
```

Create a .env file:
```bash
PORT=5003
NODE_ENV=development
MONGODB_URI=mongodb+srv://your-mongo-connection-string
```

🚚 Delivery Management Service
```bash

cd Delivery_Management_Service/backend
npm install
```

Create a .env file:
```bash
PORT=5002
NODE_ENV=development
MONGODB_URI=mongodb+srv://your-mongo-connection-string
```

## **💻 Step 3: Frontend Setup**
```bash
cd frontend
npm install
```

## **🐳 Step 4: Dockerizing All Services**
🏗️ Build Docker Images
```bash

# User Management Service
cd User_Management_And_Payment_Service
docker build -t user-service .

# Order Management Service
cd ../Order_Mangement_And_Notification_Service
docker build -t order-service .

# Restaurant Management Service
cd ../Restaurant_Management_Service
docker build -t restaurant-service .

# Delivery Management Service
cd ../Delivery_Management_Service
docker build -t delivery-service .

# Frontend
cd ../frontend
docker build -t frontend .
```
