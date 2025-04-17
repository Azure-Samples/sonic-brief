import os
import sys
# Add the parent directory to the system path to import modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from dotenv import load_dotenv
import unittest
from unittest.mock import patch, MagicMock
from analysis_service import AnalysisService
from config import AppConfig
from azure.identity import DefaultAzureCredential, get_bearer_token_provider


BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "data")

# ✅ Load test environment before anything else
load_dotenv(dotenv_path=".env")

class TestAnalysisService(unittest.TestCase):
    def setUp(self):
        self.config = AppConfig()  # Loads from .env.test
        self.service = AnalysisService(self.config)
        self.analysis_service = AnalysisService(self.config)
        self.credential = DefaultAzureCredential()

    @patch("analysis_service.get_bearer_token_provider")
    @patch("analysis_service.AzureOpenAI")
    @patch("analysis_service.DefaultAzureCredential")
    def test_analyze_success(self, mock_credential, mock_openai, mock_token_provider):
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_choice = MagicMock()
        mock_choice.message.content = "Mocked analysis response."
        mock_response.choices = [mock_choice]
        mock_client.chat.completions.create.return_value = mock_response
        mock_openai.return_value = mock_client

        result = self.service.analyze_conversation("Hello, how are you?", "Summarize this.")

        self.assertEqual(result["status"], "success")
        self.assertIn("Mocked analysis", result["analysis_text"])

    @patch("analysis_service.get_bearer_token_provider")
    @patch("analysis_service.AzureOpenAI")
    @patch("analysis_service.DefaultAzureCredential")
    def test_analyze_conversation_success(self, mock_cred, mock_openai, mock_token):
        # Arrange: mock OpenAI response
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_choice = MagicMock()
        mock_choice.message.content = "Child expressed excitement and seemed engaged. Discussed weekend activities."
        mock_response.choices = [mock_choice]
        mock_client.chat.completions.create.return_value = mock_response
        mock_openai.return_value = mock_client

        conversation = "Social Worker: What did you do this weekend?\nChild: I played soccer and watched cartoons."
        context = "Just conversation between social worker and kids and just extract key input and summarization"

        # Act
        result = self.analysis_service.analyze_conversation(conversation, context)

        # Assert
        self.assertEqual(result["status"], "success")
        self.assertIn("Child expressed excitement", result["analysis_text"])

    def test_real_conversation_summarization(self):
        # Load conversation and prompt from files
        with open(os.path.join(DATA_DIR, "conversation.txt"), "r") as conv_file:
            conversation = conv_file.read()

        with open(os.path.join(DATA_DIR, "prompt.md"), "r") as prompt_file:
            prompt = prompt_file.read()

        # Combine structured prompt with conversation
        full_prompt = f"{prompt}\n\n{conversation}"

        # Run real analysis
        result = self.service.analyze_conversation(conversation=conversation, context=prompt)

        # Show full output
        print("\n==== SUMMARY OUTPUT ====\n")
        print(result["analysis_text"])
        print("\n========================\n")

        # Optional: check for expected sections
        expected_sections = [
            "List of Attendees",
            "Discussion Points",
            "Elaboration on Each Discussion Point",
            "Actions to Take / Decisions Made"
        ]
        self.assertEqual(result["status"], "success")

        for section in expected_sections:
            with self.subTest(section=section):
                self.assertIn(section, result["analysis_text"])

if __name__ == "__main__":
    unittest.main()
