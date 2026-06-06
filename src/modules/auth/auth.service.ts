import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/database';
import { ApiError } from '../../utils/ApiError';
import { z } from 'zod';
import { loginSchema, signupSchema, changePasswordSchema } from './auth.schema';

export class AuthService {
  async signup(dto: z.infer<typeof signupSchema>) {
    const exists = await prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ApiError(409, 'Email already in use');

    const hashed = await bcrypt.hash(dto.password, 12);
    const user = await prisma.user.create({
      data: { ...dto, password: hashed, role: 'TEAM_MEMBER' },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    const tokens = this.generateTokens(user.id, user.role);
    return { user, ...tokens };
  }

  async login(dto: z.infer<typeof loginSchema>) {
    const user = await prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new ApiError(401, 'Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new ApiError(401, 'Invalid credentials');

    const { password: _, ...safeUser } = user;
    const tokens = this.generateTokens(user.id, user.role);
    return { user: safeUser, ...tokens };
  }

  generateTokens(userId: string, role: string) {
    const accessToken = jwt.sign(
      { userId, role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' } as any,
    );
    const refreshToken = jwt.sign(
      { userId, role },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d' } as any,
    );
    return { accessToken, refreshToken };
  }

  async refreshToken(token: string) {
    try {
      const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { userId: string; role: string };
      const user = await prisma.user.findUnique({ where: { id: payload.userId } });
      if (!user) throw new ApiError(401, 'User not found');
      return this.generateTokens(user.id, user.role);
    } catch {
      throw new ApiError(401, 'Invalid refresh token');
    }
  }

  async changePassword(userId: string, dto: z.infer<typeof changePasswordSchema>) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ApiError(404, 'User not found');

    const valid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!valid) throw new ApiError(400, 'Current password is incorrect');

    const hashed = await bcrypt.hash(dto.newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
  }
}

export const authService = new AuthService();
