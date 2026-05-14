import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import OpenAI from 'openai';
import { PrismaService } from '../common/prisma.service';
import { GithubService } from '../github/github.service';
import { CreateReviewDto } from './dto';
import { ReviewResult, reviewResultSchema } from './review-result.schema';

@Injectable()
export class AiReviewService {
  private readonly openai: OpenAI;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly github: GithubService
  ) {
    this.openai = new OpenAI({ apiKey: this.config.getOrThrow<string>('OPENAI_API_KEY') });
  }

  async createReview(userId: string, dto: CreateReviewDto) {
    const bundle = await this.github.getPullRequestBundle(userId, dto.prUrl);
    const model = this.config.get<string>('OPENAI_MODEL') ?? 'gpt-4.1-mini';
    const prompt = this.buildPrompt(bundle, dto.language);

    const completion = await this.openai.chat.completions.create({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are a senior software engineer. Return only strict JSON matching the requested schema. Be specific, concise, and actionable.'
        },
        { role: 'user', content: prompt }
      ]
    });

    const raw = completion.choices[0]?.message.content ?? '{}';
    const parsed = reviewResultSchema.parse(JSON.parse(raw)) satisfies ReviewResult;

    const history = await this.prisma.reviewHistory.create({
      data: {
        userId,
        prUrl: dto.prUrl,
        owner: bundle.owner,
        repo: bundle.repo,
        prNumber: bundle.prNumber,
        title: bundle.pullRequest.title,
        repositoryUrl: bundle.pullRequest.base.repo.html_url,
        result: {
          create: {
            model,
            language: dto.language,
            result: parsed as unknown as Prisma.InputJsonValue
          }
        }
      },
      include: { result: true }
    });

    return {
      id: history.id,
      prUrl: history.prUrl,
      title: history.title,
      createdAt: history.createdAt,
      result: parsed
    };
  }

  buildPrompt(bundle: Awaited<ReturnType<GithubService['getPullRequestBundle']>>, language: 'en' | 'th') {
    const files = bundle.files
      .map((file) => {
        const patch = file.patch ? file.patch.slice(0, 12000) : '[binary or patch unavailable]';
        return [
          `File: ${file.filename}`,
          `Status: ${file.status}`,
          `Changes: +${file.additions} -${file.deletions}`,
          'Patch:',
          patch
        ].join('\n');
      })
      .join('\n\n---\n\n')
      .slice(0, 90000);

    const commits = bundle.commits.map((commit) => `- ${commit.sha.slice(0, 7)} ${commit.commit.message}`).join('\n');
    const outputLanguage = language === 'th' ? 'Thai' : 'English';

    return `
Review this GitHub pull request and produce a JSON object in ${outputLanguage}.

Schema:
{
  "summary": "string",
  "criticalIssues": [{"severity":"critical|high|medium|low|info","title":"string","file":"string","line":1,"description":"string","recommendation":"string"}],
  "suggestions": [],
  "security": [],
  "performance": [],
  "bestPractices": [],
  "markdown": "A readable Markdown review"
}

Focus areas:
- code quality
- possible bugs
- security issues
- performance concerns
- architecture/design issues
- clean code suggestions
- missing validation
- async/concurrency risks
- logging/error handling issues

Pull request:
${bundle.pullRequest.title}
${bundle.pullRequest.body ?? ''}

Repository: ${bundle.pullRequest.base.repo.full_name}
PR: #${bundle.prNumber}
Author: ${bundle.pullRequest.user?.login ?? 'unknown'}
Commits:
${commits}

Changed files:
${files}
`;
  }
}
