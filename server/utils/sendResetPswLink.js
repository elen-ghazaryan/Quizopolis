import jwt from "jsonwebtoken";
import { transporter } from "../config/nodemailer.js"; 
import { env } from "../config/env.js"; 

export const sendResetPswLink = async (user) => {
  try {
    // Generate token
    const resetToken = jwt.sign(
      { sub: user._id },
      env.JWT_PASSWORD_SECRET,
      { expiresIn: "15m" }
    );

    // Verification link
    const resetLink = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Send email
    await transporter.sendMail({
      from: `"Quizopolis" <${env.APP_EMAIL}>`,
      to: user.email,
      subject: "Reset your password",
      html: `
        <h2>Hello, ${user.username}!</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" style="
          display:inline-block;
          background-color:#4CAF50;
          color:white;
          padding:10px 20px;
          text-decoration:none;
          border-radius:5px;
        ">Reset Password</a>
        <p>If you didn’t request this, you can ignore this message.</p>
      `,
    });

    console.log(`Password reset email sent to ${user.email}`);
  } catch (err) {
    console.error("Error sending password reset email:", err);
    throw new Error("Failed to send reset password email");
  }
};
