import nodemailer from 'nodemailer';
import ejs from 'ejs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
  template: 'registration-verification' | 'welcome-verification-success' | 'password-reset-request' | 'password-change-confirmation';
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

class MailService {
  private transporter: nodemailer.Transporter | null = null;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
    this.initializeTransporter();
  }

  private initializeTransporter() {
    if (this.isDevelopment) {
      // In development, we'll simulate email sending
      console.log('📧 Mail Service initialized in DEVELOPMENT mode - emails will be logged to console');
      return;
    }

    // Production configuration - configure based on your email provider
    const emailConfig = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    };

    this.transporter = nodemailer.createTransport(emailConfig);
    
    // Verify connection configuration
    if (this.transporter) {
      this.transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Mail Service connection failed:', error);
      } else {
        console.log('✅ Mail Service ready for production');
      }
    });
    }
  }

  private async renderTemplate(template: string, data: any): Promise<string> {
    const templatePath = path.join(__dirname, '..', 'mail-templates', `${template}.ejs`);
    
    try {
      const html = await ejs.renderFile(templatePath, data);
      return html;
    } catch (error) {
      console.error(`❌ Error rendering email template ${template}:`, error);
      throw new Error(`Failed to render email template: ${template}`);
    }
  }

  private logEmailDetails(options: EmailOptions, html: string) {
    console.log('\n' + '='.repeat(80));
    console.log('📧 EMAIL SIMULATION LOG');
    console.log('='.repeat(80));
    console.log(`📬 To: ${options.to}`);
    console.log(`📝 Subject: ${options.subject}`);
    console.log(`🎨 Template: ${options.template}`);
    console.log(`👤 User: ${options.data.user.name} (${options.data.user.email})`);
    
    if (options.data.url) {
      console.log(`🔗 Verification/Reset URL: ${options.data.url}`);
    }
    
    if (options.data.token) {
      console.log(`🎫 Token: ${options.data.token}`);
    }
    
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
    console.log('\n📄 EMAIL CONTENT PREVIEW:');
    console.log('-'.repeat(40));
    
    // Extract text content for preview (remove HTML tags for cleaner log)
    const textPreview = html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 200) + '...';
    
    console.log(textPreview);
    console.log('-'.repeat(40));
    
    // Log additional data if present
    if (Object.keys(options.data).length > 3) { // More than user, url, token
      console.log('\n📊 Additional Data:');
      Object.entries(options.data).forEach(([key, value]) => {
        if (!['user', 'url', 'token'].includes(key)) {
          console.log(`  ${key}: ${value}`);
        }
      });
    }
    
    console.log('='.repeat(80) + '\n');
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // Render the email template
      const html = await this.renderTemplate(options.template, options.data);

      if (this.isDevelopment) {
        // Development mode: log email details instead of sending
        this.logEmailDetails(options, html);
        
        // Simulate email sending delay
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log(`✅ Email simulated successfully to ${options.to}`);
        return true;
      }

      // Production mode: actually send the email
      if (!this.transporter) {
        throw new Error('Mail transporter not initialized');
      }

      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@portfolio.com',
        to: options.to,
        subject: options.subject,
        html: html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${options.to}. Message ID: ${result.messageId}`);
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to send email to ${options.to}:`, error);
      return false;
    }
  }

  // Convenience methods for different email types
  async sendVerificationEmail(user: EmailUser, verificationUrl: string, token: string): Promise<boolean> {
    return this.sendEmail({
      to: user.email,
      subject: 'Verify Your Email Address - Portfolio',
      template: 'registration-verification',
      data: {
        user,
        url: verificationUrl,
        token,
      },
    });
  }

  async sendWelcomeEmail(user: EmailUser, dashboardUrl?: string, helpUrl?: string): Promise<boolean> {
    return this.sendEmail({
      to: user.email,
      subject: 'Welcome to Portfolio! 🎉',
      template: 'welcome-verification-success',
      data: {
        user,
        dashboardUrl,
        helpUrl,
      },
    });
  }

  async sendPasswordResetEmail(user: EmailUser, resetUrl: string, token: string): Promise<boolean> {
    return this.sendEmail({
      to: user.email,
      subject: 'Reset Your Password - Portfolio',
      template: 'password-reset-request',
      data: {
        user,
        url: resetUrl,
        token,
      },
    });
  }

  async sendPasswordChangeConfirmation(user: EmailUser, loginUrl?: string, securityUrl?: string, deviceInfo?: string): Promise<boolean> {
    return this.sendEmail({
      to: user.email,
      subject: 'Password Changed Successfully - Portfolio',
      template: 'password-change-confirmation',
      data: {
        user,
        loginUrl,
        securityUrl,
        deviceInfo,
      },
    });
  }
}

// Export singleton instance
export const mailService = new MailService();

// Export the class for testing purposes
export { MailService };