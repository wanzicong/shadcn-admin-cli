# Claude Agent SDK - Coding Agent

A Python-based coding agent built with the Claude Agent SDK for code review, security analysis, and development tasks.

## Features

- **Code Review**: Analyze code for quality, bugs, and best practices
- **Security Analysis**: Identify security vulnerabilities and risks
- **Improvement Suggestions**: Get recommendations for code optimization
- **Extensible**: Easy to add new capabilities

## Prerequisites

- Python 3.10 or higher
- Poetry (for dependency management)
- Anthropic API key ([Get one here](https://console.anthropic.com/))

## Installation

### 1. Clone or navigate to the project directory

```bash
cd claude-agent
```

### 2. Install dependencies

The SDK installation may take some time as it downloads dependencies:

```bash
poetry install --no-root
```

If you encounter issues with Poetry, you can also use pip:

```bash
pip install -r requirements.txt
```

### 3. Set up your environment

Copy the example environment file and add your API key:

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:

```env
ANTHROPIC_API_KEY=your_api_key_here
```

**Get your API key**: Visit [https://console.anthropic.com/](https://console.anthropic.com/)

### 4. Complete SDK Installation

If the SDK didn't install automatically, install it manually:

```bash
poetry add claude-agent-sdk
# or
pip install claude-agent-sdk
```

## Usage

### Run the agent

```bash
poetry run python main.py
# or
python main.py
```

### Using as a module

```python
from main import CodingAgent

# Initialize the agent
agent = CodingAgent()

# Review code
review = agent.review_code("your_code_here")

# Analyze security
security_report = agent.analyze_security("your_code_here")

# Get improvements
suggestions = agent.suggest_improvements("your_code_here")
```

## Project Structure

```
claude-agent/
├── main.py              # Main agent implementation
├── pyproject.toml       # Poetry configuration
├── poetry.lock         # Dependency lock file
├── .env.example        # Environment variables template
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## Development

### Adding new features

The `CodingAgent` class is designed to be extensible. To add new capabilities:

1. Add a new method to the `CodingAgent` class in `main.py`
2. Define a prompt for the specific task
3. Call the Claude SDK with the prompt

Example:

```python
def optimize_performance(self, code: str, language: str = "python") -> str:
    """Analyze and optimize code performance."""
    prompt = f"Optimize this {language} code for performance..."
    # TODO: Call Claude SDK
    return response
```

### Customizing prompts

Prompts are defined in each method. You can customize them to:
- Add specific checklists
- Change the focus of analysis
- Include project-specific guidelines

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key | Required |
| `ANTHROPIC_MODEL` | Model to use | claude-3-sonnet-20240229 |
| `ANTHROPIC_MAX_TOKENS` | Max tokens for responses | 1024 |

### Dependencies

Main dependencies:
- `claude-agent-sdk`: The official Claude Agent SDK
- `python-dotenv`: For environment variable management

## Troubleshooting

### SDK not installing

If the SDK installation is slow or fails:

1. Ensure you have a stable internet connection
2. Try installing with pip: `pip install claude-agent-sdk`
3. Check Python version (3.10+ required)

### ImportError: No module named 'claude_agent_sdk'

This means the SDK isn't installed yet. Run:

```bash
pip install claude-agent-sdk
```

### API key errors

- Verify your API key is set in `.env`
- Check the key is valid at [https://console.anthropic.com/](https://console.anthropic.com/)
- Ensure there are no extra spaces in the `.env` file

## Next Steps

Once you have the basic agent running:

1. **Add Custom Tools**: Implement MCP (Model Context Protocol) tools for specific tasks
2. **Create Subagents**: Build specialized subagents for different code analysis tasks
3. **Configure Permissions**: Set up appropriate permissions for your use case
4. **Add Tests**: Create tests for your agent's functionality
5. **Deploy**: Package and deploy your agent for production use

## Resources

- [Claude Agent SDK Documentation](https://docs.claude.com/en/api/agent-sdk/)
- [Python SDK Reference](https://docs.claude.com/en/api/agent-sdk/python)
- [Anthropic Console](https://console.anthropic.com/)
- [MCP Documentation](https://docs.claude.com/en/api/agent-sdk/mcp)

## License

This project is provided as-is for educational and development purposes.

## Support

For issues and questions:
1. Check the [Claude documentation](https://docs.claude.com/en/api/agent-sdk/)
2. Search existing GitHub issues
3. Create a new issue with detailed information
