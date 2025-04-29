FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies with strict versioning for production
RUN npm ci --only=production

# Create a non-root user for better security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs

# Copy application code with correct permissions
COPY --chown=nodeuser:nodejs . .

# Switch to non-root user
USER nodeuser

# Expose application port
EXPOSE 5001

# Environment variables (these should be overridden at runtime, not hardcoded)
ENV PORT=5001
ENV NODE_ENV=production
# Do NOT add sensitive credentials here - pass them at runtime

# Add health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget -qO- http://localhost:5001/health || exit 1

# Start the application
CMD ["node", "server.js"]