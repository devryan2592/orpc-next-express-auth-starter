import { createAuth } from "@workspace/auth";
import { prisma } from "@workspace/db";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordChangeConfirmation,
  sendEmailVerificationConfirmation,
} from "../lib/mail-service";

const auth = createAuth({
  prisma: prisma,
  basePath: "/api/v1/auth",
  trustedOrigins: ["http://localhost:3000"],
  mailService: {
    sendPasswordResetEmail: async ({ user, url, token }, request) => {
      console.log("🔄 Sending password reset email...");

      const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/update-password?token=${token}`;

      const success = await sendPasswordResetEmail(
        { id: user.id, name: user.name, email: user.email },
        resetUrl,
        token
      );
      if (success) {
        console.log("✅ Password reset email sent successfully");
      } else {
        console.error("❌ Failed to send password reset email");
      }
    },
    sendVerificationEmail: async ({ user, url, token }, request) => {
      console.log("🔄 Sending verification email...");

      const verifyUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/verify-email?token=${token}`;

      const success = await sendVerificationEmail(
        { id: user.id, name: user.name, email: user.email },
        verifyUrl,
        token
      );
      if (success) {
        console.log("✅ Verification email sent successfully");
      } else {
        console.error("❌ Failed to send verification email");
      }
    },
    sendWelcomeEmail: async ({ user }, request) => {
      console.log("🔄 Sending welcome email...");

      const dashboardUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/dashboard`;
      const helpUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/help`;

      const success = await sendWelcomeEmail(
        { id: user.id, name: user.name, email: user.email },
        dashboardUrl, // dashboardUrl
        helpUrl // helpUrl
      );
      if (success) {
        console.log("✅ Welcome email sent successfully");
      } else {
        console.error("❌ Failed to send welcome email");
      }
    },
    sendPasswordChangeConfirmation: async ({ user }, request) => {
      console.log("🔄 Sending password change confirmation email...");

      const loginUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/login`;
      const securityUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/security`;

      const success = await sendPasswordChangeConfirmation(
        { id: user.id, name: user.name, email: user.email },
        loginUrl, // loginUrl
        securityUrl, // securityUrl
        request?.headers?.["user-agent"] || "Unknown device" // deviceInfo
      );
      if (success) {
        console.log("✅ Password change confirmation email sent successfully");
      } else {
        console.error("❌ Failed to send password change confirmation email");
      }
    },
    sendEmailVerificationConfirmation: async ({ user }, request) => {
      console.log("🔄 Sending email verification confirmation...");

      const loginUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/login`;

      const success = await sendEmailVerificationConfirmation(
        { id: user.id, name: user.name, email: user.email },
        loginUrl // loginUrl
      );
      if (success) {
        console.log("✅ Email verification confirmation sent successfully");
      } else {
        console.error("❌ Failed to send email verification confirmation");
      }
    },
  },
});

export default auth;
