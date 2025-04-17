
resource "azurerm_service_plan" "az_func_audio_service_plan" {
  name                = "${local.name_prefix}-audio-processor-${random_string.unique.result}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  os_type             = "Linux"
  sku_name            = "B1"
  tags                = local.default_tags

}

data "archive_file" "az_func_audio_package" {
  type        = "zip"
  source_dir  = "../az-func-audio"
  output_path = "./az-func-audio.zip"
  excludes = [
    ".vscode/**",
    ".venv/**",
    "**/__pycache__/**",
    "tests/**",
    "README.md",
    ".env.sample",
    ".env",
    ".env.test",
    ".env.test.sample",
  ]
}

resource "azurerm_application_insights" "functions_app_insights" {
  name                = "${local.name_prefix}-audio-processor-${random_string.unique.result}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  application_type    = "web"
  tags                = local.default_tags
}

resource "azurerm_linux_function_app" "function_call_function_app" {
  depends_on          = [azurerm_cognitive_deployment.openai_deployments, azurerm_cosmosdb_account.voice_account, azurerm_storage_account.storage]
  name                = "${local.name_prefix}-audio-processor-${random_string.unique.result}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location

  service_plan_id      = azurerm_service_plan.az_func_audio_service_plan.id
  storage_account_name = azurerm_storage_account.storage.name

  site_config {
    always_on                              = true
    remote_debugging_enabled               = true
    application_insights_connection_string = azurerm_application_insights.functions_app_insights.connection_string
    application_stack {
      python_version = "3.11"
    }
    ftps_state = "AllAllowed"

    cors {
      allowed_origins = ["*"]
    }

  }

  app_settings = {
    AZURE_COSMOS_ENDPOINT = azurerm_cosmosdb_account.voice_account.endpoint

    AZURE_STORAGE_ACCOUNT_URL          = "https://${azurerm_storage_account.storage.name}.blob.core.windows.net"
    AZURE_STORAGE_RECORDINGS_CONTAINER = azurerm_storage_container.container.name

    audio__accountName = azurerm_storage_account.storage.name
    audio__credential  = "managedidentity"

    # Azure Cosmos DB Configuration
    AZURE_COSMOS_DB_PREFIX = "voice_"
    AZURE_COSMOS_DB        = azurerm_cosmosdb_sql_database.voice_db.name

    # Azure OpenAI Configuration
    AZURE_OPENAI_API_VERSION = var.openai_model_deployment_api_version
    AZURE_OPENAI_DEPLOYMENT  = var.openai_model_deployment_name
    AZURE_OPENAI_ENDPOINT    = azurerm_cognitive_account.openai.endpoint

    # Azure Speech Services Configuration
    AZURE_SPEECH_CANDIDATE_LOCALES    = "en-US,zu-ZA,af-ZA"
    AZURE_SPEECH_DEPLOYMENT           = azurerm_cognitive_account.SpeechServices.name
    AZURE_SPEECH_MAX_SPEAKERS         = "2"
    AZURE_SPEECH_TRANSCRIPTION_LOCALE = "en-US"
    AzureWebJobsStorage               = azurerm_storage_account.storage.primary_connection_string
  }
  identity {
    type = "SystemAssigned"
  }
  tags = local.default_tags
}


# Assign Cognitive Services Contributor role to the Web App
resource "azurerm_role_assignment" "cognitive_services_contributor" {
  depends_on           = [azurerm_linux_function_app.function_call_function_app, azurerm_cognitive_account.openai]
  scope                = azurerm_cognitive_account.openai.id
  role_definition_name = "Cognitive Services Contributor"

  principal_id                     = azurerm_linux_function_app.function_call_function_app.identity[0].principal_id
  skip_service_principal_aad_check = true
}


# Assign Cognitive Services OpenAI Contributor role to the Web App
resource "azurerm_role_assignment" "openai_contributor" {
  depends_on           = [azurerm_linux_function_app.function_call_function_app, azurerm_cognitive_account.openai]
  scope                = azurerm_cognitive_account.openai.id
  role_definition_name = "Cognitive Services OpenAI Contributor"

  principal_id                     = azurerm_linux_function_app.function_call_function_app.identity[0].principal_id
  skip_service_principal_aad_check = true

}

