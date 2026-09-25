import * as nodemailer from "nodemailer";
import { logger } from "./logger.js";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    logger.info(`[MAILER DIAGNOSTICS] BREVO_SMTP_HOST defined: ${!!process.env.BREVO_SMTP_HOST}`);
    logger.info(`[MAILER DIAGNOSTICS] BREVO_SMTP_PORT defined: ${!!process.env.BREVO_SMTP_PORT}`);
    logger.info(`[MAILER DIAGNOSTICS] BREVO_SMTP_USER defined: ${!!process.env.BREVO_SMTP_USER}`);
    logger.info(`[MAILER DIAGNOSTICS] BREVO_SMTP_KEY defined: ${!!process.env.BREVO_SMTP_KEY}`);
    
    if (!process.env.BREVO_SMTP_HOST || !process.env.BREVO_SMTP_USER || !process.env.BREVO_SMTP_KEY) {
      throw new Error("Missing required Brevo SMTP environment variables (BREVO_SMTP_HOST, BREVO_SMTP_USER, BREVO_SMTP_KEY)");
    }

    transporter = nodemailer.createTransport({
      host: process.env.BREVO_SMTP_HOST,
      port: parseInt(process.env.BREVO_SMTP_PORT || "587", 10),
      secure: false,
      pool: true,
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_KEY,
      },
    });
  }
  return transporter;
}

export async function sendOTPEmail(to: string, otp: string, purpose: "verification" | "reset") {
  const subject = purpose === "verification" 
    ? "MindCare - Verify Your Email"
    : "MindCare - Password Reset Code";
    
  const text = purpose === "verification"
    ? `Welcome to MindCare! Your email verification code is: ${otp}\n\nThis code expires in 10 minutes.`
    : `You requested a password reset. Your OTP is: ${otp}\n\nThis code expires in 10 minutes.`;

  try {
    const mailTransporter = getTransporter();
    await mailTransporter.sendMail({
      from: `"MindCare" <${process.env.MAIL_FROM_ADDRESS || "noreply@mindcare"}>`,
      to,
      subject,
      text,
    });
    
    logger.info(`OTP sent to ${to} for ${purpose}`);
  } catch (error) {
    logger.error("Error sending OTP email:", error);
    throw new Error("Failed to send email");
  }
}

export async function sendAssessmentEmail(to: string, pdfBase64: string) {
  try {
    const mailTransporter = getTransporter();
    // Handle standard data URIs and jsPDF data URIs containing ;filename=
    const base64Data = pdfBase64.includes("base64,") ? pdfBase64.split("base64,")[1] : pdfBase64;

    await mailTransporter.sendMail({
      from: `"MindCare" <${process.env.MAIL_FROM_ADDRESS || "noreply@mindcare"}>`,
      to,
      subject: "Your MindCare Assessment Results",
      html: `
        <div style="font-family: sans-serif; p-6">
          <h2 style="color: #0f172a">Your Assessment Results</h2>
          <p>Thank you for completing your MindCare screening. We have attached a detailed PDF report of your results to this email.</p>
          <p>If you have any questions, please consult with your healthcare provider.</p>
        </div>
      `,
      attachments: [
        {
          filename: 'mindcare-assessment.pdf',
          content: base64Data,
          encoding: 'base64'
        }
      ]
    });
    logger.info(`Assessment PDF sent to ${to}`);
  } catch (error) {
    logger.error("Error sending assessment email:", error);
    throw new Error("Failed to send email");
  }
}
