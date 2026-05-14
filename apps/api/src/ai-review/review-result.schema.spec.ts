import { reviewResultSchema } from './review-result.schema';

describe('reviewResultSchema', () => {
  it('accepts a valid structured review result', () => {
    expect(
      reviewResultSchema.parse({
        summary: 'Looks good with minor issues.',
        criticalIssues: [],
        suggestions: [],
        security: [],
        performance: [],
        bestPractices: [],
        markdown: '# Review'
      })
    ).toBeTruthy();
  });

  it('normalizes incomplete AI issue items', () => {
    const parsed = reviewResultSchema.parse({
      summary: 'Needs minor cleanup.',
      criticalIssues: [],
      suggestions: [{ title: 'Avoid repeated Trim/ToLower calls', description: 'Normalize once before comparing.' }],
      security: [],
      performance: [],
      bestPractices: ['Add a null check before reading optional consent data.'],
      markdown: '# Review'
    });

    expect(parsed.suggestions[0]).toMatchObject({
      severity: 'info',
      recommendation: 'Normalize once before comparing.'
    });
    expect(parsed.bestPractices[0]).toMatchObject({
      severity: 'info',
      title: 'Add a null check before reading optional consent data.'
    });
  });
});
