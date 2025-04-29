FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json files first
COPY package*.json ./

# Install dependencies with better caching & security
RUN npm ci --only=production

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs

# Copy the rest of the application code with proper permissions
COPY --chown=nodeuser:nodejs . .

# Create uploads directory with proper permissions
RUN mkdir -p uploads && chown -R nodeuser:nodejs uploads

# Expose the port your application runs on
EXPOSE 5003

# Set NON-SENSITIVE environment variables only
# Sensitive values should be passed at runtime
ENV PORT=5003
ENV NODE_ENV=production
ENV USER_SERVICE_URL=http://user-management-service:5000

# Switch to non-root user for better security
USER nodeuser

# Add health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget -qO- http://localhost:5003/api || exit 1

# Command to run the application
CMD ["node", "app.js"]