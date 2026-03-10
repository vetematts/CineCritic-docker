# Use a small Node base image to reduce pull time and attack surface.
FROM node:lts-alpine

# Set the runtime environment explicitly.
ENV NODE_ENV=development

WORKDIR /usr/src/app

# Copy dependency manifests first to maximise Docker layer cache reuse.
COPY package*.json ./

# Install all dependencies required by the Vite development server.
RUN npm install

# Copy application source after dependencies are installed.
COPY . .

# Expose the frontend development server port.
EXPOSE 5173

# Bind to all interfaces so host port mapping can reach the dev server.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
