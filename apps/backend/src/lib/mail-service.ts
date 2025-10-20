import nodemailer from "nodemailer";
import ejs from "ejs";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// Load environment variables from the project root

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface EmailUser {
  id: string;
  name: string;
  email: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  template:
    | "registration-verification"
    | "welcome-verification-success"
    | "password-reset-request"
    | "password-change-confirmation"
    | "email-verification-confirmation";
  data: {
    user: EmailUser;
    url?: string;
    token?: string;
    dashboardUrl?: string;
    helpUrl?: string;
    loginUrl?: string;
    securityUrl?: string;
    deviceInfo?: string;
    [key: string]: any;
  };
}

// Global transporter instance
let transporter: nodemailer.Transporter | null = null;
let isDevelopment: boolean = process.env.NODE_ENV !== "production";

/**
 * Creates and configures the email transporter based on environment
 */
function createTransporter(): nodemailer.Transporter | null {
  // Log environment variables for debugging
  console.log("🔍 Environment Debug Info:");
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`isDevelopment: ${isDevelopment}`);

  if (isDevelopment) {
    // Development mode: Use Mailtrap
    console.log(
      "📧 Mail Service initialized in DEVELOPMENT mode - using Mailtrap"
    );

    // Log Mailtrap environment variables
    console.log("🔧 Mailtrap Configuration:");
    console.log(
      `MAILTRAP_SMTP_HOST: ${process.env.MAILTRAP_SMTP_HOST || "sandbox.smtp.mailtrap.io"}`
    );
    console.log(
      `MAILTRAP_SMTP_PORT: ${process.env.MAILTRAP_SMTP_PORT || "2525"}`
    );
    console.log(
      `MAILTRAP_SMTP_USER: ${process.env.MAILTRAP_SMTP_USER ? "***SET***" : "NOT SET"}`
    );
    console.log(
      `MAILTRAP_SMTP_PASS: ${process.env.MAILTRAP_SMTP_PASS ? "***SET***" : "NOT SET"}`
    );

    if (!process.env.MAILTRAP_SMTP_USER || !process.env.MAILTRAP_SMTP_PASS) {
      console.error(
        "❌ Missing Mailtrap credentials! Please set MAILTRAP_SMTP_USER and MAILTRAP_SMTP_PASS in your .env file"
      );
      return null;
    }

    return nodemailer.createTransport({
      host: process.env.MAILTRAP_SMTP_HOST || "sandbox.smtp.mailtrap.io",
      port: parseInt(process.env.MAILTRAP_SMTP_PORT || "2525"),
      secure: false, // Mailtrap uses STARTTLS
      auth: {
        user: process.env.MAILTRAP_SMTP_USER,
        pass: process.env.MAILTRAP_SMTP_PASS,
      },
      // Enable HTML support for Mailtrap
      tls: {
        rejectUnauthorized: false,
      },
    });
  } else {
    // Production mode: Use environment variables for SMTP configuration
    console.log("📧 Mail Service initialized in PRODUCTION mode");

    // Log production SMTP environment variables
    console.log("🔧 Production SMTP Configuration:");
    console.log(`SMTP_HOST: ${process.env.SMTP_HOST || "NOT SET"}`);
    console.log(`SMTP_PORT: ${process.env.SMTP_PORT || "587"}`);
    console.log(`SMTP_SECURE: ${process.env.SMTP_SECURE || "false"}`);
    console.log(
      `SMTP_USER: ${process.env.SMTP_USER ? "***SET***" : "NOT SET"}`
    );
    console.log(
      `SMTP_PASS: ${process.env.SMTP_PASS ? "***SET***" : "NOT SET"}`
    );

    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS
    ) {
      console.error(
        "❌ Missing production SMTP credentials! Please set SMTP_HOST, SMTP_USER, and SMTP_PASS in your .env file"
      );
      return null;
    }

    const emailConfig = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Ensure HTML support in production
      tls: {
        rejectUnauthorized: false,
      },
    };

    const prodTransporter = nodemailer.createTransport(emailConfig);

    // Verify connection configuration
    prodTransporter.verify((error: any, success: any) => {
      if (error) {
        console.error("❌ Mail Service connection failed:", error);
      } else {
        console.log("✅ Mail Service ready for production");
      }
    });

    return prodTransporter;
  }
}

/**
 * Gets or creates the transporter instance
 */
function getTransporter(): nodemailer.Transporter | null {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
}

/**
 * Renders an email template with the provided data
 */
async function renderTemplate(template: string, data: any): Promise<string> {
  const templatePath = path.join(
    __dirname,
    "..",
    "mail-templates",
    `${template}.ejs`
  );

  try {
    const html = await ejs.renderFile(templatePath, data);
    return html;
  } catch (error) {
    console.error(`❌ Error rendering email template ${template}:`, error);
    throw new Error(`Failed to render email template: ${template}`);
  }
}

/**
 * Logs email details for development mode
 */
