import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import OpenAI from 'openai';
import { PrismaService } from '../common/prisma.service';
import { GithubService } from '../github/github.service';
import { CreateReviewDto } from './dto';
import { ReviewResult, reviewResultSchema } from './review-result.schema';

type ReviewResultJson = Prisma.ReviewResultCreateInput['result'];

@Injectable()
export class AiReviewService {
  private readonly logger = new Logger(AiReviewService.name);
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

    const parsed = await this.generateReview(model, prompt);

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
            result: parsed as unknown as ReviewResultJson
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

  private async generateReview(model: string, prompt: string): Promise<ReviewResult> {
    let raw = '{}';

    try {
      const completion = await this.openai.chat.completions.create({
        model,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You are a senior software engineer. Return only strict JSON matching the requested schema. Be specific, concise, and actionable. Every issue object must include severity, title, description, and recommendation.'
          },
          { role: 'user', content: prompt }
        ]
      });

      raw = completion.choices[0]?.message.content ?? '{}';
    } catch (error) {
      this.logger.error('OpenAI review generation failed', error instanceof Error ? error.stack : String(error));
      throw new BadGatewayException('AI review generation failed. Check the OpenAI API key, quota, and model settings.');
    }

    try {
      return reviewResultSchema.parse(JSON.parse(raw));
    } catch (error) {
      this.logger.error('OpenAI returned an invalid review payload', error instanceof Error ? error.stack : String(error));
      throw new BadGatewayException('AI returned an invalid review format. Please retry the review.');
    }
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
  "suggestions": [{"severity":"critical|high|medium|low|info","title":"string","file":"string","line":1,"description":"string","recommendation":"string"}],
  "security": [{"severity":"critical|high|medium|low|info","title":"string","file":"string","line":1,"description":"string","recommendation":"string"}],
  "performance": [{"severity":"critical|high|medium|low|info","title":"string","file":"string","line":1,"description":"string","recommendation":"string"}],
  "bestPractices": [{"severity":"critical|high|medium|low|info","title":"string","file":"string","line":1,"description":"string","recommendation":"string"}],
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
