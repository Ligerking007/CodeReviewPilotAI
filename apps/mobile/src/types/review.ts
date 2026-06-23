export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type ReviewIssue = {
  severity: Severity;
  title: string;
  file?: string;
  line?: number;
  description: string;
  recommendation: string;
  codeSuggestion?: {
    before: string;
    after: string;
  };
};

export type ReviewResult = {
  summary: string;
  criticalIssues: ReviewIssue[];
  suggestions: ReviewIssue[];
  security: ReviewIssue[];
  performance: ReviewIssue[];
  bestPractices: ReviewIssue[];
  markdown: string;
};

export type ReviewResponse = {
  id: string;
  prUrl: string;
  title: string;
  createdAt: string;
  result: ReviewResult;
};
