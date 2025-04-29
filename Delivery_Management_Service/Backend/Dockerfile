# Use specific Node version for better predictability
FROM node:20-alpine

# Set environment variables early to optimize npm install
ENV NODE_ENV=production
ENV PORT=5002
ENV MONGO_URI=mongodb://mongo:27017/delivery-management
ENV ORDER_SERVICE_URL=http://order-service:5001
ENV ORDER_NOTIFICATION_SERVICE_URL=http://order-service:5001

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install dependencies with ci for more reliable builds
# --only=production reduces size by skipping dev dependencies
RUN npm ci --only=production

# Create a non-root user for better security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs

# Bundle app source
COPY --chown=nodeuser:nodejs . .

# Change to non-root user
USER nodeuser

# Expose port the app runs on
EXPOSE 5002

# Add health check to monitor container health
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget -qO- http://localhost:5002/health || exit 1

# Command to run the app
CMD ["node", "app.js"]