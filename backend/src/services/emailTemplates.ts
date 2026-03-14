// ─────────────────────────────────────────────────────────────────────────────
//  Slideo.ai  ·  Rich HTML Email Templates
// ─────────────────────────────────────────────────────────────────────────────

const BRAND_COLOR  = '#6C63FF';   // Purple accent
const DARK_BG      = '#0F0F1A';   // Deep dark background
const CARD_BG      = '#1A1A2E';   // Card background
const TEXT_MAIN    = '#FFFFFF';
const TEXT_MUTED   = '#A0A0B8';
const BORDER_COLOR = '#2E2E4A';

// ── Shared wrapper ────────────────────────────────────────────────────────────
const wrap = (bodyContent: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Slideo.ai</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${DARK_BG}; color: ${TEXT_MAIN}; font-family: 'Inter', Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    a { color: ${BRAND_COLOR}; text-decoration: none; }
    img { display: block; max-width: 100%; }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${DARK_BG}; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px; width:100%;">

          <!-- HEADER / LOGO -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:${BRAND_COLOR}; border-radius:12px; padding:10px 20px;">
                    <span style="font-size:22px; font-weight:800; color:#fff; letter-spacing:-0.5px;">
                      ✦ Slideo<span style="color:#C4B5FD;">.ai</span>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CARD -->
          <tr>
            <td style="background:${CARD_BG}; border:1px solid ${BORDER_COLOR}; border-radius:20px; overflow:hidden;">
              ${bodyContent}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" style="padding:28px 0 8px;">
              <p style="font-size:12px; color:${TEXT_MUTED}; line-height:1.6;">
                You're receiving this email because you have an account with Slideo.ai.<br/>
                If you didn't request this, you can safely ignore it.
              </p>
              <p style="font-size:12px; color:${TEXT_MUTED}; margin-top:8px;">
                &copy; ${new Date().getFullYear()} Slideo.ai &nbsp;·&nbsp;
                <a href="https://slideo.ai/privacy" style="color:${TEXT_MUTED};">Privacy Policy</a> &nbsp;·&nbsp;
                <a href="https://slideo.ai/unsubscribe" style="color:${TEXT_MUTED};">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ── Hero bar ──────────────────────────────────────────────────────────────────
const heroBanner = (emoji: string, title: string, subtitle: string): string => `
  <tr>
    <td style="background: linear-gradient(135deg, ${BRAND_COLOR}22 0%, #8B5CF622 100%);
               border-bottom:1px solid ${BORDER_COLOR};
               padding:40px 40px 32px; text-align:center;">
      <div style="font-size:52px; margin-bottom:16px;">${emoji}</div>
      <h1 style="font-size:26px; font-weight:800; color:${TEXT_MAIN}; line-height:1.3; margin-bottom:8px;">${title}</h1>
      <p  style="font-size:15px; color:${TEXT_MUTED}; line-height:1.6;">${subtitle}</p>
    </td>
  </tr>
`;

// ── CTA button ────────────────────────────────────────────────────────────────
const ctaButton = (label: string, url: string): string => `
  <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
    <tr>
      <td style="background:${BRAND_COLOR}; border-radius:10px;">
        <a href="${url}"
           style="display:inline-block; padding:14px 36px; font-size:15px;
                  font-weight:700; color:#fff; text-decoration:none; letter-spacing:0.3px;">
          ${label}
        </a>
      </td>
    </tr>
  </table>
`;

// ── OTP box ───────────────────────────────────────────────────────────────────
const otpBox = (otp: string): string => `
  <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
    <tr>
      <td style="background:#0F0F1A; border:2px dashed ${BRAND_COLOR};
                 border-radius:12px; padding:16px 40px; text-align:center;">
        <span style="font-size:36px; font-weight:800; letter-spacing:12px;
                     color:${BRAND_COLOR}; font-family:monospace;">${otp}</span>
      </td>
    </tr>
  </table>
`;

// ── Info row ──────────────────────────────────────────────────────────────────
const infoRow = (icon: string, label: string, value: string): string => `
  <tr>
    <td style="padding:8px 0;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td width="36" style="font-size:18px;">${icon}</td>
          <td style="font-size:14px; color:${TEXT_MUTED};">${label}</td>
          <td align="right" style="font-size:14px; color:${TEXT_MAIN}; font-weight:600;">${value}</td>
        </tr>
      </table>
    </td>
  </tr>
`;

// =============================================================================
//  1. WELCOME  EMAIL
// =============================================================================
export const welcomeEmailTemplate = (name: string): string =>
  wrap(`
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      ${heroBanner('🎉', `Welcome to Slideo.ai, ${name.split(' ')[0]}!`,
        'Your AI‑powered presentation studio is ready to go.')}
      <tr>
        <td style="padding:36px 40px;">

          <p style="font-size:16px; color:${TEXT_MAIN}; line-height:1.7; margin-bottom:24px;">
            Hey <strong>${name.split(' ')[0]}</strong> 👋, we're excited to have you on board!
            With Slideo.ai you can create stunning, professional presentations in seconds
            using the power of AI.
          </p>

          <!-- Feature bullets -->
          <table cellpadding="0" cellspacing="0" border="0" width="100%"
                 style="background:#0F0F1A; border-radius:12px; padding:20px 24px; margin-bottom:28px;">
            <tr><td>
              <p style="font-size:13px; font-weight:700; color:${BRAND_COLOR};
                         letter-spacing:1px; text-transform:uppercase; margin-bottom:12px;">
                What you can do
              </p>
              ${['✦ &nbsp;Generate full slide decks with AI in one prompt',
                 '✦ &nbsp;Choose from 14 professionally designed templates',
                 '✦ &nbsp;Export to PDF or PowerPoint instantly',
                 '✦ &nbsp;Import & enhance your existing PPTX files']
                .map(f => `<p style="font-size:14px; color:${TEXT_MUTED}; line-height:1.8;">${f}</p>`)
                .join('')}
            </td></tr>
          </table>

          <!-- CTA -->
          ${ctaButton('🚀 &nbsp; Create Your First Presentation', 'https://slideo.ai/dashboard')}

          <p style="font-size:13px; color:${TEXT_MUTED}; text-align:center; margin-top:20px;">
            Have questions? Reply to this email — we're always happy to help.
          </p>
        </td>
      </tr>
    </table>
  `);

// =============================================================================
//  2. OTP / VERIFICATION EMAIL
// =============================================================================
export const otpEmailTemplate = (otp: string, expiryMinutes = 10): string =>
  wrap(`
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      ${heroBanner('🔐', 'Your Verification Code',
        'Use this one-time code to verify your identity on Slideo.ai.')}
      <tr>
        <td style="padding:36px 40px; text-align:center;">

          <p style="font-size:15px; color:${TEXT_MUTED}; margin-bottom:28px; line-height:1.7;">
            Here is your one-time verification code. It expires in
            <strong style="color:${TEXT_MAIN};">${expiryMinutes} minutes</strong>.
          </p>

          ${otpBox(otp)}

          <p style="font-size:13px; color:${TEXT_MUTED}; margin-top:24px; line-height:1.7;">
            Never share this code with anyone. Slideo.ai will <strong>never</strong> ask for
            your OTP via email, phone, or chat.
          </p>

          <div style="border-top:1px solid ${BORDER_COLOR}; margin-top:28px; padding-top:20px;">
            <p style="font-size:13px; color:${TEXT_MUTED};">
              ⚠️ If you didn't request this code, please
              <a href="https://slideo.ai/account/security" style="color:${BRAND_COLOR};">
                secure your account
              </a> immediately.
            </p>
          </div>
        </td>
      </tr>
    </table>
  `);

// =============================================================================
//  3. PASSWORD RESET EMAIL
// =============================================================================
export const passwordResetEmailTemplate = (resetUrl: string, expiryMinutes = 30): string =>
  wrap(`
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      ${heroBanner('🔑', 'Reset Your Password',
        'We received a request to reset your Slideo.ai password.')}
      <tr>
        <td style="padding:36px 40px;">

          <p style="font-size:15px; color:${TEXT_MUTED}; line-height:1.7; margin-bottom:28px;">
            Click the button below to choose a new password. This link is valid for
            <strong style="color:${TEXT_MAIN};">${expiryMinutes} minutes</strong>.
          </p>

          ${ctaButton('Reset My Password', resetUrl)}

          <!-- Fallback URL -->
          <div style="background:#0F0F1A; border-radius:10px; padding:16px 20px; margin-top:28px;">
            <p style="font-size:12px; color:${TEXT_MUTED}; margin-bottom:6px;">
              If the button doesn't work, copy and paste this link:
            </p>
            <p style="font-size:12px; color:${BRAND_COLOR}; word-break:break-all;">${resetUrl}</p>
          </div>

          <p style="font-size:13px; color:${TEXT_MUTED}; margin-top:24px; line-height:1.7;">
            ⚠️ If you didn't request a password reset, no changes have been made to your account.
          </p>
        </td>
      </tr>
    </table>
  `);

// =============================================================================
//  4. PRESENTATION SHARED EMAIL
// =============================================================================
export const presentationSharedEmailTemplate = (
  senderName: string,
  presentationTitle: string,
  shareUrl: string,
  permission: string = 'view'
): string =>
  wrap(`
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      ${heroBanner('📊', 'A presentation was shared with you',
        `${senderName} invited you to <strong>${permission}</strong> their Slideo.ai presentation.`)}
      <tr>
        <td style="padding:36px 40px;">

          <!-- Presentation card -->
          <div style="background:#0F0F1A; border:1px solid ${BORDER_COLOR};
                      border-radius:14px; padding:20px 24px; margin-bottom:28px;">
            <p style="font-size:12px; font-weight:700; color:${BRAND_COLOR};
                       letter-spacing:1px; text-transform:uppercase; margin-bottom:6px;">
              Presentation
            </p>
            <p style="font-size:20px; font-weight:700; color:${TEXT_MAIN};">
              ${presentationTitle}
            </p>
            <p style="font-size:13px; color:${TEXT_MUTED}; margin-top:4px;">
              Shared by <strong style="color:${TEXT_MAIN};">${senderName}</strong>
            </p>
            <p style="font-size:12px; color:${BRAND_COLOR}; margin-top:8px; font-weight:600;">
              Access level: ${permission.toUpperCase()}
            </p>
          </div>

          ${ctaButton('📂 &nbsp; View Presentation', shareUrl)}

          <p style="font-size:13px; color:${TEXT_MUTED}; text-align:center; margin-top:20px;">
            You can access this presentation directly via the link above.
          </p>
        </td>
      </tr>
    </table>
  `);

// =============================================================================
//  5. ACCOUNT DELETION CONFIRMATION EMAIL
// =============================================================================
export const accountDeletedEmailTemplate = (name: string): string =>
  wrap(`
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      ${heroBanner('😢', 'Your account has been deleted',
        'We\'re sorry to see you go.')}
      <tr>
        <td style="padding:36px 40px; text-align:center;">

          <p style="font-size:15px; color:${TEXT_MUTED}; line-height:1.7; margin-bottom:28px;">
            Hi <strong style="color:${TEXT_MAIN};">${name}</strong>,<br/><br/>
            Your Slideo.ai account and all associated data have been permanently deleted.
            If this was a mistake, please contact our support team within 7 days —
            we may be able to restore your data.
          </p>

          ${ctaButton('Contact Support', 'mailto:support@slideo.ai')}

          <p style="font-size:13px; color:${TEXT_MUTED}; margin-top:24px;">
            Thank you for being part of Slideo.ai. We hope to see you again! 💜
          </p>
        </td>
      </tr>
    </table>
  `);
