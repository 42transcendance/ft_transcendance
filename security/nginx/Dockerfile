FROM docker.io/debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    nginx \
    libmodsecurity3 \
    libnginx-mod-http-modsecurity \
    modsecurity-crs \
    curl \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Certificat auto-signé sert à activer le chiffrement HTTPS (chiffrement TLS)
RUN mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 \
    -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/transcendence.key \
    -out /etc/nginx/ssl/transcendence.crt \
    -subj "/C=FR/ST=IDF/L=Paris/O=42/CN=transcendence.local"

COPY modsecurity/modsecurity.conf /etc/modsecurity/modsecurity.conf
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]