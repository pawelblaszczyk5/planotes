import { type User } from '@prisma/client';

export const isUserOnboarded = (user: User) => user.avatarSeed !== null && user.name !== null;
