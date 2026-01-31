#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { GitHubClient } from './github-client.js';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.VITE_GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.error('Error: GITHUB_TOKEN environment variable is required');
  process.exit(1);
}

const github = new GitHubClient(GITHUB_TOKEN);

const server = new Server(
  {
    name: 'mcp-github',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_repositories',
        description: 'List all GitHub repositories the user has access to. Returns repository names, descriptions, languages, star counts, and recent activity.',
        inputSchema: {
          type: 'object',
          properties: {
            sort: {
              type: 'string',
              enum: ['updated', 'pushed', 'full_name', 'created'],
              description: 'How to sort the repositories',
              default: 'updated'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of repositories to return',
              default: 20
            }
          },
        },
      },
      {
        name: 'get_repository_details',
        description: 'Get detailed information about a specific repository including description, language, stats, and recent activity.',
        inputSchema: {
          type: 'object',
          properties: {
            owner: {
              type: 'string',
              description: 'Repository owner (username or organization)',
            },
            repo: {
              type: 'string',
              description: 'Repository name',
            },
          },
          required: ['owner', 'repo'],
        },
      },
      {
        name: 'list_commits',
        description: 'List recent commits for a repository. Shows commit messages, authors, dates, and SHAs.',
        inputSchema: {
          type: 'object',
          properties: {
            owner: {
              type: 'string',
              description: 'Repository owner',
            },
            repo: {
              type: 'string',
              description: 'Repository name',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of commits to return',
              default: 10
            },
            branch: {
              type: 'string',
              description: 'Branch name (defaults to default branch)',
            }
          },
          required: ['owner', 'repo'],
        },
      },
      {
        name: 'list_workflow_runs',
        description: 'List CI/CD pipeline runs (GitHub Actions workflow runs) for a repository. Shows status, conclusions, durations, and triggering commits.',
        inputSchema: {
          type: 'object',
          properties: {
            owner: {
              type: 'string',
              description: 'Repository owner',
            },
            repo: {
              type: 'string',
              description: 'Repository name',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of workflow runs to return',
              default: 10
            },
            status: {
              type: 'string',
              enum: ['queued', 'in_progress', 'completed'],
              description: 'Filter by status',
            }
          },
          required: ['owner', 'repo'],
        },
      },
      {
        name: 'get_workflow_run_details',
        description: 'Get detailed information about a specific workflow run including jobs, steps, and logs summary.',
        inputSchema: {
          type: 'object',
          properties: {
            owner: {
              type: 'string',
              description: 'Repository owner',
            },
            repo: {
              type: 'string',
              description: 'Repository name',
            },
            run_id: {
              type: 'number',
              description: 'Workflow run ID',
            },
          },
          required: ['owner', 'repo', 'run_id'],
        },
      },
      {
        name: 'list_pull_requests',
        description: 'List pull requests for a repository. Shows titles, authors, status, and review state.',
        inputSchema: {
          type: 'object',
          properties: {
            owner: {
              type: 'string',
              description: 'Repository owner',
            },
            repo: {
              type: 'string',
              description: 'Repository name',
            },
            state: {
              type: 'string',
              enum: ['open', 'closed', 'all'],
              description: 'Filter by PR state',
              default: 'open'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of PRs to return',
              default: 10
            }
          },
          required: ['owner', 'repo'],
        },
      },
      {
        name: 'list_issues',
        description: 'List issues for a repository. Shows titles, authors, labels, and status.',
        inputSchema: {
          type: 'object',
          properties: {
            owner: {
              type: 'string',
              description: 'Repository owner',
            },
            repo: {
              type: 'string',
              description: 'Repository name',
            },
            state: {
              type: 'string',
              enum: ['open', 'closed', 'all'],
              description: 'Filter by issue state',
              default: 'open'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of issues to return',
              default: 10
            }
          },
          required: ['owner', 'repo'],
        },
      },
      {
        name: 'search_code',
        description: 'Search for code across repositories. Useful for finding specific patterns, functions, or configurations.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query (can include qualifiers like language:, repo:, path:)',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results',
              default: 10
            }
          },
          required: ['query'],
        },
      },
      {
        name: 'get_repo_stats',
        description: 'Get repository statistics including contributor activity, commit frequency, and code frequency.',
        inputSchema: {
          type: 'object',
          properties: {
            owner: {
              type: 'string',
              description: 'Repository owner',
            },
            repo: {
              type: 'string',
              description: 'Repository name',
            },
          },
          required: ['owner', 'repo'],
        },
      },
      {
        name: 'list_branches',
        description: 'List branches for a repository with protection status.',
        inputSchema: {
          type: 'object',
          properties: {
            owner: {
              type: 'string',
              description: 'Repository owner',
            },
            repo: {
              type: 'string',
              description: 'Repository name',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of branches to return',
              default: 20
            }
          },
          required: ['owner', 'repo'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list_repositories': {
        const repos = await github.listRepositories(args?.sort as string, args?.limit as number);
        return { content: [{ type: 'text', text: JSON.stringify(repos, null, 2) }] };
      }

      case 'get_repository_details': {
        const repo = await github.getRepository(args!.owner as string, args!.repo as string);
        return { content: [{ type: 'text', text: JSON.stringify(repo, null, 2) }] };
      }

      case 'list_commits': {
        const commits = await github.listCommits(
          args!.owner as string,
          args!.repo as string,
          args?.limit as number,
          args?.branch as string
        );
        return { content: [{ type: 'text', text: JSON.stringify(commits, null, 2) }] };
      }

      case 'list_workflow_runs': {
        const runs = await github.listWorkflowRuns(
          args!.owner as string,
          args!.repo as string,
          args?.limit as number,
          args?.status as string
        );
        return { content: [{ type: 'text', text: JSON.stringify(runs, null, 2) }] };
      }

      case 'get_workflow_run_details': {
        const run = await github.getWorkflowRunDetails(
          args!.owner as string,
          args!.repo as string,
          args!.run_id as number
        );
        return { content: [{ type: 'text', text: JSON.stringify(run, null, 2) }] };
      }

      case 'list_pull_requests': {
        const prs = await github.listPullRequests(
          args!.owner as string,
          args!.repo as string,
          args?.state as string,
          args?.limit as number
        );
        return { content: [{ type: 'text', text: JSON.stringify(prs, null, 2) }] };
      }

      case 'list_issues': {
        const issues = await github.listIssues(
          args!.owner as string,
          args!.repo as string,
          args?.state as string,
          args?.limit as number
        );
        return { content: [{ type: 'text', text: JSON.stringify(issues, null, 2) }] };
      }

      case 'search_code': {
        const results = await github.searchCode(args!.query as string, args?.limit as number);
        return { content: [{ type: 'text', text: JSON.stringify(results, null, 2) }] };
      }

      case 'get_repo_stats': {
        const stats = await github.getRepoStats(args!.owner as string, args!.repo as string);
        return { content: [{ type: 'text', text: JSON.stringify(stats, null, 2) }] };
      }

      case 'list_branches': {
        const branches = await github.listBranches(
          args!.owner as string,
          args!.repo as string,
          args?.limit as number
        );
        return { content: [{ type: 'text', text: JSON.stringify(branches, null, 2) }] };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP GitHub server running on stdio');
}

main().catch(console.error);
