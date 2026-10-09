variable "prefix" {
  description = "Short name used in every resource name"
  type        = string
  default     = "nodegoat"
}

variable "environment" {
  description = "Environment name, for example dev or prod"
  type        = string
  default     = "dev"
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "westeurope"
}

variable "admin_ip_ranges" {
  description = "Office or VPN ranges allowed to reach Cosmos DB and Key Vault for administration"
  type        = list(string)
  default     = ["203.0.113.0/24"]
}

variable "container_image" {
  description = "NodeGoat container image and tag"
  type        = string
  default     = "nodegoat:latest"
}

variable "container_registry_url" {
  description = "Container registry that holds the NodeGoat image"
  type        = string
  default     = "https://example.azurecr.io"
}

variable "secret_expiration_date" {
  description = "When the stored connection string must be rotated (RFC 3339)"
  type        = string
  default     = "2027-06-30T00:00:00Z"
}
