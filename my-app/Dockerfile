FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (layer caching — faster rebuilds)
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy rest of the source
COPY . .

# Cloud Run listens on PORT env var (defaults to 8080 in Cloud Run)
ENV PORT=8080

EXPOSE 8080

CMD ["node", "api/server.js"]
