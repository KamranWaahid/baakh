const encoder = new TextEncoder();
const decoder = new TextDecoder();
const hasBufferSupport = typeof Buffer !== 'undefined' && typeof Buffer.from === 'function';

export type ConversionLogger = (message: string, details?: unknown) => void;

const bytesToBase64Internal = (bytes: Uint8Array): string => {
  if (hasBufferSupport) {
    return Buffer.from(bytes).toString('base64');
  }
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const base64ToBytesInternal = (value: string): Uint8Array => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + '='.repeat(padding);

  if (hasBufferSupport) {
    return new Uint8Array(Buffer.from(padded, 'base64'));
  }

  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const hexToBytes = (value: string): Uint8Array => {
  if (value.length % 2 !== 0) {
    throw new Error('Invalid hex string length');
  }
  const bytes = new Uint8Array(value.length / 2);
  for (let i = 0; i < value.length; i += 2) {
    bytes[i / 2] = parseInt(value.slice(i, i + 2), 16);
  }
  return bytes;
};

const looksLikeBase64 = (value: string) => /^[A-Za-z0-9+/\-_]+={0,2}$/.test(value);

const sanitizeHexCandidate = (value: string) => value.replace(/\\x/g, '').replace(/^0x/i, '');

const isBufferLikeObject = (value: unknown): value is { type: string; data: number[] } => {
  return Boolean(
    value &&
    typeof value === 'object' &&
    (value as { type?: string }).type === 'Buffer' &&
    Array.isArray((value as { data?: unknown }).data)
  );
};

const tryParseBufferJson = (possibleJson: string, logger?: ConversionLogger) => {
  try {
    const parsed = JSON.parse(possibleJson);
    if (isBufferLikeObject(parsed)) {
      logger?.('Parsed Buffer-like object from JSON', { length: parsed.data.length });
      return Uint8Array.from(parsed.data);
    }
  } catch (error) {
    logger?.('Failed to parse JSON while checking for Buffer-like object', { error: error instanceof Error ? error.message : String(error) });
  }
  return null;
};

const extractBufferFromHexIfJson = (hexValue: string, logger?: ConversionLogger) => {
  try {
    const bytes = hexToBytes(hexValue);
    const jsonString = decoder.decode(bytes);
    return tryParseBufferJson(jsonString, logger);
  } catch (error) {
    logger?.('Failed to parse hex as Buffer-like JSON', { error: error instanceof Error ? error.message : String(error) });
    return null;
  }
};

export const bytesToBase64 = (bytes: Uint8Array): string => bytesToBase64Internal(bytes);

export const base64ToBytes = (value: string): Uint8Array => base64ToBytesInternal(value);

export const valueToBytes = (data: unknown, fieldName: string, logger?: ConversionLogger): Uint8Array => {
  logger?.(`[${fieldName}] valueToBytes input`, {
    type: typeof data,
    isNull: data === null,
    isUndefined: data === undefined,
    constructor: (data as any)?.constructor?.name,
    dataLength: (data as any)?.length
  });

  if (data === null || data === undefined) {
    throw new Error(`${fieldName} data is missing`);
  }

  if (hasBufferSupport && Buffer.isBuffer?.(data)) {
    logger?.(`[${fieldName}] Detected Node Buffer instance`, { length: (data as Buffer).length });
    return Uint8Array.from(data as Buffer);
  }

  if (isBufferLikeObject(data)) {
    logger?.(`[${fieldName}] Detected Buffer-like object`, { length: (data as { data: number[] }).data.length });
    return Uint8Array.from((data as { data: number[] }).data);
  }

  if (data instanceof Uint8Array) {
    return data;
  }

  if (ArrayBuffer.isView(data)) {
    const view = data as ArrayBufferView;
    return new Uint8Array(view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength));
  }

  if (data instanceof ArrayBuffer) {
    return new Uint8Array(data);
  }

  if (Array.isArray(data)) {
    return Uint8Array.from(data as number[]);
  }

  if (typeof data === 'string') {
    const trimmed = data.trim();
    if (!trimmed) {
      throw new Error(`${fieldName} string is empty`);
    }

    const jsonBuffer = tryParseBufferJson(trimmed, logger);
    if (jsonBuffer) {
      return jsonBuffer;
    }

    const sanitizedHex = sanitizeHexCandidate(trimmed);
    if (sanitizedHex && /^[0-9a-fA-F]+$/.test(sanitizedHex)) {
      const parsedFromHexJson = extractBufferFromHexIfJson(sanitizedHex, logger);
      if (parsedFromHexJson) {
        return parsedFromHexJson;
      }
      return hexToBytes(sanitizedHex);
    }

    if (looksLikeBase64(trimmed)) {
      try {
        return base64ToBytesInternal(trimmed);
      } catch (error) {
        logger?.(`[${fieldName}] Failed to decode base64 string`, { error: error instanceof Error ? error.message : String(error) });
      }
    }

    return encoder.encode(trimmed);
  }

  if (typeof (data as { data?: unknown }).data === 'string') {
    return valueToBytes((data as { data: string }).data, fieldName, logger);
  }

  throw new Error(`Unknown data format for ${fieldName}: ${typeof data}`);
};

export const convertToBase64 = (data: unknown, fieldName: string, logger?: ConversionLogger): string => {
  const bytes = valueToBytes(data, fieldName, logger);
  const base64 = bytesToBase64Internal(bytes);
  logger?.(`[${fieldName}] Converted to base64`, { byteLength: bytes.length });
  return base64;
};

export const ensureNonceLength = (base64String: string, fieldName: string, logger?: ConversionLogger): string => {
  const decoded = base64ToBytesInternal(base64String);
  logger?.(`[${fieldName}] Original nonce length`, { length: decoded.length });

  if (decoded.length === 12) {
    return base64String;
  }

  if (decoded.length > 12) {
    logger?.(`[${fieldName}] Truncating nonce`, { from: decoded.length, to: 12 });
    const truncated = decoded.slice(0, 12);
    return bytesToBase64Internal(truncated);
  }

  logger?.(`[${fieldName}] Padding nonce`, { from: decoded.length, to: 12 });
  const padded = new Uint8Array(12);
  padded.set(decoded);
  return bytesToBase64Internal(padded);
};

export const bytesToBinary = (base64String: string): Uint8Array => base64ToBytesInternal(base64String);

export const toSupabaseBinary = (base64String: string) => {
  const bytes = base64ToBytesInternal(base64String);
  return hasBufferSupport ? Buffer.from(bytes) : bytes;
};
