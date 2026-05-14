import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

type EncryptedToken = {
  encryptedAccessToken: string;
  tokenIv: string;
  tokenAuthTag: string;
};

@Injectable()
export class TokenCryptoService {
  constructor(private readonly config: ConfigService) {}

  encrypt(accessToken: string): EncryptedToken {
    const key = this.getKey();
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(accessToken, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return {
      encryptedAccessToken: encrypted.toString('base64'),
      tokenIv: iv.toString('base64'),
      tokenAuthTag: authTag.toString('base64')
    };
  }

  decrypt(encrypted: EncryptedToken): string {
    const key = this.getKey();
    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(encrypted.tokenIv, 'base64'));
    decipher.setAuthTag(Buffer.from(encrypted.tokenAuthTag, 'base64'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encrypted.encryptedAccessToken, 'base64')),
      decipher.final()
    ]);
    return decrypted.toString('utf8');
  }

  private getKey(): Buffer {
    const raw = this.config.get<string>('GITHUB_TOKEN_ENCRYPTION_KEY');
    if (!raw) {
      throw new InternalServerErrorException('GITHUB_TOKEN_ENCRYPTION_KEY is required');
    }

    const base64 = Buffer.from(raw, 'base64');
    if (base64.length === 32) {
      return base64;
    }

    const utf8 = Buffer.from(raw, 'utf8');
    if (utf8.length === 32) {
      return utf8;
    }

    throw new InternalServerErrorException('GITHUB_TOKEN_ENCRYPTION_KEY must be 32 bytes or base64 encoded 32 bytes');
  }
}
