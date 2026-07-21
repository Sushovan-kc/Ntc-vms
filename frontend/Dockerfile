# frontend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies first to leverage Docker caching
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy application files
COPY . .

# Set environment variables for Vite
ENV NODE_ENV=development
ENV VITE_BACKEND_PROXY_TARGET=http://backend:8000

EXPOSE 3000

# Start the dev server with host flag for Docker access
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
