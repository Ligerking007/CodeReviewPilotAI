import { z } from 'zod';

export const reviewIssueSchema = z.object({
  severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
  title: z.string(),
  file: z.string().optional(),
  line: z.number().optional(),
  description: z.string(),
  recommendation: z.string()
});

export const reviewResultSchema = z.object({
  summary: z.string(),
  criticalIssues: z.array(reviewIssueSchema),
  suggestions: z.array(reviewIssueSchema),
  security: z.array(reviewIssueSchema),
  performance: z.array(reviewIssueSchema),
  bestPractices: z.array(reviewIssueSchema),
  markdown: z.string()
});

export type ReviewResult = z.infer<typeof reviewResultSchema>;
