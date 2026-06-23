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

  it('keeps complete before and after code suggestions on issue items', () => {
    const parsed = reviewResultSchema.parse({
      summary: 'Needs async cleanup.',
      criticalIssues: [
        {
          severity: 'high',
          title: 'Cancel async work on cleanup',
          description: 'The effect can apply stale data after unmount.',
          recommendation: 'Use AbortController and skip updates when aborted.',
          codeSuggestion: {
            before: "useEffect(() => {\n  fetchOptions().then(setOptions);\n}, []);",
            after:
              "useEffect(() => {\n  const controller = new AbortController();\n  fetchOptions(controller.signal).then(setOptions);\n  return () => controller.abort();\n}, []);"
          }
        }
      ],
      suggestions: [],
      security: [],
      performance: [],
      bestPractices: [],
      markdown: '# Review'
    });

    expect(parsed.criticalIssues[0].codeSuggestion).toEqual({
      before: "useEffect(() => {\n  fetchOptions().then(setOptions);\n}, []);",
      after:
        "useEffect(() => {\n  const controller = new AbortController();\n  fetchOptions(controller.signal).then(setOptions);\n  return () => controller.abort();\n}, []);"
    });
  });

  it('drops incomplete code suggestions instead of rendering partial fixes', () => {
    const parsed = reviewResultSchema.parse({
      summary: 'Needs validation.',
      criticalIssues: [
        {
          severity: 'high',
          title: 'Validate backend options',
          description: 'The options are used directly.',
          recommendation: 'Add schema validation before applying options.',
          codeSuggestion: { before: 'applyOptions(options);', after: '' }
        }
      ],
      suggestions: [],
      security: [],
      performance: [],
      bestPractices: [],
      markdown: '# Review'
    });

    expect(parsed.criticalIssues[0].codeSuggestion).toBeUndefined();
  });
});
