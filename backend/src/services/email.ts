import nodemailer from 'nodemailer';

// Configure transport using environment variables or fallbacks
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email', // Fallback to Mailtrap for testing
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: {
        user: process.env.SMTP_USER || 'test_user',
        pass: process.env.SMTP_PASS || 'test_pass'
    }
});

export const sendMatchAlertEmail = async (userEmail: string, petName: string, matchUrl: string) => {
    try {
        const mailOptions = {
            from: '"Lost Paws Alerts" <alerts@lostpaws.com>',
            to: userEmail,
            subject: `We found a potential match for ${petName}!`,
            html: `
                <h2>Great news from Lost Paws!</h2>
                <p>Our AI has discovered a high-confidence match for your pet, <strong>${petName}</strong>.</p>
                <p>Please review the match immediately to confirm:</p>
                <a href="${matchUrl}" style="display: inline-block; padding: 10px 20px; background-color: #FAC655; color: #181A32; text-decoration: none; border-radius: 5px; font-weight: bold;">View Match Details</a>
                <p>Thank you for using Lost Paws.</p>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Match alert email sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Failed to send match alert email:', error);
        return false;
    }
};
