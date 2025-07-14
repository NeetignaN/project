import { createTransport } from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

class EmailService {
  constructor() {
    this.transporter = createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendVerificationEmail(email, code) {
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Email Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 15px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Email Verification</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 15px; margin-top: -10px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; color: #333; margin-bottom: 25px;">
              Hello! Here's your verification code to complete your login:
            </p>
            <div style="background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 10px; padding: 25px; text-align: center; margin: 25px 0;">
              <h2 style="font-size: 36px; color: #3b82f6; margin: 0; letter-spacing: 8px; font-weight: bold;">
                ${code}
              </h2>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 25px;">
              This code will expire in 5 minutes. If you didn't request this code, please ignore this email.
            </p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true, message: "Email sent successfully" };
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }

  async sendWelcomeEmail(email, name) {
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Welcome to Interiora",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 15px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Interiora!</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 15px; margin-top: -10px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; color: #333; margin-bottom: 25px;">
              Hello ${name}! Welcome to the Interiora platform.
            </p>
            <p style="font-size: 14px; color: #666;">
              We're excited to have you on board. You can now access your dashboard and start exploring our services.
            </p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true, message: "Welcome email sent successfully" };
    } catch (error) {
      console.error("Error sending welcome email:", error);
      throw error;
    }
  }
}

export default new EmailService();
