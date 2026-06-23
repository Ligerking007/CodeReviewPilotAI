import '../i18n';
import { render, screen } from '@testing-library/react-native';
import { IssueCard } from './IssueCard';
import { ReviewIssue } from '../types/review';

jest.mock('../theme/theme-context', () => ({
  useAppTheme: () => ({
    colors: {
      background: '#ffffff',
      surface: '#ffffff',
      surfaceMuted: '#f6f8fa',
      text: '#24292f',
      muted: '#57606a',
      border: '#d0d7de',
      accent: '#0969da',
      danger: '#cf222e',
      warning: '#9a6700',
      success: '#1a7f37',
      codeBackground: '#f6f8fa'
    },
    isDark: false,
    mode: 'light',
    setMode: jest.fn(),
    cycleMode: jest.fn()
  })
}));

const issue: ReviewIssue = {
  severity: 'high',
  title: 'Cancel async work on cleanup',
  file: 'src/GroupCall.tsx',
  line: 440,
  description: 'The effect can apply stale data after unmount.',
  recommendation: 'Use AbortController and skip updates when aborted.'
};

describe('IssueCard', () => {
  it('renders before and after code suggestions when both snippets are available', () => {
    render(
      <IssueCard
        issue={{
          ...issue,
          codeSuggestion: {
            before: "useEffect(() => {\n  fetchOptions().then(setOptions);\n}, []);",
            after:
              "useEffect(() => {\n  const controller = new AbortController();\n  fetchOptions(controller.signal).then(setOptions);\n  return () => controller.abort();\n}, []);"
          }
        }}
      />
    );

    expect(screen.getByText('Suggested code change')).toBeTruthy();
    expect(screen.getByText('Before')).toBeTruthy();
    expect(screen.getByText('After')).toBeTruthy();
    expect(screen.getByText(/fetchOptions\(\)\.then/)).toBeTruthy();
    expect(screen.getByText(/controller\.abort/)).toBeTruthy();
  });

  it('keeps existing issue cards compact when code suggestions are absent', () => {
    render(<IssueCard issue={issue} />);

    expect(screen.queryByText('Suggested code change')).toBeNull();
    expect(screen.getByText('Use AbortController and skip updates when aborted.')).toBeTruthy();
  });
});
