# Base image
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies with platform-specific bindings
RUN npm install --platform=linux --arch=x64

# Copy the rest of the application code
COPY . .

# Fix for Tailwind CSS build issue
RUN npm install --platform=linux --arch=x64 @tailwindcss/oxide

# Build the application
RUN npm run build || (cat /tmp/vite-build-error.log && exit 1)

# Production stage
FROM nginx:alpine

# Copy the build output to nginx's serve directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy a custom nginx configuration
COPY default.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]