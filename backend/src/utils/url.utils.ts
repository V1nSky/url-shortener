import { customAlphabet } from 'nanoid';
import crypto from 'crypto';

// Base62 alphabet for short codes
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 7);

export const generateShortCode = (): string => {
  return nanoid();
};

export const hashIP = (ip: string): string => {
  return crypto.createHash('sha256').update(ip).digest('hex');
};

export const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    
    // Block localhost and private IPs
    if (
      parsed.hostname === 'localhost' ||
      parsed.hostname === '127.0.0.1' ||
      parsed.hostname.startsWith('192.168.') ||
      parsed.hostname.startsWith('10.') ||
      parsed.hostname.startsWith('172.')
    ) {
      return false;
    }

    // Only allow http and https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

export const normalizeUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    // Remove trailing slash
    let normalized = parsed.href;
    if (normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  } catch {
    return url;
  }
};

export const isValidCustomAlias = (alias: string): boolean => {
  const regex = /^[a-zA-Z0-9_-]{3,20}$/;
  return regex.test(alias);
};

// List of known phishing/malicious domains (example)
const maliciousDomains = [
  'bit.ly',
  'tinyurl.com',
  // Add more as needed
];

export const isMaliciousDomain = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return maliciousDomains.some((domain) => parsed.hostname.includes(domain));
  } catch {
    return false;
  }
};
