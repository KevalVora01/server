import nodemailer from "nodemailer";
import { IEmailService, SendEmailOptions } from "../../domain/services/IEmailService";
import { env } from "../../../../shared/config/env";

export class NodemailerEmailService implements IEmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for 587
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 4000,
      greetingTimeout: 4000,
      socketTimeout: 4000,
    });
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    // ── Dev convenience: print the email (and any links) to the terminal
    //    so reset/invite links can be copied without a real inbox. ──
    const links = (options.html ?? "").match(/href="([^"]+)"/g) ?? [];
    console.log("\n========== [EMAIL SENT] ==========");
    console.log("To:     ", options.to);
    console.log("Subject:", options.subject);
    if (links.length) {
      console.log("Links:");
      links.forEach((l) => console.log("  " + l.replace(/href="|"/g, "")));
    }
    console.log("---------------------------------\n");

    try {
      const sendPromise = this.transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'Society Management'}" <${process.env.SMTP_FROM_EMAIL || env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("SMTP Connection Timeout (4s limit reached)")), 4000)
      );

      await Promise.race([sendPromise, timeoutPromise]);
    } catch (err) {
      console.error("[EmailService] Failed to deliver email (SMTP error):", err);
    }
  }
}