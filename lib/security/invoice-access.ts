import { createHash, randomBytes, timingSafeEqual } from 'crypto';

export function createInvoiceAccessToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashInvoiceAccessToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function hasValidInvoiceAccessToken(
  storedHash: string | null | undefined,
  token: string | null
): boolean {
  if (!storedHash || !token || !/^[a-f0-9]{64}$/.test(storedHash)) {
    return false;
  }

  const expected = Buffer.from(storedHash, 'hex');
  const actual = Buffer.from(hashInvoiceAccessToken(token), 'hex');

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
