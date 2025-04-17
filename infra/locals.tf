locals {
  name_prefix    = "${var.prefix}${var.name}-${var.environment}"
  sha            = base64encode(sha256("${local.name_prefix}${var.environment}${var.location}${data.azurerm_client_config.current.subscription_id}"))
  resource_token = substr(replace(lower(local.sha), "[^A-Za-z0-9_]", ""), 0, 13)
  # api_command_line = "uvicorn main:app --host 0.0.0.0 --port 8000"
  api_command_line = "python3 -m gunicorn -w 2 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000  --reload  --log-level debug"

  default_tags = {
    Region      = var.location
    Environment = var.environment
    Owner       = "AI-TEAM"
    Project     = "ECHO-BRIEF"
    Stage       = "ECHO-BRIEF-SERVICE"
    ManagedBy   = "TERRAFORM"
    CostCenter  = "AI-TEAM"
  }

  # Command to run on Windows.
  base_name = "${local.name_prefix}-echo-brief-backend-api-${random_string.unique.result}"

}
