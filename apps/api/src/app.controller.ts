import { Controller, Get, Header } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(private readonly config: ConfigService) {}

  @Get()
  @Header('content-type', 'text/html; charset=utf-8')
  home() {
    const port = this.config.get<number>('PORT') ?? 3000;
    const frontendUrl = this.config.get<string>('APP_WEB_REDIRECT_URL')?.replace('/auth/callback', '') ?? 'http://localhost:8081';
    const publicFrontendUrl = this.config.get<string>('APP_PUBLIC_URL') ?? 'https://ligerking007.github.io/CodeReviewPilotAI';
    const nodeEnv = this.config.get<string>('NODE_ENV') ?? 'development';
    const model = this.config.get<string>('OPENAI_MODEL') ?? 'gpt-4.1-mini';
    const allowedUsers = this.config.get<string>('GITHUB_ALLOWED_USERNAMES')?.trim();
    const hasGithubOAuth = Boolean(this.config.get<string>('GITHUB_CLIENT_ID') && this.config.get<string>('GITHUB_CLIENT_SECRET'));
    const hasOpenAi = Boolean(this.config.get<string>('OPENAI_API_KEY'));
    const hasEncryptionKey = Boolean(this.config.get<string>('GITHUB_TOKEN_ENCRYPTION_KEY'));

    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>CodeReviewPilot AI API</title>
    <style>
      :root {
        color-scheme: light dark;
        --bg: #0d1117;
        --panel: #161b22;
        --muted: #8b949e;
        --text: #f0f6fc;
        --border: #30363d;
        --accent: #2f81f7;
        --accent-2: #56d364;
        --ok: #3fb950;
        --warn: #d29922;
      }
      body {
        margin: 0;
        background: var(--bg);
        color: var(--text);
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      main {
        width: min(980px, calc(100% - 32px));
        margin: 48px auto;
      }
      h1 {
        margin: 0 0 8px;
        font-size: 34px;
      }
      .hero {
        border: 1px solid var(--border);
        border-radius: 8px;
        background: linear-gradient(135deg, rgba(47, 129, 247, 0.18), rgba(63, 185, 80, 0.1)), var(--panel);
        padding: 24px;
      }
      p {
        color: var(--muted);
        line-height: 1.6;
      }
      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 18px;
      }
      .action {
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 10px 12px;
        background: rgba(255, 255, 255, 0.03);
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 16px;
        margin-top: 24px;
      }
      .panel {
        border: 1px solid var(--border);
        border-radius: 8px;
        background: var(--panel);
        padding: 18px;
      }
      .panel h2 {
        margin: 0 0 12px;
        font-size: 18px;
      }
      .row {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        border-top: 1px solid var(--border);
        padding: 10px 0;
      }
      .row:first-of-type {
        border-top: 0;
      }
      code {
        color: var(--text);
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      }
      a {
        color: var(--accent);
        text-decoration: none;
        font-weight: 700;
      }
      .badge {
        border-radius: 999px;
        padding: 2px 10px;
        font-size: 12px;
        font-weight: 800;
      }
      .ok {
        background: color-mix(in srgb, var(--ok) 20%, transparent);
        color: var(--ok);
      }
      .warn {
        background: color-mix(in srgb, var(--warn) 20%, transparent);
        color: var(--warn);
      }
      .muted {
        color: var(--muted);
      }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <h1>CodeReviewPilot AI API</h1>
        <p>NestJS backend for AI-powered GitHub pull request reviews. The main user interface is the Expo app for Web, Android, and iOS.</p>
        <div class="actions">
          <a class="action" href="${frontendUrl}">Open configured frontend</a>
          <a class="action" href="${publicFrontendUrl}">Open GitHub Pages app</a>
          <a class="action" href="/health">View health JSON</a>
        </div>
      </section>

      <section class="grid">
        <div class="panel">
          <h2>Runtime</h2>
          <div class="row"><span>Environment</span><code>${nodeEnv}</code></div>
          <div class="row"><span>Port</span><code>${port}</code></div>
          <div class="row"><span>OpenAI model</span><code>${model}</code></div>
          <div class="row"><span>Allowed users</span><span>${allowedUsers || '<span class="muted">Any valid GitHub user</span>'}</span></div>
        </div>

        <div class="panel">
          <h2>Configuration</h2>
          <div class="row"><span>OpenAI API key</span><span class="badge ${hasOpenAi ? 'ok' : 'warn'}">${hasOpenAi ? 'SET' : 'MISSING'}</span></div>
          <div class="row"><span>GitHub OAuth</span><span class="badge ${hasGithubOAuth ? 'ok' : 'warn'}">${hasGithubOAuth ? 'SET' : 'MISSING'}</span></div>
          <div class="row"><span>Token encryption key</span><span class="badge ${hasEncryptionKey ? 'ok' : 'warn'}">${hasEncryptionKey ? 'SET' : 'MISSING'}</span></div>
          <div class="row"><span>Fine-grained PAT login</span><span class="badge ok">ENABLED</span></div>
        </div>

        <div class="panel">
          <h2>Auth Endpoints</h2>
          <div class="row"><code>GET /auth/github</code><span>OAuth</span></div>
          <div class="row"><code>POST /auth/github-token</code><span>PAT</span></div>
          <div class="row"><code>POST /auth/github-cli</code><span>Local CLI</span></div>
          <div class="row"><code>GET /auth/logout</code><span>Logout</span></div>
        </div>

        <div class="panel">
          <h2>Review Endpoints</h2>
          <div class="row"><code>POST /github/pull-request</code><span>Fetch PR</span></div>
          <div class="row"><code>POST /ai-review/reviews</code><span>AI review</span></div>
          <div class="row"><code>GET /history</code><span>History</span></div>
        </div>

        <div class="panel">
          <h2>Deployment</h2>
          <div class="row"><code>mobile</code><span>Expo Web + Nginx</span></div>
          <div class="row"><code>api</code><span>NestJS container</span></div>
          <div class="row"><code>postgres</code><span>PostgreSQL</span></div>
        </div>

        <div class="panel">
          <h2>Images</h2>
          <div class="row"><code>codereviewpilotai-api</code><span>GHCR</span></div>
          <div class="row"><code>codereviewpilotai-mobile</code><span>GHCR</span></div>
          <div class="row"><code>postgres:18-alpine</code><span>Docker Hub</span></div>
        </div>
      </section>
    </main>
  </body>
</html>`;
  }

  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'CodeReviewPilot AI API',
      environment: this.config.get<string>('NODE_ENV') ?? 'development',
      model: this.config.get<string>('OPENAI_MODEL') ?? 'gpt-4.1-mini',
      timestamp: new Date().toISOString()
    };
  }
}
