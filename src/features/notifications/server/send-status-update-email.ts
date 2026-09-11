import { Resend } from 'resend'
import type { ReportStatus } from '../../../contracts/reports'
import { getServerEnvironment } from '../../../lib/env/server'

interface StatusUpdateEmailInput {
  recipient: string
  trackingCode: string
  status: ReportStatus
  message: string
}

const statusLabels: Record<ReportStatus, string> = {
  RECEIVED: 'Recibida',
  UNDER_REVIEW: 'En revisión',
  CLASSIFIED: 'Clasificada',
  INSPECTION_PENDING: 'Inspección pendiente',
  INSPECTION_COMPLETED: 'Inspección completada',
  REPORT_PENDING: 'Informe pendiente',
  CLOSED: 'Cerrada',
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export async function sendStatusUpdateEmail(input: StatusUpdateEmailInput): Promise<boolean> {
  const apiKey = getServerEnvironment('RESEND_API_KEY')
  const from = getServerEnvironment('RESEND_FROM_EMAIL')
  const appUrl = getServerEnvironment('APP_URL')?.replace(/\/$/, '')

  if (!apiKey || !from || !appUrl) {
    return false
  }

  const statusLabel = statusLabels[input.status]
  const trackingUrl = `${appUrl}/seguimiento?trackingCode=${encodeURIComponent(input.trackingCode)}`
  const safeTrackingCode = escapeHtml(input.trackingCode)
  const safeStatus = escapeHtml(statusLabel)
  const safeMessage = escapeHtml(input.message)
  const safeTrackingUrl = escapeHtml(trackingUrl)
  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({
    from,
    to: input.recipient,
    subject: `Actualización de tu denuncia ${input.trackingCode}`,
    text: [
      'Tu denuncia ambiental fue actualizada.',
      `Código de seguimiento: ${input.trackingCode}`,
      `Nuevo estado: ${statusLabel}`,
      `Mensaje: ${input.message}`,
      `Consulta el seguimiento: ${trackingUrl}`,
    ].join('\n\n'),
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#0f172a">
        <h1 style="color:#047857">Actualización de denuncia ambiental</h1>
        <p>Tu denuncia ambiental fue actualizada por el equipo responsable.</p>
        <p><strong>Código de seguimiento:</strong> ${safeTrackingCode}</p>
        <p><strong>Nuevo estado:</strong> ${safeStatus}</p>
        <p><strong>Mensaje:</strong></p>
        <p style="padding:16px;background:#f1f5f9;border-radius:8px">${safeMessage}</p>
        <p><a href="${safeTrackingUrl}" style="color:#047857;font-weight:bold">Consultar seguimiento</a></p>
      </div>
    `,
  })

  if (error) throw new Error(error.message)
  return true
}
