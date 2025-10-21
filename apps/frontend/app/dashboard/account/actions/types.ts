export interface Session {
  id: string;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
  userId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User profile update data structure
 */
export interface ProfileUpdateData {
  name?: string;
  email?: string;
  image?: string;
}

/**
 * Password change data structure
 */
export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

export interface SessionRevokeData {
  token: string;
}