import emailService from "../services/emailService.js";
import otpService from "../services/otpService.js";

class OTPController {
  async sendOTP(req, res) {
    try {
      const { email } = req.body;

      if (!email || !email.includes("@")) {
        return res.status(400).json({
          error: "Valid email is required",
        });
      }

      const verificationCode = otpService.generateCode();
      const sessionId = otpService.generateSession();

      // Store verification code
      otpService.storeCode(sessionId, email, verificationCode);

      // Send email
      await emailService.sendVerificationEmail(email, verificationCode);

      res.json({
        success: true,
        message: "Verification code sent successfully",
        sessionId,
      });
    } catch (error) {
      console.error("Error sending OTP:", error);
      res.status(500).json({
        error: "Failed to send verification email",
      });
    }
  }

  async verifyOTP(req, res) {
    try {
      const { sessionId, code } = req.body;

      if (!sessionId || !code) {
        return res.status(400).json({
          error: "Session ID and code are required",
        });
      }

      const result = otpService.verifyCode(sessionId, code);

      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json(result);
    } catch (error) {
      console.error("Error verifying OTP:", error);
      res.status(500).json({
        error: "Failed to verify code",
      });
    }
  }
}

export default new OTPController();
