FROM docker.io/curlimages/curl:8.6.0
 
USER root
COPY init-kibana.sh /init-kibana.sh
COPY dashboard.ndjson /dashboard/dashboard.ndjson
RUN chmod +x /init-kibana.sh
ENTRYPOINT ["/bin/sh", "/init-kibana.sh"]
 
