// Email Service - Uses SMTP configuration from environment variables
import nodemailer from 'nodemailer';
import { logger } from '@/lib/logger';

interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  replyTo?: string;
}

interface EmailTemplate {
  subject: string;
  text?: string;
  html: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

      if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
        logger.warn('Email service not configured - missing SMTP credentials');
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT),
        secure: parseInt(SMTP_PORT) === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });

      this.initialized = true;
      logger.info('Email service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email service', error);
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.initialized || !this.transporter) {
      logger.warn('Email service not initialized - skipping email send');
      return false;
    }

    try {
      const defaultFrom = `${process.env.NEXT_PUBLIC_APP_NAME || 'Suite Business'} <${process.env.SMTP_USER}>`;

      const info = await this.transporter.sendMail({
        from: options.from || defaultFrom,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html || options.text,
        replyTo: options.replyTo,
      });

      logger.info('Email sent successfully', {
        messageId: info.messageId,
        to: options.to,
        subject: options.subject,
      });

      return true;
    } catch (error) {
      logger.error('Failed to send email', error, {
        to: options.to,
        subject: options.subject,
      });
      return false;
    }
  }

  // ==================== EMAIL TEMPLATES ====================

  // Contact Form Submission - To Business Owner
  getContactFormTemplate(data: {
    firstName: string;
    lastName?: string;
    email?: string;
    phone?: string;
    message?: string;
    businessName: string;
    formType?: string;
  }): EmailTemplate {
    const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ');
    
    return {
      subject: `New ${data.formType || 'Contact'} Form Submission - ${data.businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Form Submission</h2>
          <p>You've received a new contact form submission from your website.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Contact Details:</h3>
            <p><strong>Name:</strong> ${fullName}</p>
            ${data.email ? `<p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>` : ''}
            ${data.phone ? `<p><strong>Phone:</strong> <a href="tel:${data.phone}">${data.phone}</a></p>` : ''}
            ${data.message ? `
              <p><strong>Message:</strong></p>
              <p style="white-space: pre-wrap;">${data.message}</p>
            ` : ''}
          </div>
          
          <p style="color: #666; font-size: 14px;">
            This lead has been automatically added to your CRM.
          </p>
        </div>
      `,
      text: `
New Contact Form Submission

Name: ${fullName}
${data.email ? `Email: ${data.email}` : ''}
${data.phone ? `Phone: ${data.phone}` : ''}
${data.message ? `\nMessage:\n${data.message}` : ''}

This lead has been automatically added to your CRM.
      `.trim()
    };
  }

  // Auto-response to Contact
  getContactAutoResponseTemplate(data: {
    firstName: string;
    businessName: string;
    businessEmail?: string;
    businessPhone?: string;
  }): EmailTemplate {
    return {
      subject: `Thank you for contacting ${data.businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Thank You for Reaching Out!</h2>
          <p>Hi ${data.firstName},</p>
          <p>We've received your message and appreciate you taking the time to contact us. Our team will review your inquiry and get back to you as soon as possible.</p>
          
          <p>In the meantime, if you have any urgent questions, please don't hesitate to reach out:</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            ${data.businessPhone ? `<p><strong>Phone:</strong> <a href="tel:${data.businessPhone}">${data.businessPhone}</a></p>` : ''}
            ${data.businessEmail ? `<p><strong>Email:</strong> <a href="mailto:${data.businessEmail}">${data.businessEmail}</a></p>` : ''}
          </div>
          
          <p>We look forward to speaking with you soon!</p>
          
          <p>Best regards,<br>The ${data.businessName} Team</p>
        </div>
      `,
      text: `
Hi ${data.firstName},

Thank you for reaching out to ${data.businessName}!

We've received your message and appreciate you taking the time to contact us. Our team will review your inquiry and get back to you as soon as possible.

In the meantime, if you have any urgent questions, please don't hesitate to reach out:
${data.businessPhone ? `Phone: ${data.businessPhone}` : ''}
${data.businessEmail ? `Email: ${data.businessEmail}` : ''}

We look forward to speaking with you soon!

Best regards,
The ${data.businessName} Team
      `.trim()
    };
  }

  // Welcome Email for New Users
  getWelcomeEmailTemplate(data: {
    firstName: string;
    subdomain: string;
  }): EmailTemplate {
    const siteUrl = `https://${data.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;
    const dashboardUrl = `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/dashboard`;

    return {
      subject: 'Welcome to Suite Business! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; text-align: center;">Welcome to Suite Business!</h1>
          
          <p>Hi ${data.firstName},</p>
          
          <p>Congratulations! Your business website is now live and ready to help you grow your business.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Website Details:</h3>
            <p><strong>Live Site:</strong> <a href="${siteUrl}" style="color: #0066cc;">${siteUrl}</a></p>
            <p><strong>Dashboard:</strong> <a href="${dashboardUrl}" style="color: #0066cc;">${dashboardUrl}</a></p>
          </div>
          
          <h3>What's Next?</h3>
          <ol>
            <li><strong>Customize Your Site:</strong> Add your logo, update colors, and personalize content</li>
            <li><strong>Set Up Forms:</strong> Create custom forms to capture leads</li>
            <li><strong>Connect Integrations:</strong> Link your Google Business Profile and other tools</li>
            <li><strong>Start Marketing:</strong> Share your new website with customers</li>
          </ol>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" style="background-color: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Dashboard</a>
          </div>
          
          <p>If you have any questions or need help getting started, our support team is here to help!</p>
          
          <p>Best regards,<br>The Suite Business Team</p>
        </div>
      `,
      text: `
Welcome to Suite Business!

Hi ${data.firstName},

Congratulations! Your business website is now live and ready to help you grow your business.

Your Website Details:
- Live Site: ${siteUrl}
- Dashboard: ${dashboardUrl}

What's Next?
1. Customize Your Site: Add your logo, update colors, and personalize content
2. Set Up Forms: Create custom forms to capture leads
3. Connect Integrations: Link your Google Business Profile and other tools
4. Start Marketing: Share your new website with customers

If you have any questions or need help getting started, our support team is here to help!

Best regards,
The Suite Business Team
      `.trim()
    };
  }

  // Lead Notification for Admin
  getLeadNotificationTemplate(data: {
    leadName: string;
    leadEmail?: string;
    leadPhone?: string;
    source: string;
    businessName: string;
    siteUrl: string;
  }): EmailTemplate {
    return {
      subject: `New Lead: ${data.leadName} - ${data.businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Lead Alert! 🎯</h2>
          
          <p>A new lead has been captured for <strong>${data.businessName}</strong>.</p>
          
          <div style="background-color: #e8f5e9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2e7d32;">Lead Details:</h3>
            <p><strong>Name:</strong> ${data.leadName}</p>
            ${data.leadEmail ? `<p><strong>Email:</strong> <a href="mailto:${data.leadEmail}">${data.leadEmail}</a></p>` : ''}
            ${data.leadPhone ? `<p><strong>Phone:</strong> <a href="tel:${data.leadPhone}">${data.leadPhone}</a></p>` : ''}
            <p><strong>Source:</strong> ${data.source}</p>
            <p><strong>From Site:</strong> <a href="${data.siteUrl}">${data.siteUrl}</a></p>
          </div>
          
          <p>This lead has been automatically synced to your CRM. Log in to view full details and follow up.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/dashboard/crm" style="background-color: #2e7d32; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View in CRM</a>
          </div>
        </div>
      `,
      text: `
New Lead Alert!

A new lead has been captured for ${data.businessName}.

Lead Details:
- Name: ${data.leadName}
${data.leadEmail ? `- Email: ${data.leadEmail}` : ''}
${data.leadPhone ? `- Phone: ${data.leadPhone}` : ''}
- Source: ${data.source}
- From Site: ${data.siteUrl}

This lead has been automatically synced to your CRM. Log in to view full details and follow up.
      `.trim()
    };
  }

  // ==================== QUEUE SYSTEM (with Redis when available) ====================

  async queueEmail(options: EmailOptions & { template?: string; data?: any }): Promise<void> {
    // For now, send immediately. When Redis is set up, we'll queue here
    await this.sendEmail(options);
  }

  // ==================== BULK EMAIL HELPERS ====================

  async sendBulkEmails(recipients: string[], template: EmailTemplate, options?: Partial<EmailOptions>): Promise<void> {
    // Send in batches to avoid overwhelming the SMTP server
    const batchSize = 50;
    const batches = [];
    
    for (let i = 0; i < recipients.length; i += batchSize) {
      batches.push(recipients.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      await Promise.all(
        batch.map(to => 
          this.sendEmail({
            to,
            subject: template.subject,
            text: template.text,
            html: template.html,
            ...options
          })
        )
      );
      
      // Rate limiting - wait 1 second between batches
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Export types
export type { EmailOptions, EmailTemplate };
