import nodemailer from 'nodemailer';
const getTransporter = () => {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '587');
    const isSecure = process.env.SMTP_SECURE === 'true' || port === 465;

    console.log(`[SMTP] Connecting to ${host}:${port} (secure: ${isSecure})`);

    return nodemailer.createTransport({
        host: host,
        port: port,
        secure: isSecure,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        connectionTimeout: 20000, // 20 seconds
        greetingTimeout: 20000,
        socketTimeout: 20000,
        family: 4
    } as any);
};

const BRAND_NAVY = '#1B2132';
const BRAND_YELLOW = '#FFCB58';
const TEXT_GREY = '#41495A';

export const sendVerificationEmail = async (userEmail: string, code: string) => {
    try {
        console.log(`[SMTP] Sending verification email to: ${userEmail}`);
        const transporter = getTransporter();
        const mailOptions = {
            from: `"Lost Paws" <${process.env.EMAIL_USER}>`,
            to: userEmail,
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
                        <p style="font-size: 11px; color: #A0AEC0;">&copy; 2026 Lost Paws. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ [SMTP] Email sent: %s', info.messageId);
        return true;
    } catch (error: any) {
        console.error('❌ [SMTP] Failed to send email:', error.message);
        return false;
    }
};

export const sendNotificationEmail = async (userEmail: string, subject: string, message: string) => {
    try {
        const transporter = getTransporter();
        const mailOptions = {
            from: `"Lost Paws" <${process.env.EMAIL_USER}>`,
            to: userEmail,
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

        const info = await transporter.sendMail(mailOptions);
        return true;
    } catch (error: any) {
        console.error('❌ [SMTP] Notification error:', error.message);
        return false;
    }
};

export const sendMatchAlertEmail = async (userEmail: string, petName: string, matchUrl: string) => {
    try {
        const transporter = getTransporter();
        const mailOptions = {
            from: `"Lost Paws" <${process.env.EMAIL_USER}>`,
            to: userEmail,
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

        const info = await transporter.sendMail(mailOptions);
        return true;
    } catch (error: any) {
        console.error('❌ [SMTP] Match alert error:', error.message);
        return false;
    }
};
