import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({ to, subject, html }) => {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "SmartLearn <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    console.log("📩 Email sent successfully");
  } catch (error) {
    console.error("❌ Resend Email Error:", error);
    throw new Error("Email sending failed");
  }
};
