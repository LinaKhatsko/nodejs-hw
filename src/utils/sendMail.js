import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import handlebars from 'handlebars';
import createHttpError from 'http-errors';

// Утиліта для відправки пошти
export const sendEmail = async (to, subject, templateName, context) => {
  console.log('📧 sendEmail called with:', { to, subject, templateName });

  // Створюємо "транспортер" тут, коли .env вже точно завантажений
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // Логуємо конфігурацію для перевірки
  console.log('🔧 Transporter config:', {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
  });

  // 1. Читаємо HTML шаблон
  const templatePath = path.resolve('src', 'templates', `${templateName}.html`);
  console.log('📄 Template path:', templatePath);

  let templateSource;
  try {
    templateSource = await fs.readFile(templatePath, 'utf-8');
    console.log('✅ Template loaded successfully');
  } catch (err) {
    console.error('❌ Failed to read email template:', err);
    throw createHttpError(
      500,
      'Failed to read email template, please try again later.',
    );
  }

  // 2. Компілюємо шаблон
  const template = handlebars.compile(templateSource);
  const html = template(context);
  console.log('✅ Template compiled');

  // 3. Формуємо лист
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
  };
  console.log('📬 Mail options:', {
    from: mailOptions.from,
    to: mailOptions.to,
    subject: mailOptions.subject,
  });

  // 4. Відправляємо лист
  try {
    console.log('📤 Sending email via SMTP...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    console.log('📊 Response:', info.response);
  } catch (err) {
    console.error('❌ Nodemailer transport error:', err);
    console.error('Error details:', {
      code: err.code,
      command: err.command,
      response: err.response,
      responseCode: err.responseCode,
    });

    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }
};
