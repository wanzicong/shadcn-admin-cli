"""
Claude Agent SDK - Coding Agent Example

This is a coding agent that demonstrates how to use the Claude Agent SDK
for code review, security analysis, and development tasks.

Before running:
1. Install the SDK: pip install claude-agent-sdk
2. Set your API key in the .env file
"""

import asyncio
import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class CodingAgent:
    """
    A coding agent that can perform code review, security analysis,
    and other development tasks using Claude.
    """

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the coding agent.

        Args:
            api_key: Your Anthropic API key. If not provided, will use ANTHROPIC_API_KEY from env.
        """
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")

        if not self.api_key:
            raise ValueError(
                "API key is required. Set ANTHROPIC_API_KEY environment variable "
                "or pass api_key parameter."
            )

        # TODO: Initialize the Claude SDK client here
        # The SDK uses async patterns
        # Example initialization (adjust based on actual SDK API):
        # from claude_agent_sdk import ClaudeAgentOptions, query
        # self.options = ClaudeAgentOptions(
        #     api_key=self.api_key,
        #     system_prompt="You are an expert coding assistant..."
        # )
        print("✓ Coding Agent initialized (SDK client not yet configured)")

    async def review_code(self, code: str, language: str = "python") -> str:
        """
        Review code for issues, best practices, and improvements.

        Args:
            code: The code to review
            language: Programming language of the code

        Returns:
            Review feedback
        """
        prompt = f"""
        Please review this {language} code and provide feedback on:
        1. Code quality and readability
        2. Potential bugs or issues
        3. Performance concerns
        4. Security vulnerabilities
        5. Adherence to best practices

        Code to review:
        ```{language}
        {code}
        ```

        Please provide constructive, actionable feedback.
        """

        # TODO: Call Claude SDK here using async/await
        # Example pattern (adjust based on actual SDK API):
        # from claude_agent_sdk import query, ClaudeAgentOptions
        #
        # options = ClaudeAgentOptions(
        #     system_prompt="You are an expert code reviewer...",
        #     api_key=self.api_key
        # )
        #
        # async for message in query(prompt=prompt, options=options):
        #     if message.type == "text":
        #         return message.text
        #     elif message.type == "tool_use":
        #         # Handle tool calls if needed
        #         pass

        return f"[SDK NOT INSTALLED] Code review would be performed here for:\n{prompt}"

    async def analyze_security(self, code: str, language: str = "python") -> str:
        """
        Analyze code for security vulnerabilities.

        Args:
            code: The code to analyze
            language: Programming language of the code

        Returns:
            Security analysis report
        """
        prompt = f"""
        Perform a security analysis of this {language} code. Look for:
        1. SQL injection vulnerabilities
        2. XSS vulnerabilities
        3. Command injection risks
        4. Authentication/authorization issues
        5. Data exposure risks
        6. Cryptographic issues
        7. Input validation problems

        Code to analyze:
        ```{language}
        {code}
        ```

        Provide specific examples and remediation recommendations.
        """

        # TODO: Call Claude SDK here with async/await
        return f"[SDK NOT INSTALLED] Security analysis would be performed here for:\n{prompt}"

    async def suggest_improvements(self, code: str, language: str = "python") -> str:
        """
        Suggest code improvements and optimizations.

        Args:
            code: The code to improve
            language: Programming language of the code

        Returns:
            Improvement suggestions
        """
        prompt = f"""
        Suggest improvements for this {language} code:
        1. Code structure and organization
        2. Performance optimizations
        3. Simplification opportunities
        4. Modern language features to use
        5. Design patterns that might help

        Code to improve:
        ```{language}
        {code}
        ```

        Provide before/after examples where helpful.
        """

        # TODO: Call Claude SDK here with async/await
        return f"[SDK NOT INSTALLED] Improvement suggestions would be provided here for:\n{prompt}"


async def main():
    """Main async entry point for the coding agent."""

    print("=" * 60)
    print("Claude Coding Agent")
    print("=" * 60)
    print()

    try:
        # Initialize the agent
        agent = CodingAgent()
        print("✓ Agent initialized successfully!")
        print()

        # Example code to review
        example_code = '''
def get_user_data(user_id):
    query = f"SELECT * FROM users WHERE id = {user_id}"
    conn = sqlite3.connect("app.db")
    cursor = conn.cursor()
    cursor.execute(query)
    result = cursor.fetchall()
    conn.close()
    return result
'''

        # Perform code review
        print("Code Review:")
        print("-" * 60)
        review = await agent.review_code(example_code, "python")
        print(review)
        print()

        # Security analysis
        print("Security Analysis:")
        print("-" * 60)
        security = await agent.analyze_security(example_code, "python")
        print(security)
        print()

        # Improvement suggestions
        print("Improvement Suggestions:")
        print("-" * 60)
        improvements = await agent.suggest_improvements(example_code, "python")
        print(improvements)
        print()

    except ValueError as e:
        print(f"Error: {e}")
        print()
        print("Please set your API key:")
        print("1. Copy .env.example to .env")
        print("2. Add your API key: ANTHROPIC_API_KEY=your_key_here")
        print("3. Get your key from: https://console.anthropic.com/")
        return 1

    except Exception as e:
        print(f"Unexpected error: {e}")
        return 1

    print("=" * 60)
    print("Agent execution completed!")
    print("=" * 60)
    return 0


if __name__ == "__main__":
    # Run the async main function
    exit_code = asyncio.run(main())
    exit(exit_code)
