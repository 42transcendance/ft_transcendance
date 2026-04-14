FROM debian:bookworm

RUN apt-get update -y \
 && apt-get upgrade -y \
 && apt-get install -y adduser libfontconfig1 musl wget ca-certificates \
 && wget https://dl.grafana.com/oss/release/grafana_10.2.0_amd64.deb \
 && dpkg -i grafana_10.2.0_amd64.deb \
 && rm grafana_10.2.0_amd64.deb \
 && rm -rf /var/lib/apt/lists/*

# Provisioning : datasources et dashboards
COPY conf/datasources.yml /etc/grafana/provisioning/datasources/datasources.yml
COPY conf/dashboards.yml /etc/grafana/provisioning/dashboards/dashboards.yml
COPY dashboards/ /var/lib/grafana/dashboards/

EXPOSE 3000

CMD ["/usr/sbin/grafana-server", \
     "--homepath=/usr/share/grafana", \
     "--config=/etc/grafana/grafana.ini", \
     "cfg:default.paths.data=/var/lib/grafana", \
     "cfg:default.paths.logs=/var/log/grafana", \
     "cfg:default.paths.plugins=/var/lib/grafana/plugins", \
     "cfg:default.paths.provisioning=/etc/grafana/provisioning"]