# Assign Cognitive Services OpenAI Contributor role to the Web App
resource "azurerm_role_assignment" "speech_contributor" {
  depends_on           = [azurerm_linux_function_app.function_call_function_app, azurerm_cognitive_account.SpeechServices]
  scope                = azurerm_cognitive_account.SpeechServices.id
  role_definition_name = "Cognitive Services Speech Contributor"

  principal_id                     = azurerm_linux_function_app.function_call_function_app.identity[0].principal_id
  skip_service_principal_aad_check = true

}

resource "azurerm_cosmosdb_sql_role_assignment" "data_reader_role" {
  depends_on          = [azurerm_linux_function_app.function_call_function_app, azurerm_cosmosdb_account.voice_account]
  name                = "736180af-7fbc-4c7f-9003-22735673c1c3"
  resource_group_name = azurerm_resource_group.rg.name
  account_name        = azurerm_cosmosdb_account.voice_account.name


  role_definition_id = azurerm_cosmosdb_sql_role_definition.data_reader.id
  principal_id       = azurerm_linux_function_app.function_call_function_app.identity[0].principal_id
  scope              = azurerm_cosmosdb_account.voice_account.id


}

resource "azurerm_cosmosdb_sql_role_assignment" "data_contributor_role" {
  depends_on          = [azurerm_linux_function_app.function_call_function_app, azurerm_cosmosdb_account.voice_account]
  name                = "736180af-7fbc-4c7f-9003-22895173c1c3"
  resource_group_name = azurerm_resource_group.rg.name
  account_name        = azurerm_cosmosdb_account.voice_account.name

  role_definition_id = azurerm_cosmosdb_sql_role_definition.data_contributor.id
  principal_id       = azurerm_linux_function_app.function_call_function_app.identity[0].principal_id
  scope              = azurerm_cosmosdb_account.voice_account.id

}


#Storage Account Contributor
resource "azurerm_role_assignment" "func_storage_account_contributor" {
  depends_on           = [azurerm_linux_function_app.function_call_function_app, azurerm_storage_account.storage]
  scope                = azurerm_storage_account.storage.id
  role_definition_name = "Storage Account Contributor"
  principal_id         = azurerm_linux_function_app.function_call_function_app.identity[0].principal_id
}

#Storage Blob Data Contributor
resource "azurerm_role_assignment" "func_storage_blob_data_contributor" {
  depends_on           = [azurerm_linux_function_app.function_call_function_app, azurerm_storage_account.storage]
  scope                = azurerm_storage_account.storage.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azurerm_linux_function_app.function_call_function_app.identity[0].principal_id
}

#   Storage Queue Data Contributor
resource "azurerm_role_assignment" "func_storage_queue_data_contributor" {
  depends_on           = [azurerm_linux_function_app.function_call_function_app, azurerm_storage_account.storage]
  scope                = azurerm_storage_account.storage.id
  role_definition_name = "Storage Queue Data Contributor"
  principal_id         = azurerm_linux_function_app.function_call_function_app.identity[0].principal_id
}

#recordingcontainer
resource "azurerm_role_assignment" "func_recording_container_storage_contributor" {
  depends_on           = [azurerm_linux_function_app.function_call_function_app, azurerm_storage_container.container]
  scope                = azurerm_storage_container.container.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azurerm_linux_function_app.function_call_function_app.identity[0].principal_id
}

resource "time_sleep" "wait_before_start" {
  depends_on      = [azurerm_linux_function_app.function_call_function_app]
  create_duration = "120s" # Adjust the time as needed
}


# # Define local-exec provisioner to run az cli commands

resource "null_resource" "publish_function_call_zip" {
  # triggers = { always_run = "${timestamp()}" }
  provisioner "local-exec" {
    command = "az functionapp deployment source config-zip --subscription ${var.subscription_id}  --resource-group ${azurerm_linux_function_app.function_call_function_app.resource_group_name} --name ${azurerm_linux_function_app.function_call_function_app.name} --src ${data.archive_file.az_func_audio_package.output_path} --build-remote true  --timeout 600"
  }
  depends_on = [azurerm_linux_function_app.function_call_function_app, time_sleep.wait_before_start]
}
