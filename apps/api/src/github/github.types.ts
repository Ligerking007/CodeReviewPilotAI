export type GithubPullRequest = {
  id: number;
  number: number;
  title: string;
  body?: string;
  html_url: string;
  state: string;
  user?: { login: string };
  base: { ref: string; repo: { full_name: string; html_url: string } };
  head: { ref: string; sha: string };
};

export type GithubChangedFile = {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
};

export type GithubCommit = {
  sha: string;
  commit: {
    message: string;
    author?: {
      name?: string;
      date?: string;
    };
  };
};
