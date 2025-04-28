FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install dependencies
RUN npm install

# Bundle app source
COPY . .

# Environment variables
ENV PORT=5002
ENV NODE_ENV=production
ENV MONGO_URI=mongodb://mongo:27017/delivery-management
ENV ORDER_SERVICE_URL=http://order-service:5001
ENV ORDER_NOTIFICATION_SERVICE_URL=http://order-service:5001

# Expose port the app runs on
EXPOSE 5002

# Command to run the app
CMD ["node", "app.js"]