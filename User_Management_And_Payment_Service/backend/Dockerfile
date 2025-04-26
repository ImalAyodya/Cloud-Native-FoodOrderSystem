FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your application runs on
EXPOSE 5000

# Set environment variables (these can be overridden at runtime)
ENV PORT=5000
ENV NODE_ENV=production

# Command to run the application
CMD ["sh", "-c", "node server.js"]