import dotenv from "dotenv";
import path from "path";

// Load environment variables from the project root
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { prisma } from "@workspace/db";
import { openAPI } from "better-auth/plugins";
import { expo } from "@better-auth/expo";
import { createAuthMiddleware } from "better-auth/api";
import { mailService } from "./lib/mail-service";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Context {
  path: string;
  method: string;
}

interface HookContext {
  returned?: any;
  body?: { email?: string };
  context: {
    session?: {
      user?: User;
    };
  };
  request?: {
    headers?: {
      get: (name: string) => string | null;
    };
  };
}

const envTrustedOrigins = (process.env.AUTH_TRUSTED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

console.log("🔒 Trusted Origins:", envTrustedOrigins);

export const auth: ReturnType<typeof betterAuth> = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  basePath: "/api/v1/auth",
  trustedOrigins: envTrustedOrigins,
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      console.log("🔐 Password reset requested for:", user.email);
      console.log("🔗 Reset URL:", url);
      console.log("🎫 Reset Token:", token);

      const success = await mailService.sendPasswordResetEmail(
        user,
        url,
        process.env.NEXT_PUBLIC_APP_URL + "/help"
      );

      if (success) {
        console.log("✅ Password reset email sent successfully");
      } else {
        console.error("❌ Failed to send password reset email");
      }
    },
    resetPasswordTokenExpiresIn: 3600, // 1 hour
    requireEmailVerification: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      console.log("📧 Sending verification email to:", user.email);
      console.log("🔗 Verification URL:", url);
      console.log("🎫 Verification Token:", token);

      const success = await mailService.sendVerificationEmail(
        user,
        url,
        process.env.NEXT_PUBLIC_APP_URL + "/help"
      );

      if (success) {
        console.log("✅ Verification email sent successfully");
      } else {
        console.error("❌ Failed to send verification email");
      }
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  advanced: {
    cookies: {
      sessionToken: {
        name: "session_token",
        attributes: {
          secure: process.env.NODE_ENV === "production",
          httpOnly: true,
          sameSite: "strict",
        },
      },
    },
    defaultCookieAttributes: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "strict",
    },
    cookiePrefix: "st_auth",
  },
  onAPIError: {
    throw: true,
    onError: (error, ctx) => {
      console.error("API Error:", error);
    },
    errorURL: "/api/v1/auth/error",
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      // Send password change confirmation email after successful password reset
      if (
        ctx.path === "/reset-password" &&
        ctx.method === "POST" &&
        ctx.context.returned
      ) {
        const email = ctx.body?.email;
        if (email) {
          console.log("🔐 Password reset completed for:", email);

          // Get user info from the context or database
          const user = ctx.context.session?.user || {
            id: "unknown",
            name: "User",
            email: email,
          };

          const success = await mailService.sendPasswordChangeConfirmation(
            user,
            process.env.NEXT_PUBLIC_APP_URL + "/auth/signin",
            process.env.NEXT_PUBLIC_APP_URL + "/dashboard/security",
            ctx.request?.headers?.get("user-agent") || "Unknown device"
          );

          if (success) {
            console.log("✅ Password change confirmation email sent");
          } else {
            console.error(
              "❌ Failed to send password change confirmation email"
            );
          }
        }
      }

      // Send welcome email after successful email verification
      if (
        ctx.path === "/verify-email" &&
        ctx.method === "GET" &&
        ctx.context.returned
      ) {
        const user = ctx.context.session?.user;
        if (user) {
          console.log("🎉 Email verification completed for:", user.email);

          const success = await mailService.sendWelcomeEmail(
            user,
            process.env.NEXT_PUBLIC_APP_URL + "/dashboard",
            process.env.NEXT_PUBLIC_APP_URL + "/help"
          );

          if (success) {
            console.log("✅ Welcome email sent successfully");
          } else {
            console.error("❌ Failed to send welcome email");
          }
        }
      }
    }),
  },
  plugins: [openAPI(), expo()],
});

export type Auth = typeof auth;
export type Session = Auth["$Infer"]["Session"];

export { toNodeHandler } from "better-auth/node";