function logEmailDetails(options: EmailOptions, html: string): void {
  console.log("\n" + "=".repeat(80));
  console.log("📧 EMAIL LOG");
  console.log("=".repeat(80));
  console.log(`📬 To: ${options.to}`);
  console.log(`📝 Subject: ${options.subject}`);
  console.log(`🎨 Template: ${options.template}`);
  console.log(
    `👤 User: ${options.data.user.name} (${options.data.user.email})`
  );

  if (options.data.url) {
    console.log(`🔗 Verification/Reset URL: ${options.data.url}`);
  }

  if (options.data.token) {
    console.log(`🎫 Token: ${options.data.token}`);
  }

  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  console.log("\n📄 EMAIL CONTENT PREVIEW:");
  console.log("-".repeat(40));

  // Extract text content for preview (remove HTML tags for cleaner log)
  const textPreview =
    html
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 200) + "...";

  console.log(textPreview);
  console.log("-".repeat(40));

  // Log additional data if present
  if (Object.keys(options.data).length > 3) {
    // More than user, url, token
    console.log("\n📊 Additional Data:");
    Object.entries(options.data).forEach(([key, value]) => {
      if (!["user", "url", "token"].includes(key)) {
        console.log(`  ${key}: ${value}`);
      }
    });
  }

  console.log("=".repeat(80) + "\n");
}

/**
 * Sends an email using the configured transporter
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Get the transporter first to check if it's available
    const emailTransporter = getTransporter();

    if (!emailTransporter) {
      console.error(
        "❌ Mail transporter not initialized - check your environment variables"
      );
      return false;
    }

    // Render the email template
    const html = await renderTemplate(options.template, options.data);

    if (isDevelopment) {
      // Development mode: log email details and send via Mailtrap
      logEmailDetails(options, html);
    }

    const mailOptions = {
      from:
        process.env.MAILTRAP_SMTP_FROM ||
        process.env.SMTP_FROM ||
        "noreply@portfolio.com",
      to: options.to,
      subject: options.subject,
      html: html,
      // Explicitly set content type for HTML rendering
      headers: {
        "Content-Type": "text/html; charset=UTF-8",
        "MIME-Version": "1.0",
      },
    };

    const result = await emailTransporter.sendMail(mailOptions);

    if (isDevelopment) {
      console.log(
        `✅ Email sent to Mailtrap for ${options.to}. Message ID: ${result.messageId}`
      );
      console.log(`🌐 View email at: https://mailtrap.io/inboxes`);
    } else {
      console.log(
        `✅ Email sent successfully to ${options.to}. Message ID: ${result.messageId}`
      );
    }

    return true;
  } catch (error) {
    console.error(`❌ Failed to send email to ${options.to}:`, error);
    return false;
  }
}

/**
 * Sends a verification email to the user
 */
export async function sendVerificationEmail(
  user: EmailUser,
  verificationUrl: string,
  token: string
): Promise<boolean> {
  return sendEmail({
    to: user.email,
    subject: "Verify Your Email Address - Portfolio",
    template: "registration-verification",
    data: {
      user,
      url: verificationUrl,
      token,
    },
  });
}

/**
 * Sends a welcome email to the user after successful verification
 */
export async function sendWelcomeEmail(
  user: EmailUser,
  dashboardUrl?: string,
  helpUrl?: string
): Promise<boolean> {
  return sendEmail({
    to: user.email,
    subject: "Welcome to Portfolio! 🎉",
    template: "welcome-verification-success",
    data: {
      user,
      dashboardUrl,
      helpUrl,
    },
  });
}

/**
 * Sends a password reset email to the user
 */
export async function sendPasswordResetEmail(
  user: EmailUser,
  resetUrl: string,
  token: string
): Promise<boolean> {
  return sendEmail({
    to: user.email,
    subject: "Reset Your Password - Portfolio",
    template: "password-reset-request",
    data: {
      user,
      url: resetUrl,
      token,
    },
  });
}

/**
 * Sends a password change confirmation email to the user
 */
export async function sendPasswordChangeConfirmation(
  user: EmailUser,
  loginUrl?: string,
  securityUrl?: string,
  deviceInfo?: string
): Promise<boolean> {
  return sendEmail({
    to: user.email,
    subject: "Password Changed Successfully - Portfolio",
    template: "password-change-confirmation",
    data: {
      user,
      loginUrl,
      securityUrl,
      deviceInfo,
    },
  });
}

/**
 * Sends an email verification confirmation to the user
 */
export async function sendEmailVerificationConfirmation(
  user: EmailUser,
  loginUrl?: string
): Promise<boolean> {
  return sendEmail({
    to: user.email,
    subject: "Email Verified Successfully - Portfolio",
    template: "email-verification-confirmation",
    data: {
      user,
      loginUrl,
    },
  });
}

/**
 * Reinitializes the transporter (useful for testing or config changes)
 */
export function reinitializeTransporter(): void {
  transporter = null;
  isDevelopment = process.env.NODE_ENV !== "production";
  transporter = createTransporter();
}

// Initialize transporter on module load
transporter = createTransporter();
