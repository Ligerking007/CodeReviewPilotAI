import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import OpenAI from 'openai';
import { PrismaService } from '../common/prisma.service';
import { GithubService } from '../github/github.service';
import { CreateReviewDto } from './dto';
import { ReviewResult, reviewResultSchema } from './review-result.schema';

type ReviewResultJson = Prisma.ReviewResultCreateInput['result'];

const hunkHeaderPattern = /^@@ -(?<oldStart>\d+)(?:,\d+)? \+(?<newStart>\d+)(?:,\d+)? @@/;

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
              'You are a senior software engineer. Return only strict JSON matching the requested schema. Be specific, concise, and actionable. Every issue object must include severity, title, description, and recommendation. Include codeSuggestion.before and codeSuggestion.after when a concrete code-level fix can be shown safely from the provided patch context.'
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
        // Keep each patch bounded so a large PR cannot create an oversized OpenAI request from one file.
        const patch = file.patch ? this.formatPatchWithLineNumbers(file.patch).slice(0, 12000) : '[binary or patch unavailable]';
        return [
          `File: ${file.filename}`,
          `Status: ${file.status}`,
          `Changes: +${file.additions} -${file.deletions}`,
          'Patch:',
          patch
        ].join('\n');
      })
      .join('\n\n---\n\n')
      // Keep the full prompt within a predictable budget while preserving broad PR context.
      .slice(0, 90000);

    const commits = bundle.commits.map((commit) => `- ${commit.sha.slice(0, 7)} ${commit.commit.message}`).join('\n');
    const outputLanguage = language === 'th' ? 'Thai' : 'English';

    return `
Review this GitHub pull request and produce a JSON object in ${outputLanguage}.

Schema:
{
  "summary": "string",
  "criticalIssues": [{"severity":"critical|high|medium|low|info","title":"string","file":"string","line":1,"description":"string","recommendation":"string","codeSuggestion":{"before":"string","after":"string"}}],
  "suggestions": [{"severity":"critical|high|medium|low|info","title":"string","file":"string","line":1,"description":"string","recommendation":"string","codeSuggestion":{"before":"string","after":"string"}}],
  "security": [{"severity":"critical|high|medium|low|info","title":"string","file":"string","line":1,"description":"string","recommendation":"string","codeSuggestion":{"before":"string","after":"string"}}],
  "performance": [{"severity":"critical|high|medium|low|info","title":"string","file":"string","line":1,"description":"string","recommendation":"string","codeSuggestion":{"before":"string","after":"string"}}],
  "bestPractices": [{"severity":"critical|high|medium|low|info","title":"string","file":"string","line":1,"description":"string","recommendation":"string","codeSuggestion":{"before":"string","after":"string"}}],
  "markdown": "A readable Markdown review"
}

Only include codeSuggestion when both snippets are useful:
- before: the relevant existing code or compact pseudocode based on the patch
- after: the suggested replacement code
- keep snippets short and focused
- omit codeSuggestion if the fix is conceptual, uncertain, or cannot be derived from the provided diff

Line number rules:
- Set issue.line to the most relevant new-file line from the annotated patch.
- Added lines are marked as "+ new:<line>"; unchanged context lines include "new:<line>".
- If the issue concerns removed code only, use the nearest related new-file context line.
- Do not invent line numbers that are not present in the annotated patch.

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

  private formatPatchWithLineNumbers(patch: string) {
    let oldLine: number | undefined;
    let newLine: number | undefined;

    return patch
      .split('\n')
      .map((line) => {
        const hunkMatch = line.match(hunkHeaderPattern);

        if (hunkMatch?.groups) {
          oldLine = Number(hunkMatch.groups.oldStart);
          newLine = Number(hunkMatch.groups.newStart);
          return line;
        }

        if (oldLine === undefined || newLine === undefined) {
          return line;
        }

        if (line.startsWith('+') && !line.startsWith('+++')) {
          const annotatedLine = `+ new:${newLine} | ${line.slice(1)}`;
          newLine += 1;
          return annotatedLine;
        }

        if (line.startsWith('-') && !line.startsWith('---')) {
          const annotatedLine = `- old:${oldLine} | ${line.slice(1)}`;
          oldLine += 1;
          return annotatedLine;
        }

        if (line.startsWith(' ')) {
          const annotatedLine = `  old:${oldLine} new:${newLine} | ${line.slice(1)}`;
          oldLine += 1;
          newLine += 1;
          return annotatedLine;
        }

        return line;
      })
      .join('\n');
  }
}
