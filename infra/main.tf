# Where NodeGoat would run on Microsoft Azure.
# Demo landing zone for the KICS scan: the app runs as a container on App Service,
# MongoDB becomes Azure Cosmos DB for MongoDB, and the connection string lives in Key Vault
# (the same "move it to a vault" fix that 2ms asks for). Not meant to be applied as-is.

terraform {
  required_version = ">= 1.6"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}

provider "azurerm" {
  features {}
}

data "azurerm_client_config" "current" {}

locals {
  name = "${var.prefix}-${var.environment}"
  tags = {
    application = "nodegoat"
    environment = var.environment
    owner       = "appsec-demo"
  }
}

resource "azurerm_resource_group" "main" {
  name     = "rg-${local.name}"
  location = var.location
  tags     = local.tags
}

# ---------- Network: the app reaches the database and vault privately ----------

resource "azurerm_virtual_network" "main" {
  name                = "vnet-${local.name}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  address_space       = ["10.20.0.0/16"]
  tags                = local.tags
}

resource "azurerm_subnet" "app" {
  name                 = "snet-app"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.20.1.0/24"]
  service_endpoints    = ["Microsoft.AzureCosmosDB", "Microsoft.KeyVault"]

  delegation {
    name = "app-service"
    service_delegation {
      name    = "Microsoft.Web/serverFarms"
      actions = ["Microsoft.Network/virtualNetworks/subnets/action"]
    }
  }
}

# ---------- Database: Azure Cosmos DB for MongoDB ----------

resource "azurerm_cosmosdb_account" "db" {
  name                = "cosmos-${local.name}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  offer_type          = "Standard"
  kind                = "MongoDB"

  # Only reachable from the app subnet, never from the internet
  public_network_access_enabled     = false
  is_virtual_network_filter_enabled = true
  ip_range_filter                   = var.admin_ip_ranges

  virtual_network_rule {
    id = azurerm_subnet.app.id
  }

  capabilities {
    name = "EnableMongo"
  }

  consistency_policy {
    consistency_level = "Session"
  }

  geo_location {
    location          = azurerm_resource_group.main.location
    failover_priority = 0
  }

  tags = local.tags
}

resource "azurerm_cosmosdb_mongo_database" "nodegoat" {
  name                = "nodegoat"
  resource_group_name = azurerm_resource_group.main.name
  account_name        = azurerm_cosmosdb_account.db.name
}

# ---------- Secrets: Key Vault holds the database connection string ----------

resource "azurerm_key_vault" "main" {
  name                       = "kv-${local.name}"
  location                   = azurerm_resource_group.main.location
  resource_group_name        = azurerm_resource_group.main.name
  tenant_id                  = data.azurerm_client_config.current.tenant_id
  sku_name                   = "standard"
  enable_rbac_authorization  = true
  purge_protection_enabled   = true
  soft_delete_retention_days = 90

  network_acls {
    default_action             = "Deny"
    bypass                     = "AzureServices"
    ip_rules                   = var.admin_ip_ranges
    virtual_network_subnet_ids = [azurerm_subnet.app.id]
  }

  tags = local.tags
}

resource "azurerm_key_vault_secret" "mongodb_uri" {
  name            = "mongodb-uri"
  value           = azurerm_cosmosdb_account.db.primary_mongodb_connection_string
  key_vault_id    = azurerm_key_vault.main.id
  content_type    = "MongoDB connection string"
  expiration_date = var.secret_expiration_date
}

# ---------- App: NodeGoat container on App Service ----------

resource "azurerm_service_plan" "main" {
  name                = "asp-${local.name}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  os_type             = "Linux"
  sku_name            = "P1v3"
  tags                = local.tags
}

resource "azurerm_linux_web_app" "app" {
  name                      = "app-${local.name}"
  location                  = azurerm_resource_group.main.location
  resource_group_name       = azurerm_resource_group.main.name
  service_plan_id           = azurerm_service_plan.main.id
  https_only                = true
  virtual_network_subnet_id = azurerm_subnet.app.id

  identity {
    type = "SystemAssigned"
  }

  site_config {
    minimum_tls_version    = "1.2"
    ftps_state             = "Disabled"
    http2_enabled          = true
    vnet_route_all_enabled = true

    application_stack {
      docker_image_name   = var.container_image
      docker_registry_url = var.container_registry_url
    }
  }

  app_settings = {
    NODE_ENV = "production"
    # Read from Key Vault at runtime, so no secret sits in code or in this file
    MONGODB_URI = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.mongodb_uri.versionless_id})"
  }

  tags = local.tags
}

# The app's managed identity may read secrets, nothing else
resource "azurerm_role_assignment" "app_reads_secrets" {
  scope                = azurerm_key_vault.main.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_linux_web_app.app.identity[0].principal_id
}
