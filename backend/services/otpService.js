import { v4 as uuidv4 } from "uuid";

class OTPService {
  constructor() {
    // In-memory storage for verification codes (in production, use Redis)
    this.verificationCodes = new Map();
  }

  generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  generateSession() {
    return uuidv4();
  }

  storeCode(sessionId, email, code, expirationMinutes = 5) {
    this.verificationCodes.set(sessionId, {
      email,
      code,
      expires: Date.now() + expirationMinutes * 60 * 1000,
    });
  }

  verifyCode(sessionId, code) {
    const verification = this.verificationCodes.get(sessionId);

    if (!verification) {
      return { success: false, error: "Invalid session or code expired" };
    }

    if (Date.now() > verification.expires) {
      this.verificationCodes.delete(sessionId);
      return { success: false, error: "Verification code has expired" };
    }

    if (verification.code !== code) {
      return { success: false, error: "Invalid verification code" };
    }

    // Clean up
    this.verificationCodes.delete(sessionId);

    return {
      success: true,
      message: "Email verified successfully",
      email: verification.email,
    };
  }

  cleanExpiredCodes() {
    const now = Date.now();
    for (const [sessionId, verification] of this.verificationCodes.entries()) {
      if (now > verification.expires) {
        this.verificationCodes.delete(sessionId);
      }
    }
  }
}

export default new OTPService();
