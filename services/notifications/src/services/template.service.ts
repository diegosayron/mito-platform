import { query } from '../database';
import { EmailTemplate, PushTemplate, NotificationType } from '../types';

export class TemplateService {
  async getEmailTemplate(type: NotificationType): Promise<EmailTemplate | null> {
    const rows = await query<EmailTemplate>(
      'SELECT id, type, subject, html_body as "htmlBody", text_body as "textBody", created_at as "createdAt", updated_at as "updatedAt" FROM email_templates WHERE type = $1',
      [type]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  async getPushTemplate(type: NotificationType): Promise<PushTemplate | null> {
    const rows = await query<PushTemplate>(
      'SELECT id, type, title, body, created_at as "createdAt", updated_at as "updatedAt" FROM push_templates WHERE type = $1',
      [type]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  async getAllEmailTemplates(): Promise<EmailTemplate[]> {
    return query<EmailTemplate>(
      'SELECT id, type, subject, html_body as "htmlBody", text_body as "textBody", created_at as "createdAt", updated_at as "updatedAt" FROM email_templates ORDER BY type'
    );
  }

  async getAllPushTemplates(): Promise<PushTemplate[]> {
    return query<PushTemplate>(
      'SELECT id, type, title, body, created_at as "createdAt", updated_at as "updatedAt" FROM push_templates ORDER BY type'
    );
  }

  async updateEmailTemplate(id: number, subject: string, htmlBody: string, textBody: string): Promise<void> {
    await query(
      'UPDATE email_templates SET subject = $1, html_body = $2, text_body = $3, updated_at = NOW() WHERE id = $4',
      [subject, htmlBody, textBody, id]
    );
  }

  async updatePushTemplate(id: number, title: string, body: string): Promise<void> {
    await query(
      'UPDATE push_templates SET title = $1, body = $2, updated_at = NOW() WHERE id = $3',
      [title, body, id]
    );
  }

  renderTemplate(template: string, variables: Record<string, string | number>): string {
    let rendered = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, String(value));
    }
    return rendered;
  }
}
