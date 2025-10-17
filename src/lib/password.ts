import bcrypt from 'bcrypt'

/**
 * Number of salt rounds for bcrypt hashing
 * Higher = more secure but slower
 * 12 is a good balance for production
 */
const SALT_ROUNDS = 12

/**
 * Hash a plain text password
 * @param password - Plain text password
 * @returns Hashed password string
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Compare a plain text password with a hashed password
 * @param password - Plain text password to verify
 * @param hashedPassword - Previously hashed password
 * @returns True if passwords match, false otherwise
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}
