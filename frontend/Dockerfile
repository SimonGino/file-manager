# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Copy configuration files first
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application (skip type checking)
RUN npx vite build

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Create a template for nginx config
RUN echo 'server { \
    listen 80; \
    \
    # API requests proxy \
    location /api/ { \
        proxy_pass ${BACKEND_URL}/; \
        proxy_http_version 1.1; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
        \
        # Handle CORS \
        add_header Access-Control-Allow-Origin * always; \
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always; \
        add_header Access-Control-Allow-Headers "Authorization, Content-Type" always; \
        \
        # Handle OPTIONS method \
        if ($request_method = "OPTIONS") { \
            add_header Access-Control-Allow-Origin * always; \
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always; \
            add_header Access-Control-Allow-Headers "Authorization, Content-Type" always; \
            add_header Access-Control-Max-Age 1728000; \
            return 204; \
        } \
    } \
    \
    # Frontend static files \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/templates/default.conf.template

# Add script to replace environment variables
RUN echo '#!/bin/sh\n\
envsubst "\$BACKEND_URL" < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf\n\
nginx -g "daemon off;"' > /docker-entrypoint.sh && \
chmod +x /docker-entrypoint.sh

EXPOSE 80

CMD ["/docker-entrypoint.sh"] 