# Dockerfile
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Runtime ----
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY .env.production ./.env.production 2>/dev/null || true

EXPOSE 3000
CMD ["node", "dist/main.js"]
