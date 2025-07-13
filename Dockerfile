# Use Node.js official image
FROM node:22-alpine AS build
# Set working directory
WORKDIR /app

COPY package*.json ./
COPY packages/client/package*.json ./packages/client/
COPY packages/server/package*.json ./packages/server/
COPY .env ./packages/server/.env

COPY node_modules ./node_modules

COPY packages/client/dist ./packages/client/dist
COPY packages/server/dist ./packages/server/dist

# Expose port 8080
EXPOSE 8080

# Start the server
CMD ["npm", "run", "start"] 