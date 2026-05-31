import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER || 'noreply@lostpaws.com';

if (API_KEY) {
    sgMail.setApiKey(API_KEY);
} else {
    console.warn('[Email Service] Warning: SENDGRID_API_KEY is not set. Emails will not be sent.');
}

const BRAND_NAVY = '#1B2132';
const BRAND_YELLOW = '#FFCB58';
const TEXT_GREY = '#41495A';

export const sendVerificationEmail = async (userEmail: string, code: string) => {
    try {
        console.log(`[Email] Sending verification email to: ${userEmail}`);
        
        const msg = {
            to: userEmail,
            from: {
                email: FROM_EMAIL,
                name: "Lost Paws Support"
            },
            subject: 'Verify your Lost Paws account',
            text: `Welcome to Lost Paws! Your verification code is: ${code}. This code expires in 15 minutes.`,
            html: `
                <div style="font-family: 'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #e0e0e0; border-radius: 12px; color: ${TEXT_GREY}; line-height: 1.6; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: ${BRAND_NAVY};">
                            <span style="color: ${BRAND_NAVY};">Lost</span><span style="color: ${BRAND_YELLOW};">Paws</span>
                        </h1>
                    </div>
                    
                    <h2 style="color: ${BRAND_NAVY}; margin-top: 0; text-align: center; font-size: 24px;">Account Verification</h2>
                    <p style="text-align: center; font-size: 16px;">Thank you for joining our community. To ensure the security of your account, please use the following verification code:</p>
                    
                    <div style="text-align: center; margin: 40px 0;">
                        <span style="font-size: 36px; font-weight: 800; letter-spacing: 10px; color: ${BRAND_NAVY}; background: #F3F4F6; padding: 20px 40px; border-radius: 12px; display: inline-block; border: 2px dashed ${BRAND_YELLOW};">${code}</span>
                    </div>
                    
                    <p style="text-align: center; font-size: 14px;">This code is valid for <strong>15 minutes</strong>.</p>
                    
                    <div style="margin-top: 40px; border-top: 1px solid #F3F4F6; padding-top: 20px; text-align: center;">
                        <p style="font-size: 14px; font-weight: 600; margin-bottom: 5px;">The Lost Paws Team</p>
                        <p style="font-size: 11px; color: #A0AEC0;">&copy; 2026 Lost Paws. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        if (!API_KEY) throw new Error('SENDGRID_API_KEY is missing');
        
        await sgMail.send(msg);
        console.log('✅ [Email] Verification email sent successfully');
        return true;
    } catch (error: any) {
        console.error('❌ [Email] Failed to send email:', error.response?.body?.errors || error.message);
        return false;
    }
};

export const sendNotificationEmail = async (userEmail: string, subject: string, message: string) => {
    try {
        const msg = {
            to: userEmail,
            from: {
                email: FROM_EMAIL,
                name: "Lost Paws"
            },
            subject: subject,
            text: message,
            html: `
                <div style="font-family: 'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #e0e0e0; border-radius: 12px; color: ${TEXT_GREY}; line-height: 1.6; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: ${BRAND_NAVY};">
                            <span style="color: ${BRAND_NAVY};">Lost</span><span style="color: ${BRAND_YELLOW};">Paws</span>
                        </h1>
                    </div>

                    <h2 style="color: ${BRAND_NAVY}; margin-top: 0; font-size: 22px;">Notification</h2>
                    <p style="font-size: 16px;">${message}</p>
                    
                    <div style="margin-top: 40px; text-align: center;">
                        <a href="${process.env.FRONTEND_URL}" style="display: inline-block; padding: 14px 30px; background-color: ${BRAND_YELLOW}; color: ${BRAND_NAVY}; text-decoration: none; border-radius: 8px; font-weight: 800; font-size: 14px;">Go to Dashboard</a>
                    </div>
                    
                    <div style="margin-top: 40px; border-top: 1px solid #F3F4F6; padding-top: 20px; text-align: center;">
                        <p style="font-size: 11px; color: #A0AEC0;">&copy; 2026 Lost Paws.</p>
                    </div>
                </div>
            `
        };

        if (!API_KEY) return false;
        await sgMail.send(msg);
        return true;
    } catch (error: any) {
        console.error('❌ [Email] Notification error:', error.response?.body?.errors || error.message);
        return false;
    }
};

export const sendMatchAlertEmail = async (userEmail: string, petName: string, matchUrl: string) => {
    try {
        const msg = {
            to: userEmail,
            from: {
                email: FROM_EMAIL,
                name: "Lost Paws AI Alerts"
            },
            subject: `Match found for ${petName}!`,
            text: `We found a potential match for ${petName}. View details at: ${matchUrl}`,
            html: `
                <div style="font-family: 'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #e0e0e0; border-radius: 12px; color: ${TEXT_GREY}; line-height: 1.6; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: ${BRAND_NAVY};">
                            <span style="color: ${BRAND_NAVY};">Lost</span><span style="color: ${BRAND_YELLOW};">Paws</span>
                        </h1>
                    </div>

                    <h2 style="color: ${BRAND_NAVY}; margin-top: 0; font-size: 22px;">Great news!</h2>
                    <p style="font-size: 16px;">Our AI identified a match for <strong>${petName}</strong>.</p>
                    
                    <div style="margin: 40px 0; text-align: center;">
                        <a href="${matchUrl}" style="display: inline-block; padding: 14px 30px; background-color: ${BRAND_YELLOW}; color: ${BRAND_NAVY}; text-decoration: none; border-radius: 8px; font-weight: 800; font-size: 14px;">View Match Details</a>
                    </div>
                    
                    <div style="margin-top: 40px; border-top: 1px solid #F3F4F6; padding-top: 20px; text-align: center;">
                        <p style="font-size: 11px; color: #A0AEC0;">&copy; 2026 Lost Paws AI.</p>
                    </div>
                </div>
            `
        };

        if (!API_KEY) return false;
        await sgMail.send(msg);
        return true;
    } catch (error: any) {
        console.error('❌ [Email] Match alert error:', error.response?.body?.errors || error.message);
        return false;
    }
};

export const sendSupportEmail = async (senderEmail: string, senderName: string, subject: string, message: string) => {
    try {
        const msg = {
            to: FROM_EMAIL, // Send TO the site administrator
            from: {
                email: FROM_EMAIL, // Send FROM verified sender (SendGrid requirement)
                name: "Lost Paws Support Request"
            },
            replyTo: senderEmail, // Set reply-to as the person who filled the form
            subject: `[Support] ${subject}`,
            text: `From: ${senderName} (${senderEmail})\n\nMessage:\n${message}`,
            html: `
                <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: ${BRAND_NAVY}; border-bottom: 2px solid ${BRAND_YELLOW}; padding-bottom: 10px;">New Support Request</h2>
                    <p><strong>From:</strong> ${senderName} (<a href="mailto:${senderEmail}">${senderEmail}</a>)</p>
                    <p><strong>Subject:</strong> ${subject}</p>
                    <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin-top: 20px; white-space: pre-wrap;">
                        ${message}
                    </div>
                    <p style="font-size: 12px; color: #888; margin-top: 30px;">This message was sent via the Contact Us form on Lost Paws.</p>
                </div>
            `
        };

        if (!API_KEY) {
            console.error('❌ [Email] Cannot send support email: SENDGRID_API_KEY is missing');
            return false;
        }
        
        await sgMail.send(msg);
        console.log(`✅ [Email] Support email sent from ${senderEmail}`);
        return true;
    } catch (error: any) {
        console.error('❌ [Email] Support email error:', error.response?.body?.errors || error.message);
        return false;
    }
};

