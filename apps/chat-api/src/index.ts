import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import { GitHubTools } from './github-tools.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3002;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.VITE_GITHUB_TOKEN;

if (!ANTHROPIC_API_KEY) {
  console.error('Warning: ANTHROPIC_API_KEY not set. Chat functionality will not work.');
}

if (!GITHUB_TOKEN) {
  console.error('Warning: GITHUB_TOKEN not set. GitHub tools will not work.');
}

const anthropic = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null;
const githubTools = GITHUB_TOKEN ? new GitHubTools(GITHUB_TOKEN) : null;

const SYSTEM_PROMPT = `You are a helpful DevEx assistant that helps engineers query and understand their GitHub data. You have access to tools that can:

- List and search repositories
- View commits and commit history
- Check CI/CD pipeline status (GitHub Actions workflow runs)
- List pull requests and issues
- Search code across repositories
- Get repository statistics and branch information

When users ask questions about their repositories, pipelines, commits, or other GitHub data, use the appropriate tools to fetch the information and provide helpful, concise summaries.

Guidelines:
- Be concise and direct in your responses
- Format data in easy-to-read tables or lists when appropriate
- Highlight important information like failed pipelines, recent activity, or potential issues
- If you're unsure which repository they mean, ask for clarification or list available options
- Provide actionable insights when possible (e.g., "3 pipelines failed in the last hour - you may want to check these")`;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: Message[];
}

app.post('/api/chat', async (req, res) => {
  if (!anthropic) {
    return res.status(500).json({ error: 'Anthropic API key not configured' });
  }

  if (!githubTools) {
    return res.status(500).json({ error: 'GitHub token not configured' });
  }

  try {
    const { messages } = req.body as ChatRequest;

    const anthropicMessages = messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    let response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools: githubTools.getToolDefinitions(),
      messages: anthropicMessages,
    });

    // Handle tool use in a loop
    while (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
      );

      const toolResults = await Promise.all(
        toolUseBlocks.map(async (toolUse) => {
          const result = await githubTools.executeTool(toolUse.name, toolUse.input as Record<string, unknown>);
          return {
            type: 'tool_result' as const,
            tool_use_id: toolUse.id,
            content: JSON.stringify(result, null, 2),
          };
        })
      );

      response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        tools: githubTools.getToolDefinitions(),
        messages: [
          ...anthropicMessages,
          { role: 'assistant', content: response.content },
          { role: 'user', content: toolResults },
        ],
      });
    }

    // Extract text response
    const textBlock = response.content.find(
      (block): block is Anthropic.TextBlock => block.type === 'text'
    );

    res.json({
      message: textBlock?.text || 'No response generated',
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'An error occurred',
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    anthropic: !!anthropic,
    github: !!githubTools,
  });
});

app.listen(PORT, () => {
  console.log(`Chat API server running on http://localhost:${PORT}`);
  console.log(`Anthropic configured: ${!!anthropic}`);
  console.log(`GitHub configured: ${!!githubTools}`);
});
