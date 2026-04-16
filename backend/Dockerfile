# Use a small Node base image to reduce pull time and attack surface.
FROM node:24-alpine3.21

# Set the runtime environment explicitly.
ENV NODE_ENV=production

WORKDIR /usr/src/app

# Copy dependency manifests first to maximise Docker layer cache reuse.
COPY package*.json ./

# Make npm installs more resilient on CI runners.
RUN npm config set fetch-retries 5 \
  && npm config set fetch-retry-mintimeout 20000 \
  && npm config set fetch-retry-maxtimeout 120000

# Install dependencies deterministically from the lockfile.
RUN npm ci --omit=dev

# Copy application source after dependencies are installed.
COPY . .

# Expose the API port used by the Node server.
EXPOSE 4000

# Start the API with the standard npm entrypoint.
CMD ["npm", "start"]
