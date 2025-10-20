import { betterAuth, MiddlewareContext } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { openAPI } from "better-auth/plugins";
import { expo } from "@better-auth/expo";
import { createAuthMiddleware } from "better-auth/api";
import type { PrismaClient } from "@workspace/db";

type User = {
  id: string;
  email: string;
  name: string;
};
export interface AuthConfig {
  prisma: PrismaClient;
  basePath?: string;
  trustedOrigins?: string[];
  mailService: {
    sendPasswordResetEmail: (
      params: { user: User; url: string; token: string },
      request?: any
    ) => Promise<void>;
    sendVerificationEmail: (
      params: { user: User; url: string; token: string },
      request?: any
    ) => Promise<void>;
    sendWelcomeEmail: (params: { user: User }, request?: any) => Promise<void>;
    sendPasswordChangeConfirmation: (
      params: { user: User },
      request?: any
    ) => Promise<void>;
    sendEmailVerificationConfirmation: (
      params: { user: User },
      request?: any
    ) => Promise<void>;
  };
}

export function createAuth(config: AuthConfig): ReturnType<typeof betterAuth> {
  return betterAuth({
    database: prismaAdapter(config.prisma, { provider: "postgresql" }),
    basePath: config.basePath || "/api/v1/auth",
    trustedOrigins: config.trustedOrigins,
    emailAndPassword: {
      enabled: true,
      sendResetPassword: async ({ user, url, token }, request) => {
        console.log("🔄 Sending password reset email...");
        await config.mailService.sendPasswordResetEmail(
          { user, url, token },
          request
        );
      },
      onPasswordReset: async (data, request) => {
        console.log("🔄 Sending password change confirmation email...");
        await config.mailService.sendPasswordChangeConfirmation(
          { user: data.user },
          request
        );
      },
      revokeSessionsOnPasswordReset: true,
      resetPasswordTokenExpiresIn: 60 * 5, // 5 minutes
      requireEmailVerification: true,
    },
    emailVerification: {
      sendOnSignUp: true,
      expiresIn: 60 * 60 * 24, // 24 hours
      sendVerificationEmail: async ({ user, url, token }, request) => {
        console.log("🔄 Sending verification email...");
        await config.mailService.sendVerificationEmail(
          { user, url, token },
          request
        );
      },
      onEmailVerification: async (user, request) => {
        // Email Verified Email
        console.log("🔄 Sending email verification confirmation email...");
        await config.mailService.sendEmailVerificationConfirmation(
          { user },
          request
        );
      },
      afterEmailVerification: async (user, request) => {
        // Welcome Email
        console.log("🔄 Sending welcome email...");
        setTimeout(async () => {
          await config.mailService.sendWelcomeEmail({ user }, request);
        }, 3000);
      },
    },
    advanced: {
      cookiePrefix: "st_auth",
      crossSubDomainCookies: {
        enabled: true,
      },
    },
    api: {
      onError: (error: any) => {
        console.error("Auth API Error:", error);
        return {
          status: 500,
          body: {
            message: "Internal server error",
          },
        };
      },
    },

    plugins: [openAPI(), expo()],
  });
}

export type Auth = ReturnType<typeof createAuth>;
export type Session = Auth["$Infer"]["Session"]["session"];
export type AuthUser = Auth["$Infer"]["Session"]["user"];
