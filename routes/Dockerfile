#Sample Dockerfile for NodeJS Apps

# Use the official Node.js image
FROM node:18

# Set environment variables
ENV NODE_ENV=production

# Create and switch to the app directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install production dependencies (no devDependencies)
RUN npm ci --only=production

# Create a non-root user and switch to it
RUN adduser -D appuser
USER appuser

# Copy the rest of the app
COPY . .

# Expose the app's port
EXPOSE 3000

# Start the app
CMD ["node", "index.js"]