#!/bin/sh
# scripts/vault-init.sh - Pre-populates runtime secrets into HashiCorp Vault KV Engine

VAULT_ADDR="http://127.0.0.1:8200"
VAULT_TOKEN="root-dev-token"

echo "Configuring Vault KV secret engine..."
docker exec nodegoat-vault vault kv put secret/nodegoat \
  cookieSecret="VaultDynamicSessionSecret2026!" \
  cryptoKey="VaultDynamicDataCryptoKey2026!"

echo "Verifying secret storage in Vault:"
docker exec nodegoat-vault vault kv get secret/nodegoat