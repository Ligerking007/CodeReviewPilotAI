import { z } from 'zod';

const severitySchema = z.enum(['critical', 'high', 'medium', 'low', 'info']);

const optionalStringSchema = z
  .preprocess((value) => (value === null || value === '' ? undefined : value), z.string().optional())
  .catch(undefined);

const optionalLineSchema = z
  .preprocess((value) => (value === null || value === '' ? undefined : value), z.coerce.number().int().positive().optional())
  .catch(undefined);

const optionalCodeSuggestionSchema = z
  .object({
    before: z.string().catch(''),
    after: z.string().catch('')
  })
  .transform((codeSuggestion) => {
    const before = codeSuggestion.before.trim();
    const after = codeSuggestion.after.trim();

    return before && after ? { before, after } : undefined;
  })
  .optional()
  .catch(undefined);

export const reviewIssueSchema = z
  .preprocess((value) => {
    // The model may occasionally return a plain bullet string; normalize it so the UI still renders safely.
    if (typeof value === 'string') {
      return {
        severity: 'info',
        title: value.slice(0, 120),
        description: value,
        recommendation: value
      };
    }

    return value;
  }, z.object({
    severity: severitySchema.catch('info'),
    title: z.string().catch('Review suggestion'),
    file: optionalStringSchema,
    line: optionalLineSchema,
    description: z.string().catch(''),
    recommendation: z.string().catch(''),
    codeSuggestion: optionalCodeSuggestionSchema
  }))
  .transform((issue) => {
    const description = issue.description || issue.recommendation || issue.title;
    const recommendation = issue.recommendation || issue.description || issue.title;

    return {
      ...issue,
      title: issue.title || description.slice(0, 120) || 'Review suggestion',
      description,
      recommendation
    };
  });

const reviewSectionSchema = z.array(reviewIssueSchema).optional().catch([]).default([]);

export const reviewResultSchema = z.object({
  summary: z.string().catch('No summary was returned.'),
  criticalIssues: reviewSectionSchema,
  suggestions: reviewSectionSchema,
  security: reviewSectionSchema,
  performance: reviewSectionSchema,
  bestPractices: reviewSectionSchema,
  markdown: z.string().catch('')
});

export type ReviewResult = z.infer<typeof reviewResultSchema>;
