import mongoose from "mongoose"
import { User } from "../models/user.model.js"
import jwt from "jsonwebtoken"
import { env } from "../config/env.js"
import bcrypt from "bcrypt"
import { sendVerificationEmail } from "../utils/sendVerificationEmail.js"
import { sendResetPswLink } from "../utils/sendResetPswLink.js"


class UserController {
  async signup (req, res) {
    if(!req.body) return res.status(400).send({ message: "Empty request body"})

    const { name, surname, username, email, password, role = 'user' } = req.body

    if(!name?.trim() ||!surname?.trim() || !username?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).send({ message: "All fields are required"})
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[#?!@$%^&*_.]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password must contain minimum eight characters, at least one upper case letter, one lower case letter, one number and one special character."
      });
    }

    try {
      const hashed = await bcrypt.hash(password, 10)
      const user = new User({ name, surname, username, email, password: hashed, role})
      await user.save()
      
      await sendVerificationEmail(user)
      res.status(201).send({ message: "You've signed up successfully. Now please verify your email to continue"})

    } catch(err) {
      if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
          message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
        });
      }

      if(err instanceof mongoose.Error.ValidationError) {
        const errorsArray = Object.values(err.errors).map(e => e.message)
        return res.status(400).send({ errors: errorsArray})
      } else {
        console.error(err)
        return res.status(500).send({ message: "Failed to signup" });
      }
    }
  }

  async login (req, res) {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if(!user) return res.status(401).send({ message: "User not found" })

    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch) return res.status(401).send({ message: 'Invalid credentials for user' })

    if(!user.isEmailVerified) return res.status(401).send({ message: "First please verify your email" })

    try {
      const token = jwt.sign(
        { sub: user._id },
        env.JWT_SECRET,
        { expiresIn: '7d'}
      )

      // Set JWT in cookie
      res.cookie("token", token, {
        httpOnly: true,      
        secure: true,        
        sameSite: "Strict",  
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.send({ message: "Login successful" })
    } catch(err) {
      res.status(500).send({ message: "Internal server error" })
    }
  }


  async verifyEmail (req, res) {
    const user = req.user;

    if(user.isEmailVerified) return res.send({ message: "Your email already verified"})

    user.isEmailVerified = true;
    await user.save()
    res.send({ message: "Email successfully verified" })
  }


  async resendVerification(req, res) {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).send({ message: "User not found" });

    if (user.isEmailVerified) {
      return res.json({ message: "Email already verified" });
    }

    await sendVerificationEmail(user);
    return res.json({ message: "Verification email resent" });
  }


  async getCurrentUser (req, res) {
    const {name, surname, email, username, role, isEmailVerified} = req.user
    return res.send({ message:"Ok", payload: {name, surname, email, username, isEmailVerified, role } })
  }


  async forgotPassword (req, res) {
    const { email } = req.body;
    const user = await User.findOne({email})

    if(!user) return res.send({ message: "If this email is registered, a reset link has been sent."})

    try {
      await sendResetPswLink(user)
      return res.send({ message: "A reset link has been sent"})
    } catch(err) {
      return res.send({ message: "Failed to send reset link to email" })
    }
  }


  async resetPassword(req, res) {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Please provide the reset token and your new password."
      });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_.]).{6,}$/;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message: "Password must contain at least one uppercase letter, one number, and one special character, and be at least 6 characters long."
      });
    }

    try {
      const { sub: id } = jwt.verify(token, env.JWT_PASSWORD_SECRET);

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      user.password = hashed;
      await user.save();

      return res.json({ message: "Password successfully reset" });
    } catch (err) {
      console.error(err)
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }
  }

  
  async updatePassword(req, res) {
    const user = req.user
    const { oldPassword, newPassword } = req.body || {}

    if(!oldPassword?.trim() || !newPassword?.trim()) {
      return res.status(400).send({ message: "Email, old password and new password are required!"})
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password)
    if(!isMatch) {
      return res.status(400).send( { message: "Wrong user credentials" })
    }

    const hashed = await bcrypt.hash(newPassword, 10)
    user.password = hashed
    await user.save()
    res.send({ message: "Password has been successfully changed" })

  }


  async logout(req, res) {
     res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict"
    });
    res.send({ message: "Logged out successfully" });
  }

}

export default new UserController()



