/**
 * Email Templates System
 * 
 * Professional email templates for all platform notifications
 * including lead notifications, payment failures, welcome emails, etc.
 */

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface EmailTemplateData {
  [key: string]: any;
}

/**
 * Email template generator class
 */
export class EmailTemplateGenerator {
  private baseUrl: string;
  private brandName: string;
  private supportEmail: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sitebango.com';
    this.brandName = 'SiteBango';
    this.supportEmail = process.env.SUPPORT_EMAIL || 'support@sitebango.com';
  }

  /**
   * Generate email template by type
   */
  generateTemplate(type: string, data: EmailTemplateData): EmailTemplate {
    switch (type) {
      case 'welcome':
        return this.generateWelcomeEmail(data);
      case 'new-lead':
        return this.generateNewLeadEmail(data);
      case 'payment-failed':
        return this.generatePaymentFailedEmail(data);
      case 'payment-success':
        return this.generatePaymentSuccessEmail(data);
      case 'site-published':
        return this.generateSitePublishedEmail(data);
      case 'ghl-setup-required':
        return this.generateGHLSetupEmail(data);
      case 'password-reset':
        return this.generatePasswordResetEmail(data);
      case 'team-invitation':
        return this.generateTeamInvitationEmail(data);
      case 'subscription-expiring':
        return this.generateSubscriptionExpiringEmail(data);
      default:
        throw new Error(`Unknown email template type: ${type}`);
    }
  }

  /**
   * Welcome email for new users
   */
  private generateWelcomeEmail(data: EmailTemplateData): EmailTemplate {
    const { userName, userEmail } = data;

    return {
      subject: `Welcome to ${this.brandName}! Let's build your website`,
      html: this.wrapInLayout(`
        <h1>Welcome to ${this.brandName}!</h1>
        <p>Hi ${userName || 'there'},</p>
        
        <p>Welcome to ${this.brandName}! We're excited to help you create a professional website for your business.</p>
        
        <div style="background: #f8fafc; padding: 24px; border-radius: 8px; margin: 24px 0;">
          <h3 style="margin: 0 0 16px 0; color: #1e293b;">What's next?</h3>
          <ol style="margin: 0; padding-left: 20px; color: #475569;">
            <li style="margin-bottom: 8px;">Complete your business profile</li>
            <li style="margin-bottom: 8px;">Answer a few quick questions about your business</li>
            <li style="margin-bottom: 8px;">Watch as we generate your unique website</li>
            <li>Publish and start getting customers!</li>
          </ol>
        </div>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${this.baseUrl}/onboarding" 
             style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
            Start Building Your Website
          </a>
        </div>
        
        <p>If you have any questions, just reply to this email or contact us at ${this.supportEmail}.</p>
        
        <p>Best regards,<br>The ${this.brandName} Team</p>
      `),
      text: `Welcome to ${this.brandName}!\n\nHi ${userName || 'there'},\n\nWelcome to ${this.brandName}! We're excited to help you create a professional website for your business.\n\nWhat's next?\n1. Complete your business profile\n2. Answer a few quick questions about your business\n3. Watch as we generate your unique website\n4. Publish and start getting customers!\n\nGet started: ${this.baseUrl}/onboarding\n\nIf you have any questions, contact us at ${this.supportEmail}.\n\nBest regards,\nThe ${this.brandName} Team`
    };
  }

  /**
   * New lead notification email
   */
  private generateNewLeadEmail(data: EmailTemplateData): EmailTemplate {
    const { 
      businessName, 
      leadName, 
      leadEmail, 
      leadPhone, 
      leadMessage, 
      source, 
      siteUrl 
    } = data;

    return {
      subject: `🎉 New Lead: ${leadName} - ${businessName}`,
      html: this.wrapInLayout(`
        <h1>🎉 New Lead Alert!</h1>
        <p>Great news! You have a new lead from your website.</p>
        
        <div style="background: #f0f9ff; border: 2px solid #0ea5e9; padding: 24px; border-radius: 8px; margin: 24px 0;">
          <h3 style="margin: 0 0 16px 0; color: #0c4a6e;">Lead Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: 500; color: #374151; width: 100px;">Name:</td>
              <td style="padding: 8px 0; color: #1f2937;">${leadName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 500; color: #374151;">Email:</td>
              <td style="padding: 8px 0; color: #1f2937;">
                <a href="mailto:${leadEmail}" style="color: #3b82f6; text-decoration: none;">${leadEmail}</a>
              </td>
            </tr>
            ${leadPhone ? `
            <tr>
              <td style="padding: 8px 0; font-weight: 500; color: #374151;">Phone:</td>
              <td style="padding: 8px 0; color: #1f2937;">
                <a href="tel:${leadPhone}" style="color: #3b82f6; text-decoration: none;">${leadPhone}</a>
              </td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0; font-weight: 500; color: #374151;">Source:</td>
              <td style="padding: 8px 0; color: #1f2937;">${source}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 500; color: #374151;">Website:</td>
              <td style="padding: 8px 0; color: #1f2937;">
                <a href="${siteUrl}" style="color: #3b82f6; text-decoration: none;">${siteUrl}</a>
              </td>
            </tr>
          </table>
          
          ${leadMessage ? `
          <div style="margin-top: 16px;">
            <strong style="color: #374151;">Message:</strong>
            <div style="background: white; padding: 16px; border-radius: 6px; margin-top: 8px; border: 1px solid #e5e7eb;">
              ${leadMessage}
            </div>
          </div>
          ` : ''}
        </div>
        
        <div style="background: #fef3c7; padding: 16px; border-radius: 6px; margin: 24px 0;">
          <p style="margin: 0; color: #92400e; font-weight: 500;">
            💡 <strong>Pro Tip:</strong> Follow up within 5 minutes to maximize your conversion rate!
          </p>
        </div>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="mailto:${leadEmail}" 
             style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500; margin-right: 12px;">
            Email ${leadName}
          </a>
          ${leadPhone ? `
          <a href="tel:${leadPhone}" 
             style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
            Call ${leadName}
          </a>
          ` : ''}
        </div>
        
        <p>This lead came from your ${this.brandName} website. Keep up the great work!</p>
      `),
      text: `🎉 New Lead Alert!\n\nGreat news! You have a new lead from your website.\n\nLead Details:\nName: ${leadName}\nEmail: ${leadEmail}\n${leadPhone ? `Phone: ${leadPhone}\n` : ''}Source: ${source}\nWebsite: ${siteUrl}\n\n${leadMessage ? `Message: ${leadMessage}\n\n` : ''}Pro Tip: Follow up within 5 minutes to maximize your conversion rate!\n\nThis lead came from your ${this.brandName} website. Keep up the great work!`
    };
  }

  /**
   * Payment failed notification
   */
  private generatePaymentFailedEmail(data: EmailTemplateData): EmailTemplate {
    const { userName, amount, invoiceId, dueDate } = data;

    return {
      subject: `Payment Failed - Action Required`,
      html: this.wrapInLayout(`
        <h1>Payment Failed</h1>
        <p>Hi ${userName || 'there'},</p>
        
        <p>We were unable to process your payment for your ${this.brandName} subscription.</p>
        
        <div style="background: #fef2f2; border: 2px solid #f87171; padding: 24px; border-radius: 8px; margin: 24px 0;">
          <h3 style="margin: 0 0 16px 0; color: #dc2626;">Payment Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: 500; color: #374151; width: 120px;">Amount:</td>
              <td style="padding: 8px 0; color: #1f2937;">$${amount}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 500; color: #374151;">Invoice:</td>
              <td style="padding: 8px 0; color: #1f2937;">${invoiceId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 500; color: #374151;">Due Date:</td>
              <td style="padding: 8px 0; color: #1f2937;">${dueDate}</td>
            </tr>
          </table>
        </div>
        
        <p>Please update your payment method to avoid service interruption.</p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${this.baseUrl}/dashboard/billing" 
             style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
            Update Payment Method
          </a>
        </div>
        
        <p>If you have any questions, please contact our support team at ${this.supportEmail}.</p>
        
        <p>Best regards,<br>The ${this.brandName} Team</p>
      `),
      text: `Payment Failed\n\nHi ${userName || 'there'},\n\nWe were unable to process your payment for your ${this.brandName} subscription.\n\nPayment Details:\nAmount: $${amount}\nInvoice: ${invoiceId}\nDue Date: ${dueDate}\n\nPlease update your payment method to avoid service interruption.\n\nUpdate payment method: ${this.baseUrl}/dashboard/billing\n\nIf you have any questions, contact us at ${this.supportEmail}.\n\nBest regards,\nThe ${this.brandName} Team`
    };
  }

  /**
   * Payment success confirmation
   */
  private generatePaymentSuccessEmail(data: EmailTemplateData): EmailTemplate {
    const { userName, amount, planName, nextBillingDate } = data;

    return {
      subject: `Payment Confirmed - Thank You!`,
      html: this.wrapInLayout(`
        <h1>Payment Confirmed!</h1>
        <p>Hi ${userName || 'there'},</p>
        
        <p>Thank you! Your payment has been successfully processed.</p>
        
        <div style="background: #f0fdf4; border: 2px solid #22c55e; padding: 24px; border-radius: 8px; margin: 24px 0;">
          <h3 style="margin: 0 0 16px 0; color: #15803d;">Payment Summary</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: 500; color: #374151; width: 140px;">Amount Paid:</td>
              <td style="padding: 8px 0; color: #1f2937;">$${amount}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 500; color: #374151;">Plan:</td>
              <td style="padding: 8px 0; color: #1f2937;">${planName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 500; color: #374151;">Next Billing:</td>
              <td style="padding: 8px 0; color: #1f2937;">${nextBillingDate}</td>
            </tr>
          </table>
        </div>
        
        <p>Your subscription is now active and your website will continue running smoothly.</p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${this.baseUrl}/dashboard" 
             style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
            View Dashboard
          </a>
        </div>
        
        <p>Thank you for choosing ${this.brandName}!</p>
        
        <p>Best regards,<br>The ${this.brandName} Team</p>
      `),
      text: `Payment Confirmed!\n\nHi ${userName || 'there'},\n\nThank you! Your payment has been successfully processed.\n\nPayment Summary:\nAmount Paid: $${amount}\nPlan: ${planName}\nNext Billing: ${nextBillingDate}\n\nYour subscription is now active and your website will continue running smoothly.\n\nView dashboard: ${this.baseUrl}/dashboard\n\nThank you for choosing ${this.brandName}!\n\nBest regards,\nThe ${this.brandName} Team`
    };
  }

  /**
   * Site published notification
   */
  private generateSitePublishedEmail(data: EmailTemplateData): EmailTemplate {
    const { userName, businessName, siteUrl, customDomain } = data;

    return {
      subject: `🎉 Your website is live! - ${businessName}`,
      html: this.wrapInLayout(`
        <h1>🎉 Your Website is Live!</h1>
        <p>Hi ${userName || 'there'},</p>
        
        <p>Congratulations! Your website for <strong>${businessName}</strong> is now live and ready to attract customers.</p>
        
        <div style="background: #f0f9ff; border: 2px solid #3b82f6; padding: 24px; border-radius: 8px; margin: 24px 0;">
          <h3 style="margin: 0 0 16px 0; color: #1e40af;">Your Website Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: 500; color: #374151; width: 120px;">Business:</td>
              <td style="padding: 8px 0; color: #1f2937;">${businessName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 500; color: #374151;">Website URL:</td>
              <td style="padding: 8px 0; color: #1f2937;">
                <a href="${siteUrl}" style="color: #3b82f6; text-decoration: none;">${siteUrl}</a>
              </td>
            </tr>
            ${customDomain ? `
            <tr>
              <td style="padding: 8px 0; font-weight: 500; color: #374151;">Custom Domain:</td>
              <td style="padding: 8px 0; color: #1f2937;">
                <a href="https://${customDomain}" style="color: #3b82f6; text-decoration: none;">${customDomain}</a>
              </td>
            </tr>
            ` : ''}
          </table>
        </div>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${siteUrl}" 
             style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500; margin-right: 12px;">
            View Your Website
          </a>
          <a href="${this.baseUrl}/dashboard" 
             style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
            Manage Website
          </a>
        </div>
        
        <div style="background: #fef3c7; padding: 16px; border-radius: 6px; margin: 24px 0;">
          <p style="margin: 0; color: #92400e; font-weight: 500;">
            💡 <strong>Next Steps:</strong> Share your website URL on social media, business cards, and with customers to start getting leads!
          </p>
        </div>
        
        <p>Your website is optimized for search engines and mobile devices, so you're ready to start attracting customers right away.</p>
        
        <p>Best regards,<br>The ${this.brandName} Team</p>
      `),
      text: `🎉 Your Website is Live!\n\nHi ${userName || 'there'},\n\nCongratulations! Your website for ${businessName} is now live and ready to attract customers.\n\nYour Website Details:\nBusiness: ${businessName}\nWebsite URL: ${siteUrl}\n${customDomain ? `Custom Domain: https://${customDomain}\n` : ''}\nView your website: ${siteUrl}\nManage website: ${this.baseUrl}/dashboard\n\nNext Steps: Share your website URL on social media, business cards, and with customers to start getting leads!\n\nYour website is optimized for search engines and mobile devices, so you're ready to start attracting customers right away.\n\nBest regards,\nThe ${this.brandName} Team`
    };
  }

  /**
   * GHL setup required notification
   */
  private generateGHLSetupEmail(data: EmailTemplateData): EmailTemplate {
    const { userName, businessName, ghlLocationId } = data;

    return {
      subject: `GoHighLevel Setup Required - ${businessName}`,
      html: this.wrapInLayout(`
        <h1>GoHighLevel Setup Required</h1>
        <p>Hi ${userName || 'there'},</p>
        
        <p>Your GoHighLevel integration for <strong>${businessName}</strong> requires manual API key generation to complete the setup.</p>
        
        <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 24px; border-radius: 8px; margin: 24px 0;">
          <h3 style="margin: 0 0 16px 0; color: #92400e;">Setup Instructions</h3>
          <ol style="margin: 0; padding-left: 20px; color: #92400e;">
            <li style="margin-bottom: 8px;">Log into your GoHighLevel account</li>
            <li style="margin-bottom: 8px;">Navigate to Settings → Integrations → API</li>
            <li style="margin-bottom: 8px;">Generate a new API key for location: <strong>${ghlLocationId}</strong></li>
            <li style="margin-bottom: 8px;">Copy the API key</li>
            <li>Return to your ${this.brandName} dashboard and paste the API key</li>
          </ol>
        </div>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${this.baseUrl}/dashboard/integrations" 
             style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
            Complete Setup
          </a>
        </div>
        
        <p>Once completed, your website will automatically sync leads and customer data with GoHighLevel.</p>
        
        <p>If you need help, please contact our support team at ${this.supportEmail}.</p>
        
        <p>Best regards,<br>The ${this.brandName} Team</p>
      `),
      text: `GoHighLevel Setup Required\n\nHi ${userName || 'there'},\n\nYour GoHighLevel integration for ${businessName} requires manual API key generation to complete the setup.\n\nSetup Instructions:\n1. Log into your GoHighLevel account\n2. Navigate to Settings → Integrations → API\n3. Generate a new API key for location: ${ghlLocationId}\n4. Copy the API key\n5. Return to your ${this.brandName} dashboard and paste the API key\n\nComplete setup: ${this.baseUrl}/dashboard/integrations\n\nOnce completed, your website will automatically sync leads and customer data with GoHighLevel.\n\nIf you need help, contact us at ${this.supportEmail}.\n\nBest regards,\nThe ${this.brandName} Team`
    };
  }

  /**
   * Wrap email content in branded layout
   */
  private wrapInLayout(content: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${this.brandName}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 32px 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">${this.brandName}</h1>
            <p style="color: #bfdbfe; margin: 8px 0 0 0; font-size: 16px;">Professional Websites for Service Businesses</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 32px 24px;">
            ${content}
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
              © ${new Date().getFullYear()} ${this.brandName}. All rights reserved.
            </p>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              <a href="${this.baseUrl}" style="color: #3b82f6; text-decoration: none;">Visit Website</a> | 
              <a href="${this.baseUrl}/support" style="color: #3b82f6; text-decoration: none;">Support</a> | 
              <a href="${this.baseUrl}/unsubscribe" style="color: #6b7280; text-decoration: none;">Unsubscribe</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

/**
 * Export singleton instance
 */
export const emailTemplateGenerator = new EmailTemplateGenerator();

/**
 * Helper function to generate and send email
 */
export async function sendTemplateEmail(
  to: string,
  templateType: string,
  data: EmailTemplateData
): Promise<void> {
  const template = emailTemplateGenerator.generateTemplate(templateType, data);
  
  // This would integrate with your email service (SendGrid, AWS SES, etc.)
  // For now, we'll use the existing email service
  const { emailService } = await import('@/lib/email');
  
  await emailService.sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}