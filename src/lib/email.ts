import nodemailer from 'nodemailer';

// Configure email transporter
const getTransporter = async () => {
  // For development, use Ethereal (free email testing service)
  if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  // For production, use real SMTP credentials
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

interface SendResetEmailParams {
  email: string;
  resetUrl: string;
  userName?: string;
}

export async function sendResetPasswordEmail({
  email,
  resetUrl,
  userName = 'Utilizador',
}: SendResetEmailParams) {
  try {
    const transporter = await getTransporter();

    const resetUrlShort = resetUrl.replace(/^https?:\/\//, '');

    const emailHtml = `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background: #f9fafb;
      border-radius: 8px;
      padding: 40px;
      border: 1px solid #e5e7eb;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #0f766e;
      margin-bottom: 10px;
    }
    .content {
      margin-bottom: 30px;
    }
    .content h2 {
      color: #1f2937;
      margin-top: 0;
    }
    .content p {
      margin: 15px 0;
    }
    .reset-button {
      display: inline-block;
      background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%);
      color: white !important;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 30px 0;
      text-align: center;
    }
    .reset-button:hover {
      background: linear-gradient(135deg, #115e59 0%, #0d9488 100%);
    }
    .alt-link {
      background: #fff;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      padding: 15px;
      margin: 20px 0;
      word-break: break-all;
      font-size: 12px;
      color: #6b7280;
      font-family: 'Monaco', 'Courier New', monospace;
    }
    .footer {
      border-top: 1px solid #e5e7eb;
      padding-top: 20px;
      font-size: 12px;
      color: #6b7280;
      text-align: center;
    }
    .warning {
      background: #fef3c7;
      border-left: 4px solid #fbbf24;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
      font-size: 13px;
      color: #92400e;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🐕 Pawlyx</div>
      <p style="color: #6b7280; margin: 5px 0;">Repor sua palavra-passe</p>
    </div>

    <div class="content">
      <h2>Olá ${userName},</h2>
      
      <p>Recebemos um pedido para repor a sua palavra-passe. Clique no botão abaixo para criar uma nova palavra-passe:</p>
      
      <center>
        <a href="${resetUrl}" class="reset-button">Repor Palavra-passe</a>
      </center>

      <p>Ou copie e cole este link no seu navegador:</p>
      <div class="alt-link">${resetUrl}</div>

      <div class="warning">
        ⏰ Este link expira em <strong>24 horas</strong>. Se não solicitou esta ação, ignore este email.
      </div>

      <p style="margin-top: 30px; color: #6b7280; font-size: 13px;">
        Por razões de segurança, nunca compartilhe este link com ninguém.
      </p>
    </div>

    <div class="footer">
      <p>© 2026 Pawlyx - Salão de Tosa Digital</p>
      <p>Se tem dúvidas, contate-nos em suporte@pawlyx.pt</p>
    </div>
  </div>
</body>
</html>
    `;

    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@pawlyx.pt',
      to: email,
      subject: '🔐 Repor sua palavra-passe - Pawlyx',
      html: emailHtml,
      text: `
Olá ${userName},

Recebemos um pedido para repor a sua palavra-passe.

Acesse este link para criar uma nova palavra-passe:
${resetUrl}

Este link expira em 24 horas.

Se não solicitou esta ação, ignore este email.

© 2026 Pawlyx
      `.trim(),
    });

    // Log test email URL for development
    if (process.env.NODE_ENV === 'development') {
      const testUrl = nodemailer.getTestMessageUrl(result);
      if (testUrl) {
        console.log('📧 Email enviado! URL de pré-visualização:', testUrl);
      }
    }

    return result;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw error;
  }
}

export async function sendTestEmail(email: string) {
  try {
    const transporter = await getTransporter();

    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@pawlyx.pt',
      to: email,
      subject: '✓ Email de Teste - Pawlyx',
      html: '<h1>Email de Teste</h1><p>Se recebeu este email, o sistema de notificações está funcionando!</p>',
    });

    if (process.env.NODE_ENV === 'development') {
      const testUrl = nodemailer.getTestMessageUrl(result);
      if (testUrl) {
        console.log('📧 Email de teste enviado! URL:', testUrl);
      }
    }

    return result;
  } catch (error) {
    console.error('Erro ao enviar email de teste:', error);
    throw error;
  }
}
