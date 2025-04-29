# Use an official Node runtime as the base image
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built assets from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/SimpleWebSocketServer.cjs ./
COPY --from=build /app/index.html ./

# Expose ports for web app and WebSocket server
EXPOSE 3000 1236

# Install concurrently to run multiple commands
RUN npm install -g concurrently

# Create a script to run both the static server and WebSocket server
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'npx serve -s dist -l 3000 & node SimpleWebSocketServer.cjs' >> /app/start.sh && \
    chmod +x /app/start.sh

# Use the start script as the entrypoint
CMD ["/app/start.sh"]