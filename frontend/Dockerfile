# Use Alpine-based image for reduced attack surface and footprint
FROM node:lts-alpine

# Set execution environment to development mode
ENV NODE_ENV=development

WORKDIR /usr/src/app

# Copy definitions first to leverage layer caching for faster subsequent builds
COPY package*.json ./

# Install dependencies within the container environment
RUN npm install

# Copy source code; excluded files managed via .dockerignore
COPY . .

# Match Vite's default development port
EXPOSE 5173

# Run the Vite development server on all interfaces for container access
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
