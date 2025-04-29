FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files for better layer caching
COPY package*.json ./

# Install dependencies with ci for more reliable builds
RUN npm ci --only=production

# Create a non-root user for better security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs

# Create uploads directory with proper permissions
RUN mkdir -p uploads && chown -R nodeuser:nodejs uploads

# Copy application code with correct permissions
COPY --chown=nodeuser:nodejs . .

# Switch to non-root user
USER nodeuser

# Expose application port
EXPOSE 5000

# Set non-sensitive environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Add health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget -qO- http://localhost:5000/api/users/health || exit 1

# Command to run the application
CMD ["node", "server.js"]