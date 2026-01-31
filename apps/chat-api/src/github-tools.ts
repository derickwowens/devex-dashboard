import type Anthropic from '@anthropic-ai/sdk';

const GITHUB_API_BASE = 'https://api.github.com';

export class GitHubTools {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `GitHub API error: ${response.status}`);
    }

    return response.json();
  }

  getToolDefinitions(): Anthropic.Tool[] {
    return [
      {
        name: 'list_repositories',
        description: 'List all GitHub repositories the user has access to. Returns repository names, descriptions, languages, star counts, and recent activity.',
        input_schema: {
          type: 'object' as const,
          properties: {
            sort: {
              type: 'string',
              enum: ['updated', 'pushed', 'full_name', 'created'],
              description: 'How to sort the repositories',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of repositories to return (default: 20)',
            },
          },
        },
      },
      {
        name: 'get_repository_details',
        description: 'Get detailed information about a specific repository including description, language, stats, and recent activity.',
        input_schema: {
          type: 'object' as const,
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
        input_schema: {
          type: 'object' as const,
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
              description: 'Maximum number of commits to return (default: 10)',
            },
            branch: {
              type: 'string',
              description: 'Branch name (defaults to default branch)',
            },
          },
          required: ['owner', 'repo'],
        },
      },
      {
        name: 'list_workflow_runs',
        description: 'List CI/CD pipeline runs (GitHub Actions workflow runs) for a repository. Shows status, conclusions, durations, and triggering commits.',
        input_schema: {
          type: 'object' as const,
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
              description: 'Maximum number of workflow runs to return (default: 10)',
            },
            status: {
              type: 'string',
              enum: ['queued', 'in_progress', 'completed'],
              description: 'Filter by status',
            },
          },
          required: ['owner', 'repo'],
        },
      },
      {
        name: 'list_all_workflow_runs',
        description: 'List recent CI/CD pipeline runs across ALL repositories. Useful for getting an overview of pipeline health.',
        input_schema: {
          type: 'object' as const,
          properties: {
            limit: {
              type: 'number',
              description: 'Maximum number of workflow runs per repository (default: 5)',
            },
          },
        },
      },
      {
        name: 'list_pull_requests',
        description: 'List pull requests for a repository. Shows titles, authors, status, and review state.',
        input_schema: {
          type: 'object' as const,
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
              description: 'Filter by PR state (default: open)',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of PRs to return (default: 10)',
            },
          },
          required: ['owner', 'repo'],
        },
      },
      {
        name: 'list_issues',
        description: 'List issues for a repository. Shows titles, authors, labels, and status.',
        input_schema: {
          type: 'object' as const,
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
              description: 'Filter by issue state (default: open)',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of issues to return (default: 10)',
            },
          },
          required: ['owner', 'repo'],
        },
      },
      {
        name: 'search_code',
        description: 'Search for code across repositories. Useful for finding specific patterns, functions, or configurations.',
        input_schema: {
          type: 'object' as const,
          properties: {
            query: {
              type: 'string',
              description: 'Search query (can include qualifiers like language:, repo:, path:)',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results (default: 10)',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_repo_stats',
        description: 'Get repository statistics including contributor activity and language breakdown.',
        input_schema: {
          type: 'object' as const,
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
        input_schema: {
          type: 'object' as const,
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
              description: 'Maximum number of branches to return (default: 20)',
            },
          },
          required: ['owner', 'repo'],
        },
      },
    ];
  }

  async executeTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    switch (name) {
      case 'list_repositories':
        return this.listRepositories(args.sort as string, args.limit as number);
      case 'get_repository_details':
        return this.getRepository(args.owner as string, args.repo as string);
      case 'list_commits':
        return this.listCommits(args.owner as string, args.repo as string, args.limit as number, args.branch as string);
      case 'list_workflow_runs':
        return this.listWorkflowRuns(args.owner as string, args.repo as string, args.limit as number, args.status as string);
      case 'list_all_workflow_runs':
        return this.listAllWorkflowRuns(args.limit as number);
      case 'list_pull_requests':
        return this.listPullRequests(args.owner as string, args.repo as string, args.state as string, args.limit as number);
      case 'list_issues':
        return this.listIssues(args.owner as string, args.repo as string, args.state as string, args.limit as number);
      case 'search_code':
        return this.searchCode(args.query as string, args.limit as number);
      case 'get_repo_stats':
        return this.getRepoStats(args.owner as string, args.repo as string);
      case 'list_branches':
        return this.listBranches(args.owner as string, args.repo as string, args.limit as number);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  async listRepositories(sort = 'updated', limit = 20) {
    const repos = await this.fetch<any[]>(
      `/user/repos?sort=${sort}&per_page=${limit}&affiliation=owner,collaborator,organization_member`
    );
    return repos.map(r => ({
      name: r.name,
      fullName: r.full_name,
      owner: r.owner.login,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      forks: r.forks_count,
      openIssues: r.open_issues_count,
      defaultBranch: r.default_branch,
      updatedAt: r.updated_at,
      pushedAt: r.pushed_at,
      url: r.html_url,
    }));
  }

  async getRepository(owner: string, repo: string) {
    const r = await this.fetch<any>(`/repos/${owner}/${repo}`);
    return {
      name: r.name,
      fullName: r.full_name,
      owner: r.owner.login,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      forks: r.forks_count,
      openIssues: r.open_issues_count,
      watchers: r.watchers_count,
      defaultBranch: r.default_branch,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      pushedAt: r.pushed_at,
      size: r.size,
      topics: r.topics,
      license: r.license?.name,
      url: r.html_url,
    };
  }

  async listCommits(owner: string, repo: string, limit = 10, branch?: string) {
    const endpoint = branch
      ? `/repos/${owner}/${repo}/commits?sha=${branch}&per_page=${limit}`
      : `/repos/${owner}/${repo}/commits?per_page=${limit}`;
    const commits = await this.fetch<any[]>(endpoint);
    return commits.map(c => ({
      sha: c.sha,
      shortSha: c.sha.substring(0, 7),
      message: c.commit.message,
      author: c.commit.author.name,
      authorEmail: c.commit.author.email,
      date: c.commit.author.date,
      url: c.html_url,
    }));
  }

  async listWorkflowRuns(owner: string, repo: string, limit = 10, status?: string) {
    let endpoint = `/repos/${owner}/${repo}/actions/runs?per_page=${limit}`;
    if (status) endpoint += `&status=${status}`;

    try {
      const data = await this.fetch<{ workflow_runs: any[] }>(endpoint);
      return data.workflow_runs.map(r => ({
        id: r.id,
        name: r.name,
        status: r.status,
        conclusion: r.conclusion,
        branch: r.head_branch,
        commitSha: r.head_sha.substring(0, 7),
        commitMessage: r.head_commit?.message,
        triggeredBy: r.actor?.login,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        duration: r.status === 'completed'
          ? Math.round((new Date(r.updated_at).getTime() - new Date(r.run_started_at).getTime()) / 1000)
          : null,
        url: r.html_url,
      }));
    } catch {
      return [];
    }
  }

  async listAllWorkflowRuns(limit = 5) {
    const repos = await this.listRepositories('updated', 10);
    const allRuns: any[] = [];

    for (const repo of repos) {
      const runs = await this.listWorkflowRuns(repo.owner, repo.name, limit);
      allRuns.push(...runs.map(r => ({ ...r, repository: repo.fullName })));
    }

    return allRuns
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50);
  }

  async listPullRequests(owner: string, repo: string, state = 'open', limit = 10) {
    const prs = await this.fetch<any[]>(
      `/repos/${owner}/${repo}/pulls?state=${state}&per_page=${limit}`
    );
    return prs.map(pr => ({
      number: pr.number,
      title: pr.title,
      state: pr.state,
      author: pr.user.login,
      createdAt: pr.created_at,
      updatedAt: pr.updated_at,
      mergedAt: pr.merged_at,
      draft: pr.draft,
      baseBranch: pr.base.ref,
      headBranch: pr.head.ref,
      url: pr.html_url,
    }));
  }

  async listIssues(owner: string, repo: string, state = 'open', limit = 10) {
    const issues = await this.fetch<any[]>(
      `/repos/${owner}/${repo}/issues?state=${state}&per_page=${limit}`
    );
    return issues
      .filter(i => !i.pull_request)
      .map(i => ({
        number: i.number,
        title: i.title,
        state: i.state,
        author: i.user.login,
        labels: i.labels.map((l: any) => l.name),
        createdAt: i.created_at,
        updatedAt: i.updated_at,
        closedAt: i.closed_at,
        comments: i.comments,
        url: i.html_url,
      }));
  }

  async searchCode(query: string, limit = 10) {
    const data = await this.fetch<{ items: any[] }>(
      `/search/code?q=${encodeURIComponent(query)}&per_page=${limit}`
    );
    return data.items.map(i => ({
      name: i.name,
      path: i.path,
      repository: i.repository.full_name,
      url: i.html_url,
    }));
  }

  async getRepoStats(owner: string, repo: string) {
    const [contributors, languages] = await Promise.all([
      this.fetch<any[]>(`/repos/${owner}/${repo}/contributors?per_page=10`).catch(() => []),
      this.fetch<Record<string, number>>(`/repos/${owner}/${repo}/languages`).catch(() => ({})),
    ]);

    const totalBytes = Object.values(languages).reduce((a, b) => a + b, 0);

    return {
      topContributors: contributors.slice(0, 10).map(c => ({
        login: c.login,
        contributions: c.contributions,
      })),
      languages: Object.entries(languages).map(([name, bytes]) => ({
        name,
        bytes,
        percentage: totalBytes > 0 ? Math.round((bytes / totalBytes) * 100) : 0,
      })),
    };
  }

  async listBranches(owner: string, repo: string, limit = 20) {
    const branches = await this.fetch<any[]>(
      `/repos/${owner}/${repo}/branches?per_page=${limit}`
    );
    return branches.map(b => ({
      name: b.name,
      protected: b.protected,
      commitSha: b.commit.sha.substring(0, 7),
    }));
  }
}
