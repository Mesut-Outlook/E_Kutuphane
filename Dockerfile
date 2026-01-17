# Dockerfile for E_Kitap
# Multi-stage build for smaller image size

# Stage 1: Build React client
FROM node:18-alpine AS client-builder

WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --only=production
COPY client/ ./
RUN npm run build

# Stage 2: Production server
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy server files
COPY server.js ./
COPY ebooks_dataset.json ./

# Copy built React app
COPY --from=client-builder /app/client/build ./client/build

# Create data directory for SQLite database
RUN mkdir -p /app/data

# Environment variables
ENV NODE_ENV=production
ENV PORT=5050
ENV DB_PATH=/app/data/library.db
ENV LIBRARY_PATH=/library

# Expose port
EXPOSE 5050

# Start server
CMD ["node", "server.js"]
