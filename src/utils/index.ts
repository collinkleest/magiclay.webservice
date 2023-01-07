import * as bcrypt from 'bcrypt'

export function isTimestampExpired(timestamp: number): boolean {
  return Date.now() >= timestamp
}

export async function generatePasswordHash(password: string): Promise<string> {
  const saltRounds = 10
  const salt = await bcrypt.genSalt(saltRounds)
  return await bcrypt.hash(password, salt)
}
