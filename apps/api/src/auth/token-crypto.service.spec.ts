import { InternalServerErrorException } from '@nestjs/common';
import { TokenCryptoService } from './token-crypto.service';

const createConfig = (value?: string) =>
  ({
    get: jest.fn().mockReturnValue(value)
  }) as any;

describe('TokenCryptoService', () => {
  it('encrypts and decrypts GitHub tokens with a base64 encoded key', () => {
    const key = Buffer.alloc(32, 7).toString('base64');
    const service = new TokenCryptoService(createConfig(key));

    const encrypted = service.encrypt('github_pat_secret_value');

    expect(encrypted.encryptedAccessToken).not.toBe('github_pat_secret_value');
    expect(service.decrypt(encrypted)).toBe('github_pat_secret_value');
  });

  it('uses a different IV for each encryption call', () => {
    const service = new TokenCryptoService(createConfig('12345678901234567890123456789012'));

    const first = service.encrypt('same-token');
    const second = service.encrypt('same-token');

    expect(first.tokenIv).not.toBe(second.tokenIv);
    expect(first.encryptedAccessToken).not.toBe(second.encryptedAccessToken);
    expect(service.decrypt(first)).toBe('same-token');
    expect(service.decrypt(second)).toBe('same-token');
  });

  it('rejects missing or invalid encryption keys', () => {
    expect(() => new TokenCryptoService(createConfig()).encrypt('token')).toThrow(InternalServerErrorException);
    expect(() => new TokenCryptoService(createConfig('too-short')).encrypt('token')).toThrow(InternalServerErrorException);
  });
});
