FROM node:24-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/mobile/package.json apps/mobile/package.json
RUN npm ci

FROM node:24-alpine AS builder

WORKDIR /app

ARG EXPO_PUBLIC_API_URL=http://localhost:3000
ARG EXPO_PUBLIC_APP_BASE_URL=http://localhost:8081
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL
ENV EXPO_PUBLIC_APP_BASE_URL=$EXPO_PUBLIC_APP_BASE_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run export:web -w apps/mobile

FROM nginx:1.27-alpine AS runner

COPY apps/mobile/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/mobile/dist /usr/share/nginx/html

EXPOSE 80
