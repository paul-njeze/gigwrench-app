// gigwrench/lib/notify/shell.ts
// One email shell so every GigWrench message shares the exact dark card markup.
// Callers compose the inner card content and pass it as cardHtml. This keeps
// every email pixel identical and gives future template work one place to edit.

export const FOOTER_DISPATCH =
  'Dispatch by GigWrench. The field service OS for Pros and the people they serve.'
export const FOOTER_TRUST_SAFETY = 'GigWrench Trust and Safety.'

export interface RenderEmailParams {
  cardHtml: string
  footer?: string
}

// Escape dynamic values before interpolating them into email markup so a name
// or reason containing angle brackets or quotes cannot break or inject markup.
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// The yellow call to action button used across transactional emails.
export function emailButton(label: string, url: string): string {
  return `<a href="${url}" style="display:block;background:#F5C518;color:#000000;text-align:center;padding:14px;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;margin-bottom:24px;">${label}</a>`
}

export function renderEmail(params: RenderEmailParams): string {
  const footer = params.footer ?? FOOTER_DISPATCH
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#07090D;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="100%" style="max-width:560px;">
        <tr><td style="padding-bottom:32px;">
          <p style="margin:0;font-size:22px;font-weight:700;letter-spacing:4px;color:#FFFFFF;">GIG<span style="color:#F5C518;">WRENCH</span></p>
        </td></tr>
        <tr><td style="background:#131C28;border-radius:16px;padding:32px;border:1px solid #1E2D42;">
          ${params.cardHtml}
        </td></tr>
        <tr><td style="padding-top:24px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#374151;">${footer}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
