const GITHUB_API_BASE = 'https://api.github.com';

export class GitHubClient {
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
  }

  async getWorkflowRunDetails(owner: string, repo: string, runId: number) {
    const [run, jobs] = await Promise.all([
      this.fetch<any>(`/repos/${owner}/${repo}/actions/runs/${runId}`),
      this.fetch<{ jobs: any[] }>(`/repos/${owner}/${repo}/actions/runs/${runId}/jobs`),
    ]);

    return {
      id: run.id,
      name: run.name,
      status: run.status,
      conclusion: run.conclusion,
      branch: run.head_branch,
      commitSha: run.head_sha.substring(0, 7),
      commitMessage: run.head_commit?.message,
      triggeredBy: run.actor?.login,
      createdAt: run.created_at,
      updatedAt: run.updated_at,
      url: run.html_url,
      jobs: jobs.jobs.map(j => ({
        id: j.id,
        name: j.name,
        status: j.status,
        conclusion: j.conclusion,
        startedAt: j.started_at,
        completedAt: j.completed_at,
        steps: j.steps?.map((s: any) => ({
          name: s.name,
          status: s.status,
          conclusion: s.conclusion,
        })),
      })),
    };
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
      additions: pr.additions,
      deletions: pr.deletions,
      changedFiles: pr.changed_files,
      url: pr.html_url,
    }));
  }

  async listIssues(owner: string, repo: string, state = 'open', limit = 10) {
    const issues = await this.fetch<any[]>(
      `/repos/${owner}/${repo}/issues?state=${state}&per_page=${limit}`
    );
    return issues
      .filter(i => !i.pull_request) // Filter out PRs
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

    return {
      topContributors: contributors.slice(0, 10).map(c => ({
        login: c.login,
        contributions: c.contributions,
      })),
      languages: Object.entries(languages).map(([name, bytes]) => ({
        name,
        bytes,
        percentage: 0, // Will calculate on client
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
