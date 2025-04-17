# step 8) Create static Web App for frontend
resource "azurerm_static_web_app" "frontend_webapp" {
  depends_on          = [azurerm_linux_web_app.backend_webapp]
  name                = "${local.name_prefix}-sonic-brief-${random_string.unique.result}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = var.static_web_location
  tags                = local.default_tags
  app_settings = {
    "VITE_BASE_URL" = "https://${local.base_name}.azurewebsites.net"
  }
}

resource "null_resource" "create_deploy_script" {
  triggers = { always_run = "${timestamp()}" }
  provisioner "local-exec" {
    command = <<EOT
      echo swa deploy ./frontend/ --env production --deployment-token '${azurerm_static_web_app.frontend_webapp.api_key}' > deploy.bat
    EOT
  }
}

resource "null_resource" "deploy_command" {
  depends_on = [null_resource.create_deploy_script]
  triggers   = { always_run = "${timestamp()}" }
  provisioner "local-exec" {
    command = "swa deploy ./frontend/ --env production --deployment-token '${azurerm_static_web_app.frontend_webapp.api_key}'"
  }
}
