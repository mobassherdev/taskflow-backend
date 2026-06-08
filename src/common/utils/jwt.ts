import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

export function signAccessToken(userId: string, role: string): string {
  return jwt.sign(
    { userId, role },
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessExpiry } as any,
  );
}

export function signRefreshToken(userId: string, role: string): string {
  return jwt.sign(
    { userId, role },
    env.jwt.refreshSecret,
    { expiresIn: env.jwt.refreshExpiry } as any,
  );
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.jwt.accessSecret) as { userId: string; role: string };
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.jwt.refreshSecret) as { userId: string; role: string };
}
