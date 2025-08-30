# Use a slim Node image
FROM node:20-alpine

WORKDIR /app

# Copy package.json and lockfiles if present
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# Install only production dependencies
RUN npm ci --omit=dev || npm install --omit=dev

# Copy the app source
COPY . .

# Expose port
EXPOSE 8080

# Set default envs (can be overridden at runtime)
ENV PORT=8080 \
    API_BASE_URL=https://api.kolosal.ai \
    DOCLING_BASE_URL=https://api.kolosal.ai \
    MARKITDOWN_BASE_URL=https://api.kolosal.ai

# Start server
CMD ["npm", "start"]
