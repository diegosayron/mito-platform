-- Create notification_logs table
CREATE TABLE IF NOT EXISTS notification_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL,
  channel VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  payload JSONB NOT NULL,
  error TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  sent_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL UNIQUE,
  subject VARCHAR(500) NOT NULL,
  html_body TEXT NOT NULL,
  text_body TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create push_templates table
CREATE TABLE IF NOT EXISTS push_templates (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_type ON notification_logs(type);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs(created_at);

-- Insert default email templates
INSERT INTO email_templates (type, subject, html_body, text_body) VALUES
('welcome', 'Bem-vindo ao MITO!', 
  '<h1>Bem-vindo, {{userName}}!</h1><p>Obrigado por se juntar ao MITO. Estamos felizes em tê-lo conosco!</p>',
  'Bem-vindo, {{userName}}! Obrigado por se juntar ao MITO. Estamos felizes em tê-lo conosco!'),
  
('subscription_expiring', 'Sua assinatura está próxima do vencimento', 
  '<h1>Olá, {{userName}}!</h1><p>Sua assinatura vence em {{daysLeft}} dias. Renove agora para continuar aproveitando todos os benefícios.</p>',
  'Olá, {{userName}}! Sua assinatura vence em {{daysLeft}} dias. Renove agora para continuar aproveitando todos os benefícios.'),
  
('subscription_expired', 'Sua assinatura expirou', 
  '<h1>Olá, {{userName}}!</h1><p>Sua assinatura expirou em {{expiredDate}}. Renove agora para recuperar o acesso total.</p>',
  'Olá, {{userName}}! Sua assinatura expirou em {{expiredDate}}. Renove agora para recuperar o acesso total.'),
  
('renewal_confirmed', 'Renovação confirmada!', 
  '<h1>Olá, {{userName}}!</h1><p>Sua assinatura foi renovada com sucesso até {{newExpiryDate}}. Obrigado!</p>',
  'Olá, {{userName}}! Sua assinatura foi renovada com sucesso até {{newExpiryDate}}. Obrigado!'),
  
('report_received', 'Denúncia recebida', 
  '<h1>Olá, {{userName}}!</h1><p>Recebemos sua denúncia e estamos analisando. ID: {{reportId}}</p>',
  'Olá, {{userName}}! Recebemos sua denúncia e estamos analisando. ID: {{reportId}}'),
  
('report_resolved', 'Denúncia resolvida', 
  '<h1>Olá, {{userName}}!</h1><p>Sua denúncia (ID: {{reportId}}) foi analisada e resolvida. Status: {{resolution}}</p>',
  'Olá, {{userName}}! Sua denúncia (ID: {{reportId}}) foi analisada e resolvida. Status: {{resolution}}'),
  
('account_closed', 'Conta encerrada', 
  '<h1>Olá, {{userName}}!</h1><p>Sua conta foi encerrada conforme solicitado. Sentiremos sua falta!</p>',
  'Olá, {{userName}}! Sua conta foi encerrada conforme solicitado. Sentiremos sua falta!'),
  
('campaign', '{{subject}}', 
  '<div>{{content}}</div>',
  '{{content}}')
ON CONFLICT (type) DO NOTHING;

-- Insert default push templates
INSERT INTO push_templates (type, title, body) VALUES
('welcome', 'Bem-vindo ao MITO!', 'Obrigado por se juntar a nós, {{userName}}!'),
('subscription_expiring', 'Assinatura vencendo', 'Sua assinatura vence em {{daysLeft}} dias'),
('subscription_expired', 'Assinatura expirada', 'Renove sua assinatura para continuar aproveitando'),
('renewal_confirmed', 'Renovação confirmada!', 'Assinatura renovada até {{newExpiryDate}}'),
('report_received', 'Denúncia recebida', 'Recebemos sua denúncia e estamos analisando'),
('report_resolved', 'Denúncia resolvida', 'Sua denúncia foi resolvida'),
('account_closed', 'Conta encerrada', 'Sua conta foi encerrada conforme solicitado'),
('campaign', '{{title}}', '{{message}}')
ON CONFLICT (type) DO NOTHING;
