import {
  createHash,
  randomBytes,
  scrypt as _scrypt,
  timingSafeEqual,
} from "node:crypto";

/** OWASP-recommended scrypt work factors (2024+ guidance). */
const N = 16384;
const R = 8;
const P = 1;
const KEY_LEN = 64;

interface ScryptOptions {
  N: number;
  r: number;
  p: number;
}

function scryptAsync(
  password: string,
  salt: Buffer,
  keylen: number,
  options: ScryptOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    _scrypt(password, salt, keylen, options, (err, derivedKey) =>
      err ? reject(err) : resolve(derivedKey),
    );
  });
}

/**
 * Hash a plaintext password with scrypt + a 128-bit random salt.
 * Output format: scrypt$N$r$p$saltHex$hashHex (self-describing, upgradable).
 */
export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scryptAsync(plain, salt, KEY_LEN, { N, r: R, p: P });
  return `scrypt$${N}$${R}$${P}$${salt.toString("hex")}$${derived.toString("hex")}`;
}

/** Constant-time verification; rejects malformed stored hashes safely. */
export async function verifyPassword(
  plain: string,
  stored: string,
): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, nStr, rStr, pStr, saltHex, hashHex] = parts;
  const n = Number(nStr);
  const r = Number(rStr);
  const p = Number(pStr);
  if (!n || !r || !p) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scryptAsync(plain, Buffer.from(saltHex, "hex"), KEY_LEN, {
    N: n,
    r,
    p,
  });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** SHA-256 hex digest — used to store session tokens at rest. */
export function sha256Hex(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

/** Cryptographically random URL-safe session bearer token (256-bit). */
export function newSessionToken(): string {
  return randomBytes(32).toString("base64url");
}
