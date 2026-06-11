import nodemailer from "nodemailer";
import { env } from "../config/env.js";

let transporter;
let missingConfigWarningShown = false;

const hasMailConfig = () =>
  env.mailEnabled &&
  env.mailHost &&
  env.mailPort &&
  env.mailUser &&
  env.mailPassword &&
  env.mailFromAddress;

const getTransporter = () => {
  if (!hasMailConfig()) {
    if (!missingConfigWarningShown && env.mailEnabled) {
      console.warn("[mail] El envio por correo esta activado, pero faltan datos SMTP en el archivo .env.");
      missingConfigWarningShown = true;
    }

    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.mailHost,
      port: env.mailPort,
      secure: env.mailSecure,
      auth: {
        user: env.mailUser,
        pass: env.mailPassword,
      },
    });
  }

  return transporter;
};

const formatDueDate = (value) => {
  if (!value) return "Sin fecha limite";

  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

export const sendTaskCompletedEmail = async ({ user, task }) => {
  if (!env.mailEnabled) {
    return { sent: false, reason: "disabled" };
  }

  if (!user?.email) {
    return { sent: false, reason: "missing-recipient" };
  }

  const activeTransporter = getTransporter();
  if (!activeTransporter) {
    return { sent: false, reason: "missing-config" };
  }

  const taskTitle = escapeHtml(task.title);
  const projectTitle = escapeHtml(task.project?.title ?? "Sin proyecto");
  const dueDate = formatDueDate(task.dueDate);
  const recipientName = escapeHtml(user.name ?? "Usuario");

  const text = [
    `Hola, ${user.name ?? "usuario"}.`,
    "",
    `La tarea "${task.title}" fue marcada como completada en NovaTask.`,
    `Proyecto: ${task.project?.title ?? "Sin proyecto"}`,
    `Fecha limite: ${dueDate}`,
    "",
    "Sigue asi. Tu avance ya fue registrado en la plataforma.",
  ].join("\n");

  const html = `
    <div style="background:#0f172a;padding:32px 16px;font-family:Segoe UI,Tahoma,sans-serif;color:#f8fafc;">
      <div style="max-width:640px;margin:0 auto;background:linear-gradient(180deg,rgba(30,41,59,0.96),rgba(15,23,42,0.96));border:1px solid rgba(99,102,241,0.24);border-radius:24px;overflow:hidden;">
        <div style="padding:28px 28px 22px;background:radial-gradient(circle at top left,rgba(99,102,241,0.28),transparent 36%),radial-gradient(circle at bottom right,rgba(139,92,246,0.18),transparent 30%);">
          <div style="display:inline-block;padding:8px 14px;border-radius:999px;background:rgba(99,102,241,0.16);border:1px solid rgba(99,102,241,0.28);font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#c7d2fe;">
            NovaTask
          </div>
          <h1 style="margin:18px 0 0;font-size:30px;line-height:1.15;">Tarea completada</h1>
          <p style="margin:14px 0 0;font-size:15px;line-height:1.8;color:#cbd5e1;">
            Hola, ${recipientName}. Registramos un nuevo avance en tu espacio de trabajo.
          </p>
        </div>

        <div style="padding:0 28px 28px;">
          <div style="border:1px solid rgba(51,65,85,0.9);background:rgba(15,23,42,0.68);border-radius:22px;padding:22px;">
            <p style="margin:0;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#94a3b8;">Tarea</p>
            <p style="margin:10px 0 0;font-size:26px;font-weight:700;color:#f8fafc;">${taskTitle}</p>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-top:18px;">
              <div style="border:1px solid rgba(51,65,85,0.8);border-radius:18px;padding:16px;background:rgba(30,41,59,0.72);">
                <p style="margin:0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#94a3b8;">Proyecto</p>
                <p style="margin:10px 0 0;font-size:16px;font-weight:600;color:#f8fafc;">${projectTitle}</p>
              </div>
              <div style="border:1px solid rgba(51,65,85,0.8);border-radius:18px;padding:16px;background:rgba(30,41,59,0.72);">
                <p style="margin:0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#94a3b8;">Fecha limite</p>
                <p style="margin:10px 0 0;font-size:16px;font-weight:600;color:#f8fafc;">${escapeHtml(dueDate)}</p>
              </div>
            </div>
          </div>

          <p style="margin:20px 0 0;font-size:14px;line-height:1.8;color:#94a3b8;">
            Sigue asi. Tu avance ya fue registrado en NovaTask y podras verlo reflejado en el tablero, calendario y analiticas.
          </p>
        </div>
      </div>
    </div>
  `;

  await activeTransporter.sendMail({
    from: `"${env.mailFromName}" <${env.mailFromAddress}>`,
    to: user.email,
    subject: `NovaTask | Completaste: ${task.title}`,
    text,
    html,
  });

  return { sent: true };
};
