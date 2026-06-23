import { Resend } from "resend";
import { IEmailService, SendEmailOptions } from "../../domain/services/IEmailService";
import { env } from "../../../../shared/config/env";

export class ResendEmailService implements IEmailService {
  private resend: Resend;
  private fromEmail: string;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.fromEmail = env.RESEND_FROM_EMAIL ?? "noreply@civichorizon.com";
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: this.fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}