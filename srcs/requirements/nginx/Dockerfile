FROM debian:bookworm

RUN apt-get update -y \
 && apt-get upgrade -y \
 && apt-get install -y nginx \
                       openssl \
                       libnginx-mod-http-modsecurity \
                       wget \
 && mkdir -p /etc/nginx/ssl \
 && openssl req -x509 -nodes \
        -out /etc/nginx/ssl/ft_transcendance.crt \
        -keyout /etc/nginx/ssl/ft_transcendance.key \
        -subj "/C=FR/ST=IDF/L=Paris/O=42/OU=42/CN=login.42.fr/UID=login" \
 && mkdir -p /var/run/nginx \
 && mkdir -p /etc/nginx/modsecurity \
 && wget -O /etc/nginx/modsecurity/modsecurity.conf \
        https://raw.githubusercontent.com/owasp-modsecurity/ModSecurity/v3/master/modsecurity.conf-recommended \
 && wget -O /etc/nginx/modsecurity/unicode.mapping \
        https://raw.githubusercontent.com/owasp-modsecurity/ModSecurity/v3/master/unicode.mapping \
 && wget -O /tmp/crs.tar.gz \
        https://github.com/coreruleset/coreruleset/archive/refs/tags/v3.3.5.tar.gz \
 && tar -xzf /tmp/crs.tar.gz -C /etc/nginx/modsecurity/ \
 && mv /etc/nginx/modsecurity/coreruleset-3.3.5 /etc/nginx/modsecurity/crs \
 && cp /etc/nginx/modsecurity/crs/crs-setup.conf.example \
       /etc/nginx/modsecurity/crs/crs-setup.conf \
 && rm -rf /var/lib/apt/lists/* /tmp/*

COPY conf/nginx.conf /etc/nginx/nginx.conf
COPY conf/modsecurity.conf /etc/nginx/modsecurity/main.conf

CMD ["nginx", "-g", "daemon off;"]