# Use a small Node base image to reduce pull time and attack surface.
FROM node:24-alpine3.21

# Set the runtime environment explicitly.
ENV NODE_ENV=development

WORKDIR /usr/src/app

# Copy dependency manifests first to maximise Docker layer cache reuse.
COPY package*.json ./

# Install all dependencies required by the Vite development server.
RUN npm install

# Copy application source after dependencies are installed.
COPY . .

# Expose the frontend development server port (local default; Cloud Run sets PORT).
EXPOSE 5173

# Bind to all interfaces. Use PORT when set (e.g. Cloud Run), else 5173 for local Compose.
CMD ["sh", "-c", "npm run dev -- --host 0.0.0.0 --port ${PORT:-5173}"]
