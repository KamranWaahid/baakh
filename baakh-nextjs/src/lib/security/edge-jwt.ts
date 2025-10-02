const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

type ExpiresIn = number | `${number}${'s' | 'm' | 'h' | 'd'}`;

export type JWTPayload = Record<string, unknown> & {
  exp?: number;
  iat?: number;
  nbf?: number;
};
function base64UrlEncode(bytes: Uint8Array): string {
  let base64: string;
  if (typeof Buffer !== 'undefined') {
    base64 = Buffer.from(bytes).toString('base64');
  } else {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    base64 = btoa(binary);
  }
  return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64UrlDecode(input: string): Uint8Array {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const paddingNeeded = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + '='.repeat(paddingNeeded);

  if (typeof Buffer !== 'undefined') {
    const buffer = Buffer.from(padded, 'base64');
    const bytes = new Uint8Array(buffer.byteLength);
    bytes.set(buffer);
    return bytes;
  }

  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function resolveExpiry(expiresIn: ExpiresIn): number {
  if (typeof expiresIn === 'number') {
    return expiresIn;
  }
  const match = /^([0-9]+)([smhd])$/i.exec(expiresIn.trim());
  if (!match) {
    throw new Error('Unsupported expiresIn format');
  }
  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 60 * 60 * 24;
    default:
      throw new Error('Unsupported expiresIn unit');
  }
}

async function importSecret(secret: string) {
  return crypto.subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signJwt(payload: JWTPayload, secret: string, options?: { expiresIn?: ExpiresIn }): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' } as const;
  const now = Math.floor(Date.now() / 1000);
  const enrichedPayload: JWTPayload = { ...payload };

  if (enrichedPayload.iat === undefined) {
    enrichedPayload.iat = now;
  }

  if (options?.expiresIn && enrichedPayload.exp === undefined) {
    enrichedPayload.exp = now + resolveExpiry(options.expiresIn);
  }

  const headerSegment = base64UrlEncode(textEncoder.encode(JSON.stringify(header)));
  const payloadSegment = base64UrlEncode(textEncoder.encode(JSON.stringify(enrichedPayload)));
  const toSign = `${headerSegment}.${payloadSegment}`;

  const key = await importSecret(secret);
  const signature = await crypto.subtle.sign('HMAC', key, textEncoder.encode(toSign));
  const signatureSegment = base64UrlEncode(new Uint8Array(signature));

  return `${toSign}.${signatureSegment}`;
}

export async function verifyJwt<T extends JWTPayload = JWTPayload>(token: string, secret: string): Promise<T> {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token');
  }

  const [headerSegment, payloadSegment, signatureSegment] = parts;
  const headerBytes = base64UrlDecode(headerSegment);
  const payloadRawBytes = base64UrlDecode(payloadSegment);

  const header = JSON.parse(textDecoder.decode(headerBytes)) as { alg?: string; typ?: string };
  if (header.alg !== 'HS256') {
    throw new Error('Unsupported JWT algorithm');
  }

  const key = await importSecret(secret);
  const signatureBytes = base64UrlDecode(signatureSegment);
  const signingInputBytes = textEncoder.encode(`${headerSegment}.${payloadSegment}`);

  const signatureView = new Uint8Array(signatureBytes);
  const signingView = new Uint8Array(signingInputBytes);

  const valid = await crypto.subtle.verify('HMAC', key, signatureView, signingView);

  if (!valid) {
    throw new Error('Invalid token signature');
  }

  const payload = JSON.parse(textDecoder.decode(payloadRawBytes)) as T;
  const now = Math.floor(Date.now() / 1000);

  if (typeof payload.exp === 'number' && now >= payload.exp) {
    throw new Error('Token expired');
  }

  if (typeof payload.nbf === 'number' && now < payload.nbf) {
    throw new Error('Token not yet valid');
  }

  return payload;
}
