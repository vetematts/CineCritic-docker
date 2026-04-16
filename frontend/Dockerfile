# Base deps stage
FROM node:24-alpine3.21 AS deps

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci

# Dev stage (local docker compose)
FROM deps AS dev
ENV NODE_ENV=development
COPY . .
EXPOSE 5173
CMD ["sh", "-c", "npm run dev -- --host 0.0.0.0 --port 5173"]

# Build stage (production assets)
FROM deps AS build
COPY . .
RUN npm run build

# Runtime stage (Cloud Run)
FROM nginx:1.27-alpine AS prod
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 8080
ENTRYPOINT ["/entrypoint.sh"]
