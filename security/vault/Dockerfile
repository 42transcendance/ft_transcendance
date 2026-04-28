FROM docker.io/hashicorp/vault:latest

COPY config/vault.hcl /vault/config/vault.hcl
COPY tools/init.sh /vault/tools/init.sh

ENTRYPOINT ["sh", "-c", "vault server -config=/vault/config/vault.hcl & sleep 10 && sh /vault/tools/init.sh && wait"]
