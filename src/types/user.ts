export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  bio: string;
  avatarUrl?: string;
  isVerified?: boolean;
  simulatedFollowers?: number;
  createdAt: Date;
}
