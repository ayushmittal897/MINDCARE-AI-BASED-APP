import { logger } from "./logger.js";

// Uses Brevo HTTP API instead of SMTP to bypass Render port blocks
async function sendBrevoEmail(to: string, subject: string, htmlContent: string, textContent?: string, attachment?: { name: string, content: string }) {
  const apiKey = process.env.BREVO_SMTP_KEY;
  if (!apiKey) {
    throw new Error("Missing BREVO_SMTP_KEY environment variable");
  }

  const payload: any = {
    sender: { name: "MindCare", email: process.env.MAIL_FROM_ADDRESS || "noreply@mindcare" },
    to: [{ email: to }],
    subject: subject,
    htmlContent: htmlContent || textContent,
  };
  
  if (textContent) {
      payload.textContent = textContent;
  }

  if (attachment) {
    payload.attachment = [{
      name: attachment.name,
      content: attachment.content
    }];
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api-key": apiKey,
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    logger.error(`Brevo API Error: ${response.status} ${errText}`);
    throw new Error(`Brevo API returned ${response.status}`);
  }
}

export async function sendOTPEmail(to: string, otp: string, purpose: "verification" | "reset") {
  const subject = purpose === "verification" 
    ? "MindCare - Verify Your Email"
    : "MindCare - Password Reset Code";
    
  const text = purpose === "verification"
    ? `Welcome to MindCare! Your email verification code is: ${otp}\n\nThis code expires in 10 minutes.`
    : `You requested a password reset. Your OTP is: ${otp}\n\nThis code expires in 10 minutes.`;

  // Always log the OTP so we can test without checking email!
  logger.info(`=========================================`);
  logger.info(`TESTING OTP FOR ${to}: ${otp}`);
  logger.info(`=========================================`);

  try {
    await sendBrevoEmail(to, subject, text.replace(/\n/g, "<br>"), text);
    logger.info(`OTP sent to ${to} for ${purpose}`);
  } catch (error) {
    logger.error("Error sending OTP email:", error);
    // Don't crash, let the user read the OTP from the logs!
  }
}

export async function sendAssessmentEmail(to: string, pdfBase64: string) {
  try {
    const base64Data = pdfBase64.includes("base64,") ? pdfBase64.split("base64,")[1] : pdfBase64;
    
    const html = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2 style="color: #0f172a">Your Assessment Results</h2>
        <p>Thank you for completing your MindCare screening. We have attached a detailed PDF report of your results to this email.</p>
        <p>If you have any questions, please consult with your healthcare provider.</p>
      </div>
    `;

    await sendBrevoEmail(to, "Your MindCare Assessment Results", html, undefined, {
      name: 'mindcare-assessment.pdf',
      content: base64Data
    });
    
    logger.info(`Assessment PDF sent to ${to}`);
  } catch (error) {
    logger.error("Error sending assessment email:", error);
  }
}
