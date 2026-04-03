# Use a small Node base image to reduce pull time and attack surface.
FROM node:24-alpine3.21

# Set the runtime environment explicitly.
ENV NODE_ENV=development

WORKDIR /usr/src/app

# Copy dependency manifests first to maximise Docker layer cache reuse.
COPY package*.json ./

# Install all dependencies required for local development commands.
RUN npm install

# Copy application source after dependencies are installed.
COPY . .

# Expose the API port used by the Node server.
EXPOSE 4000

# Start the API with the standard npm entrypoint.
CMD ["npm", "start"]
