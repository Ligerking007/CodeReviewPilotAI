import { IsIn, IsUrl } from 'class-validator';

export class CreateReviewDto {
  @IsUrl({ require_protocol: true })
  prUrl!: string;

  @IsIn(['en', 'th'])
  language: 'en' | 'th' = 'en';
}
