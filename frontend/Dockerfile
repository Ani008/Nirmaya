# Stage 1: build the React app
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: serve it with nginx (nginx also forwards /api to the backend)
FROM nginx:alpine
# Self-signed certificate so the app can also be opened over https (needed for the mic on phones)
RUN apk add --no-cache openssl \
 && mkdir -p /etc/nginx/certs \
 && openssl req -x509 -nodes -newkey rsa:2048 -days 825 \
      -keyout /etc/nginx/certs/nirmaya.key -out /etc/nginx/certs/nirmaya.crt \
      -subj "/CN=nirmaya.local" \
      -addext "subjectAltName=DNS:nirmaya.local,DNS:localhost,IP:127.0.0.1"
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
