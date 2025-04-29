# Build stage
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Set environment variables
ARG VITE_API_BASE_URL=http://localhost:5004
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy package files for better layer caching
COPY package*.json ./

# Install dependencies with platform-specific bindings
RUN npm ci --platform=linux --arch=x64 --quiet

# Copy the rest of the application code
COPY . .

# Fix for Tailwind CSS build issue
RUN npm install --platform=linux --arch=x64 @tailwindcss/oxide

# Build the application with detailed error logging
RUN npm run build || (echo "Build failed with error:" && cat /tmp/vite-build-error.log && exit 1)

# Production stage - using lighter nginx alpine
FROM nginx:alpine

# Add metadata labels
LABEL maintainer="DigiDine Dev Team"
LABEL version="1.0"
LABEL description="Frontend for DigiDine Food Order System"

# Copy the build output to nginx's serve directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy a custom nginx configuration
COPY default.conf /etc/nginx/conf.d/default.conf

# Set proper permissions for security
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    # Ensure nginx can access required directories
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Switch to non-root user for better security
USER nginx

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
    CMD wget -qO- http://localhost/ || exit 1

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]