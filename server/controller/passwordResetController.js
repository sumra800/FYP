import User from "../model/userModel.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Please provide an email address" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // For security, don't reveal that the user doesn't exist
      return res.status(200).json({ success: true, message: "If an account exists with that email, a reset link has been sent." });
    }

    // Generate Token
    const resetToken = crypto.randomBytes(20).toString("hex");
    
    // Save token and expiry (1 hour)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    // Create Reset URL (Pointing to the frontend)
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    // Send Email (Dummy config for now)
    console.log("-----------------------------------------");
    console.log(`RESET LINK FOR ${email}: ${resetUrl}`);
    console.log("-----------------------------------------");

    // Attempt to send actual email if credentials exist
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'Password Reset Request - Study Buddy',
                text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
                    `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
                    `${resetUrl}\n\n` +
                    `If you did not request this, please ignore this email and your password will remain unchanged.\n`
            };

            await transporter.sendMail(mailOptions);
            console.log(`Email sent to ${user.email}`);
        } catch (mailErr) {
            console.error("Mail Sending Error:", mailErr);
            // We don't fail the request here, as the token is already in DB and link is in console
        }
    }

    res.status(200).json({ success: true, message: "If an account exists with that email, a reset link has been sent." });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: "Please provide a new password" });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Password reset token is invalid or has expired." });
    }

    // Update password (hashing is handled by the model's pre-save hook)
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    
    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully! You can now log in." });

  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
