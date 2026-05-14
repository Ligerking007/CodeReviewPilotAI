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
});
