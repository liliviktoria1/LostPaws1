import nodemailer from 'nodemailer';

const getTransporter = () => {
    // Gmail standard: port 587 with secure: false
    // Alternative: port 465 with secure: true
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '587');
    const isSecure = process.env.SMTP_SECURE === 'true' || port === 465;

    return nodemailer.createTransport({
        host: host,
        port: port,
        secure: isSecure,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        connectionTimeout: 15000, // 15 seconds
        greetingTimeout: 15000,
        socketTimeout: 15000,
        debug: process.env.NODE_ENV !== 'production', // true in dev
        logger: process.env.NODE_ENV !== 'production', // true in dev
    });
};

const BRAND_NAVY = '#1B2132';
const BRAND_YELLOW = '#FFCB58';
const TEXT_GREY = '#41495A';

export const sendVerificationEmail = async (userEmail: string, code: string) => {
    try {
        console.log(`[SMTP] Attempting to send verification email to: ${userEmail}`);
        const transporter = getTransporter();
        const mailOptions = {
            from: `"Lost Paws Support" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: 'Action Required: Verify Your Account',
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
                    
                    <p style="text-align: center; font-size: 14px;">This code is valid for <strong>15 minutes</strong>. If you did not create an account with Lost Paws, please ignore this email.</p>
                    
                    <div style="margin-top: 40px; border-top: 1px solid #F3F4F6; padding-top: 20px; text-align: center;">
                        <p style="font-size: 14px; font-weight: 600; margin-bottom: 5px;">The Lost Paws Team</p>
                        <p style="font-size: 11px; color: #A0AEC0;">&copy; 2026 Lost Paws. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ [SMTP] Verification email sent: %s', info.messageId);
        return true;
    } catch (error: any) {
        console.error('❌ [SMTP] Failed to send verification email:');
        console.error('Error Details:', {
            message: error.message,
            code: error.code,
            command: error.command,
            response: error.response,
            stack: error.stack
        });
        return false;
    }
};

export const sendNotificationEmail = async (userEmail: string, subject: string, message: string) => {
    try {
        console.log(`[SMTP] Attempting to send notification to: ${userEmail}`);
        const transporter = getTransporter();
        const mailOptions = {
            from: `"Lost Paws System" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: subject,
            html: `
                <div style="font-family: 'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #e0e0e0; border-radius: 12px; color: ${TEXT_GREY}; line-height: 1.6; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: ${BRAND_NAVY};">
                            <span style="color: ${BRAND_NAVY};">Lost</span><span style="color: ${BRAND_YELLOW};">Paws</span>
                        </h1>
                    </div>

                    <h2 style="color: ${BRAND_NAVY}; margin-top: 0; font-size: 22px;">System Notification</h2>
                    <p style="font-size: 16px;">${message}</p>
                    
                    <div style="margin-top: 40px; text-align: center;">
                        <a href="${process.env.FRONTEND_URL}" style="display: inline-block; padding: 14px 30px; background-color: ${BRAND_YELLOW}; color: ${BRAND_NAVY}; text-decoration: none; border-radius: 8px; font-weight: 800; font-size: 14px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Go to Dashboard</a>
                    </div>
                    
                    <div style="margin-top: 40px; border-top: 1px solid #F3F4F6; padding-top: 20px; text-align: center;">
                        <p style="font-size: 11px; color: #A0AEC0;">&copy; 2026 Lost Paws. Helping pets find their way home.</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ [SMTP] Notification email sent: %s', info.messageId);
        return true;
    } catch (error: any) {
        console.error('❌ [SMTP] Failed to send notification email:', error.message);
        return false;
    }
};

export const sendMatchAlertEmail = async (userEmail: string, petName: string, matchUrl: string) => {
    try {
        console.log(`[SMTP] Attempting to send match alert for ${petName} to: ${userEmail}`);
        const transporter = getTransporter();
        const mailOptions = {
            from: `"Lost Paws AI Alerts" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `We found a potential match for ${petName}!`,
            html: `
                <div style="font-family: 'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #e0e0e0; border-radius: 12px; color: ${TEXT_GREY}; line-height: 1.6; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: ${BRAND_NAVY};">
                            <span style="color: ${BRAND_NAVY};">Lost</span><span style="color: ${BRAND_YELLOW};">Paws</span>
                        </h1>
                    </div>

                    <h2 style="color: ${BRAND_NAVY}; margin-top: 0; font-size: 22px;">Great news!</h2>
                    <p style="font-size: 16px;">Our AI has identified a high-confidence match for your pet, <strong>${petName}</strong>.</p>
                    <p style="font-size: 16px;">Please review the details immediately to confirm if this is your pet:</p>
                    
                    <div style="margin: 40px 0; text-align: center;">
                        <a href="${matchUrl}" style="display: inline-block; padding: 14px 30px; background-color: ${BRAND_YELLOW}; color: ${BRAND_NAVY}; text-decoration: none; border-radius: 8px; font-weight: 800; font-size: 14px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">View Match Details</a>
                    </div>
                    
                    <p style="font-size: 14px; color: ${TEXT_GREY};">We're rooting for a happy reunion!</p>
                    
                    <div style="margin-top: 40px; border-top: 1px solid #F3F4F6; padding-top: 20px; text-align: center;">
                        <p style="font-size: 11px; color: #A0AEC0;">&copy; 2026 Lost Paws AI-Powered Matching Service.</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ [SMTP] Match alert email sent: %s', info.messageId);
        return true;
    } catch (error: any) {
        console.error('❌ [SMTP] Failed to send match alert email:', error.message);
        return false;
    }
};
