import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hashes data securely using bcryptjs.
 * @param data The plaintext data to hash.
 * @returns The hashed string.
 */
export async function hashLocalData(data: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(data, salt);
}

/**
 * Compares plaintext data against a hash.
 * @param data The plaintext data.
 * @param hash The previously hashed string.
 * @returns true if they match, false otherwise.
 */
export async function compareLocalData(data: string, hash: string): Promise<boolean> {
  return bcrypt.compare(data, hash);
}
