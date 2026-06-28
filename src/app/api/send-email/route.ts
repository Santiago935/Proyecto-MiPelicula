import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const GMAIL_USER     = process.env.GMAIL_USER
const GMAIL_APP_PASS = process.env.GMAIL_APP_PASSWORD

interface EmailPayload {
  type:             'alquiler' | 'bienvenida'
  to:               string
  nombre:           string
  peliculas?:       string[]
  snacks?:          { nombre: string; cantidad: number }[]
  total?:           number
  fechaEnvio?:      string
  fechaDevolucion?: string
}

function formatDate(d?: string) {
  if (!d) return ''
  return new Date(d + 'T12:00:00').toLocaleDateString('es-AR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function baseTemplate(content: string) {
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- HEADER / LOGO -->
        <tr>
          <td align="center" style="background:#1e2235;border-radius:12px 12px 0 0;padding:36px 40px 30px;border-bottom:3px solid #cc1122;">
            <!-- Círculo con borde rojo y film reel SVG -->
            <table cellpadding="0" cellspacing="0" align="center" style="margin-bottom:14px;">
              <tr><td align="center">
                <div style="width:66px;height:66px;border:2.5px solid #cc1122;border-radius:50%;text-align:center;line-height:66px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="#cc1122" style="display:inline-block;vertical-align:middle;margin-top:14px;">
                    <rect x="2" y="2" width="20" height="20" rx="3" ry="3" fill="#cc1122"/>
                    <circle cx="7"  cy="7"  r="1.5" fill="#1e2235"/>
                    <circle cx="17" cy="7"  r="1.5" fill="#1e2235"/>
                    <circle cx="7"  cy="17" r="1.5" fill="#1e2235"/>
                    <circle cx="17" cy="17" r="1.5" fill="#1e2235"/>
                    <circle cx="12" cy="12" r="3"   fill="#1e2235"/>
                    <circle cx="12" cy="12" r="1.5" fill="#cc1122"/>
                  </svg>
                </div>
              </td></tr>
            </table>
            <!-- Nombre: "Mi" crema + "Película" rojo -->
            <div style="font-size:30px;font-weight:800;letter-spacing:1px;margin-bottom:7px;font-family:Georgia,serif;">
              <span style="color:#e8dcc8;">Mi</span><span style="color:#cc1122;">Película</span>
            </div>
            <!-- Subtítulo -->
            <div style="color:#7a8099;font-size:10px;letter-spacing:4px;text-transform:uppercase;font-weight:600;">
              Alquiler de Cine Físico
            </div>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="background:#151929;padding:36px 40px;border-radius:0 0 12px 12px;">
            ${content}
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td align="center" style="padding:24px 0;">
            <p style="color:#444;font-size:12px;margin:0;">
              © 2026 MiPelícula — El cine físico nunca muere.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function alquilerTemplate(p: EmailPayload) {
  const pelisHtml = (p.peliculas ?? [])
    .map(nombre => `
      <tr>
        <td style="padding:9px 0;border-bottom:1px solid #252a3d;color:#ccc;font-size:15px;">
          &#127902; ${nombre}
        </td>
      </tr>`)
    .join('')

  const snacksActivos = (p.snacks ?? []).filter(s => s.cantidad > 0)
  const snacksHtml = snacksActivos.length > 0
    ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr><td style="padding-bottom:12px;">
        <span style="color:#cc1122;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Snacks</span>
      </td></tr>
      ${snacksActivos.map(s => `
      <tr>
        <td style="padding:9px 0;border-bottom:1px solid #252a3d;color:#ccc;font-size:15px;">
          &#127871; ${s.nombre} <span style="color:#7a8099;">×${s.cantidad}</span>
        </td>
      </tr>`).join('')}
    </table>`
    : ''

  return baseTemplate(`
    <h2 style="color:#e8dcc8;font-size:22px;margin:0 0 8px;">¡Hola, ${p.nombre}!</h2>
    <p style="color:#9aa0b8;font-size:15px;margin:0 0 28px;">Tu compra fue confirmada con éxito.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr><td style="padding-bottom:12px;">
        <span style="color:#cc1122;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Películas alquiladas</span>
      </td></tr>
      ${pelisHtml}
    </table>

    ${snacksHtml}

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#1e2235;border-radius:8px;padding:0;margin-bottom:24px;">
      <tr>
        <td style="padding:14px 20px;border-bottom:1px solid #252a3d;">
          <span style="color:#7a8099;font-size:13px;">Fecha de envío</span><br/>
          <span style="color:#e8dcc8;font-size:15px;font-weight:600;">${formatDate(p.fechaEnvio)}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:14px 20px;border-bottom:1px solid #252a3d;">
          <span style="color:#7a8099;font-size:13px;">Fecha de devolución</span><br/>
          <span style="color:#e8dcc8;font-size:15px;font-weight:600;">${formatDate(p.fechaDevolucion)}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:14px 20px;">
          <span style="color:#7a8099;font-size:13px;">Total pagado</span><br/>
          <span style="color:#cc1122;font-size:20px;font-weight:800;">ARS ${p.total?.toFixed(2)}</span>
        </td>
      </tr>
    </table>

    <p style="color:#4a5068;font-size:13px;margin:0;">¡Gracias por elegir MiPelícula!</p>
  `)
}

function bienvenidaTemplate(p: EmailPayload) {
  return baseTemplate(`
    <h2 style="color:#e8dcc8;font-size:22px;margin:0 0 8px;">¡Bienvenido, ${p.nombre}!</h2>
    <p style="color:#9aa0b8;font-size:15px;margin:0 0 28px;">Tu cuenta fue creada con éxito.</p>

    <div style="background:#1e2235;border-radius:8px;padding:20px;margin-bottom:24px;border-left:3px solid #cc1122;">
      <p style="color:#ccc;font-size:15px;margin:0;">
        Ya podés explorar nuestro catálogo y alquilar tus películas favoritas en formato físico.
      </p>
    </div>

    <p style="color:#4a5068;font-size:13px;margin:0;">¡El cine físico nunca muere!</p>
  `)
}

export async function POST(req: NextRequest) {
  if (!GMAIL_USER || !GMAIL_APP_PASS) {
    console.error('[send-email] Faltan credenciales Gmail en .env.local')
    return NextResponse.json({ ok: false, reason: 'Gmail credentials not configured' })
  }

  const payload: EmailPayload = await req.json()

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASS },
  })

  const subject = payload.type === 'alquiler'
    ? '¡Tu alquiler fue confirmado! 🎬'
    : '¡Bienvenido a MiPelícula! 🎬'

  const html = payload.type === 'alquiler'
    ? alquilerTemplate(payload)
    : bienvenidaTemplate(payload)

  try {
    await transporter.sendMail({
      from:    `MiPelícula <${GMAIL_USER}>`,
      to:      payload.to,
      subject,
      html,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[send-email] Error al enviar:', err)
    return NextResponse.json({ ok: false, reason: String(err) }, { status: 500 })
  }
}
