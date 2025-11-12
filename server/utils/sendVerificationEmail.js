import jwt from "jsonwebtoken";
import { transporter } from "../config/nodemailer.js"; 
import { env } from "../config/env.js"; 

export const sendVerificationEmail = async (user) => {
  try {
    // Generate token
    const verificationToken = jwt.sign(
      { sub: user._id },
      env.JWT_EMAIL_SECRET,
      { expiresIn: "1h" }
    );

    // Verification link
    const verificationLink = `${env.FRONTEND_URL}/verify?token=${verificationToken}`;

    // Send email
    await transporter.sendMail({
      from: `"Quizopolis" <${env.APP_EMAIL}>`,
      to: user.email,
      subject: "Confirm your email",
      html: `
        <h2>Hello, ${user.username}!</h2>
        <p>Click the link below to confirm your email:</p>
        <a href="${verificationLink}" style="
          display:inline-block;
          background-color:#4CAF50;
          color:white;
          padding:10px 20px;
          text-decoration:none;
          border-radius:5px;
        ">Confirm Email</a>
        <p>If you didn’t request this, you can ignore this message.</p>
      `,
    });

    console.log(`Verification email sent to ${user.email}`);
  } catch (err) {
    console.error("Error sending verification email:", err);
    throw new Error("Failed to send verification email");
  }
};
