# AGENTS

Provide instructions to codex clients about agents in your repository using additional markdown files, and reference specific codex documentation files.

## Fields
- title: The display name for the agent in the UI
- prompt: Prompt to configure the agent with
- description: Optional short description for the agent in the UI
- readme: Optional, adds a markdown file to include in context
- files: Optional list of files to include directly in context (default: [])

## Example
```json
[
  {
    "title": "My Agent",
    "prompt": "You are an agent in my repository.",
    "description": "Directional prompt for the agent.",
    "readme": ".codex/agents/my-agent.md",
    "files": ["README.md", "package.json","src/index.ts"],
  }
]
```
