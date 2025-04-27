FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your application runs on
EXPOSE 5003

# Set environment variables (these can be overridden at runtime)
ENV PORT=5003
ENV NODE_ENV=production
ENV MONGODB_URI=mongodb+srv://sithmaka:sithmaka1122@cluster.pvqvoqf.mongodb.net/Order_DB?retryWrites=true&w=majority&appName=Cluster
ENV JWT_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
ENV JWT_EXPIRES_IN=7d

# Command to run the application (changed from server.js to app.js)
CMD ["node", "app.js"]