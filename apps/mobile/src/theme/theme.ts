export type AppColors = {
  background: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  danger: string;
  warning: string;
  success: string;
  codeBackground: string;
};

export function buildTheme(isDark: boolean): AppColors {
  return isDark
    ? {
        background: '#0d1117',
        surface: '#161b22',
        surfaceMuted: '#21262d',
        text: '#f0f6fc',
        muted: '#8b949e',
        border: '#30363d',
        accent: '#2f81f7',
        danger: '#f85149',
        warning: '#d29922',
        success: '#3fb950',
        codeBackground: '#010409'
      }
    : {
        background: '#f6f8fa',
        surface: '#ffffff',
        surfaceMuted: '#eaeef2',
        text: '#24292f',
        muted: '#57606a',
        border: '#d0d7de',
        accent: '#0969da',
        danger: '#cf222e',
        warning: '#9a6700',
        success: '#1a7f37',
        codeBackground: '#f6f8fa'
      };
}
