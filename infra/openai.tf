variable "openai_model_deployment_name" {
  description = "Specifies the name of the Azure OpenAI Service model"
  type        = string
  default     = "o3-mini"
}

variable "openai_model_deployment_version" {
  description = "Specifies the version of the Azure OpenAI Service model"
  type        = string
  default     = "2025-01-31"
}
variable "openai_model_deployment_api_version" {
  description = "Specifies the API version of the Azure OpenAI Service model"
  type        = string
  default     = "2024-12-01-preview"

}
variable "openai_model_deployment_sku_name" {
  description = "Specifies the SKU name of the Azure OpenAI Service"
  type        = string
  default     = "GlobalStandard"
}
variable "openai_model_deployment_sku_capacity" {
  description = "Specifies the SKU capacity of the Azure OpenAI Service"
  type        = number
  default     = 20
}

resource "azurerm_cognitive_account" "openai" {
  resource_group_name           = azurerm_resource_group.rg.name
  custom_subdomain_name         = "${local.name_prefix}-openai-${random_string.unique.result}"
  kind                          = "OpenAI"
  local_auth_enabled            = true
  location                      = var.openai_location
  name                          = "${local.name_prefix}-openai"
  public_network_access_enabled = true
  sku_name                      = var.openai_sku
  tags                          = local.default_tags

  identity {
    type = "SystemAssigned"
  }

  lifecycle {
    ignore_changes = [
      tags
    ]
  }

}

resource "azurerm_cognitive_deployment" "openai_deployments" {
  cognitive_account_id   = azurerm_cognitive_account.openai.id
  name                   = var.openai_model_deployment_name
  version_upgrade_option = "OnceNewDefaultVersionAvailable"


  model {
    format  = "OpenAI"
    name    = var.openai_model_deployment_name
    version = var.openai_model_deployment_version
  }

  sku {
    name     = var.openai_model_deployment_sku_name
    capacity = var.openai_model_deployment_sku_capacity
  }
}


resource "azurerm_monitor_diagnostic_setting" "settings" {
  name                       = "${local.name_prefix}-openai-diagnostic"
  target_resource_id         = azurerm_cognitive_account.openai.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.log_analytics_workspace.id

  metric {
    category = "AllMetrics"
  }

  enabled_log {
    category = "Audit"
  }

  enabled_log {
    category = "RequestResponse"
  }

  enabled_log {
    category = "Trace"
  }


}
