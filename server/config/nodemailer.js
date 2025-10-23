import nodemailer from "nodemailer"
import { env } from "./env.js"

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: env.APP_EMAIL,
    pass: env.EMAIL_PASS
  }
})

