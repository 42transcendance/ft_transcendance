FROM docker.io/hashicorp/vault:latest
COPY tools/init.sh /vault/tools/init.sh
ENTRYPOINT ["sh", "-c", "vault server -dev -dev-root-token-id=myroot -dev-listen-address=0.0.0.0:8200 & sleep 5 && sh /vault/tools/init.sh && wait"]