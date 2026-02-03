import nodemailer, { Transporter } from 'nodemailer';
import { Config } from '../config';

export class EmailService {
  private transporter: Transporter;
  private config: Config;

  constructor(config: Config) {
    this.config = config;
    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string, text: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.config.smtp.from,
        to,
        subject,
        html,
        text,
      });
    } catch (error) {
      throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('SMTP connection verification failed:', error);
      return false;
    }
  }
}
