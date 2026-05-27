import nodemailer from "nodemailer";
import { Resend } from "resend";

let smtpTransporter: nodemailer.Transporter | null = null;
function getSmtpTransporter() {
  if (smtpTransporter) return smtpTransporter;
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || port === 465;
  
  if (!host || !user || !pass) {
    throw new Error('SMTP not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS');
  }
  
  smtpTransporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
  return smtpTransporter;
}

let resend: Resend | null = null;
function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is not set');
  if (!resend) resend = new Resend(apiKey);
  return resend;
}

export async function sendEmail({ from, to, subject, text, html }: { from: string; to: string[]; subject: string; text: string; html: string }) {
  const provider = (process.env.EMAIL_PROVIDER || '').toLowerCase();
  
  if (provider === 'smtp' || process.env.SMTP_HOST) {
    const transporter = getSmtpTransporter();
    const info = await transporter.sendMail({ from, to: to.join(','), subject, text, html });
    return { data: { id: info.messageId } };
  }

  const r = await getResend().emails.send({ from, to, subject, text, html });
  return r;
}
