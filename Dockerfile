FROM node:14-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN rm -rf node_modules package-lock.json
RUN npm install
RUN npm ci
COPY . .
ARG API_URL
ENV API_URL=$API_URL
RUN npm run build:docker

FROM nginx:alpine
COPY --from=builder /app/dist/angular-frontend /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
