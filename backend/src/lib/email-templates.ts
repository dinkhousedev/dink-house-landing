export interface ContributionEmailData {
  first_name: string;
  amount: string;
  tier_name: string;
  contribution_date: string;
  contribution_id: string;
  payment_method: string;
  stripe_charge_id: string;
  benefits_html: string;
  benefits_text: string;
  on_founders_wall: boolean;
  display_name: string;
  founders_wall_message: string;
  site_url: string;
}

export type DinkHouseEmailCta = {
  label: string;
  href: string;
};

export type DinkHouseEmailOptions = {
  preheader?: string;
  eyebrow?: string;
  heading?: string;
  bodyHtml: string;
  cta?: DinkHouseEmailCta;
  siteUrl?: string;
};

const BRAND = {
  lime: "#B3FF00",
  limeDark: "#8BC700",
  black: "#000000",
  charcoal: "#111111",
  gray: "#1A1A1A",
  panel: "#1F1F1F",
  white: "#FFFFFF",
  muted: "#A3A3A3",
  name: "The Dink House",
  tagline: "Where Pickleball Lives",
  supportEmail: "support@thedinkhouse.com",
  defaultSiteUrl: "https://thedinkhousepb.com",
  socials: [
    {
      label: "Facebook",
      href: "https://www.facebook.com/profile.php?id=61581427090217",
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/the.dink.house",
    },
    {
      label: "TikTok",
      href: "https://www.tiktok.com/@thedinkhousetx",
    },
    {
      label: "YouTube",
      href: "https://youtube.com/@thedinkhouse",
    },
  ],
} as const;

function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function origin(siteUrl: string): string {
  return siteUrl.replace(/\/$/, "") || BRAND.defaultSiteUrl;
}

function logoUrl(siteUrl: string): string {
  return `${origin(siteUrl)}/dinklogo.jpg`;
}

function fontStack(): string {
  return "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
}

function displayStack(): string {
  return "'Bebas Neue', 'Arial Black', Impact, Helvetica, Arial, sans-serif";
}

function bulletproofButton(cta: DinkHouseEmailCta): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto;">
      <tr>
        <td align="center" bgcolor="${BRAND.lime}" style="background-color: ${BRAND.lime}; border-radius: 4px;">
          <a href="${escapeHtml(cta.href)}" target="_blank" style="display: inline-block; padding: 16px 36px; font-family: ${fontStack()}; font-size: 14px; font-weight: 800; letter-spacing: 1.5px; line-height: 1; color: ${BRAND.black}; text-decoration: none; text-transform: uppercase;">
            ${escapeHtml(cta.label)}
          </a>
        </td>
      </tr>
    </table>
  `;
}

function socialLinks(): string {
  return BRAND.socials
    .map(
      (social, index) =>
        `${index > 0 ? `<span style="color: #333333; padding: 0 8px;">·</span>` : ""}<a href="${social.href}" target="_blank" style="color: ${BRAND.lime}; text-decoration: none; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; font-family: ${fontStack()};">${social.label}</a>`,
    )
    .join("");
}

/**
 * Branded Dink House email shell. Use this for every outbound message so
 * receipts, confirmations, and campaigns share the same look.
 */
export function renderDinkHouseEmail(options: DinkHouseEmailOptions): string {
  const siteUrl = origin(options.siteUrl || BRAND.defaultSiteUrl);
  const preheader = options.preheader || BRAND.tagline;
  const heading = options.heading ? escapeHtml(options.heading) : "";
  const eyebrow = options.eyebrow ? escapeHtml(options.eyebrow) : "";
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>${heading || BRAND.name}</title>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    :root { color-scheme: dark; supported-color-schemes: dark; }
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; background-color: ${BRAND.black}; }
    a { color: ${BRAND.lime}; }
    .benefits ul { margin: 0; padding: 0 0 0 18px; }
    .benefits li { color: ${BRAND.white}; margin: 0 0 8px; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .email-pad { padding-left: 20px !important; padding-right: 20px !important; }
      .email-heading { font-size: 28px !important; }
      .logo { max-width: 150px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.black};">
  <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all;">
    ${escapeHtml(preheader)}
  </div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: ${BRAND.black};">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        <table role="presentation" class="email-container" cellpadding="0" cellspacing="0" border="0" width="600" style="width: 600px; max-width: 600px; background-color: ${BRAND.charcoal};">
          <tr>
            <td style="background-color: ${BRAND.lime}; height: 6px; font-size: 0; line-height: 6px;">&nbsp;</td>
          </tr>
          <tr>
            <td align="center" class="email-pad" style="background-color: ${BRAND.black}; padding: 32px 40px 24px;">
              <a href="${siteUrl}" target="_blank" style="text-decoration: none;">
                <img src="${logoUrl(siteUrl)}" alt="${BRAND.name}" class="logo" width="180" style="display: block; margin: 0 auto; max-width: 180px; width: 180px; height: auto; border: 0;" />
              </a>
              <p style="margin: 16px 0 0; font-family: ${displayStack()}; font-size: 14px; letter-spacing: 4px; color: ${BRAND.lime}; text-transform: uppercase;">
                ${BRAND.tagline}
              </p>
            </td>
          </tr>
          ${
            heading
              ? `
          <tr>
            <td align="center" class="email-pad" style="background-color: ${BRAND.black}; padding: 0 40px 28px;">
              ${
                eyebrow
                  ? `<p style="margin: 0 0 8px; font-family: ${fontStack()}; font-size: 11px; font-weight: 700; letter-spacing: 2.5px; color: ${BRAND.lime}; text-transform: uppercase;">${eyebrow}</p>`
                  : ""
              }
              <h1 class="email-heading" style="margin: 0; font-family: ${displayStack()}; font-size: 36px; font-weight: 400; letter-spacing: 1px; line-height: 1.05; color: ${BRAND.white}; text-transform: uppercase;">
                ${heading}
              </h1>
            </td>
          </tr>
              `
              : ""
          }
          <tr>
            <td style="background-color: ${BRAND.lime}; height: 2px; font-size: 0; line-height: 2px;">&nbsp;</td>
          </tr>
          <tr>
            <td class="email-pad" style="background-color: ${BRAND.charcoal}; padding: 36px 40px 16px; font-family: ${fontStack()}; font-size: 16px; line-height: 1.6; color: ${BRAND.white};">
              ${options.bodyHtml}
            </td>
          </tr>
          ${
            options.cta
              ? `
          <tr>
            <td align="center" class="email-pad" style="background-color: ${BRAND.charcoal}; padding: 12px 40px 36px;">
              ${bulletproofButton(options.cta)}
            </td>
          </tr>
              `
              : `
          <tr>
            <td style="background-color: ${BRAND.charcoal}; height: 20px; font-size: 0; line-height: 20px;">&nbsp;</td>
          </tr>
              `
          }
          <tr>
            <td align="center" class="email-pad" style="background-color: ${BRAND.black}; padding: 32px 40px 16px;">
              <p style="margin: 0 0 16px; font-size: 18px; letter-spacing: 8px; color: ${BRAND.lime};">★&nbsp;★&nbsp;★</p>
              <p style="margin: 0 0 8px; font-family: ${displayStack()}; font-size: 22px; letter-spacing: 1px; color: ${BRAND.white}; text-transform: uppercase;">
                ${BRAND.name}
              </p>
              <p style="margin: 0 0 18px; font-family: ${fontStack()}; font-size: 13px; color: ${BRAND.muted};">
                ${BRAND.tagline} · Coming 2026 · Central Texas
              </p>
              <p style="margin: 0 0 18px;">
                ${socialLinks()}
              </p>
              <p style="margin: 0; font-family: ${fontStack()}; font-size: 13px; color: ${BRAND.muted};">
                Questions? <a href="mailto:${BRAND.supportEmail}" style="color: ${BRAND.lime}; text-decoration: none;">${BRAND.supportEmail}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" class="email-pad" style="background-color: ${BRAND.black}; padding: 8px 40px 32px;">
              <p style="margin: 0; font-family: ${fontStack()}; font-size: 11px; color: #555555;">
                © ${year} ${BRAND.name}. All rights reserved.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: ${BRAND.lime}; height: 6px; font-size: 0; line-height: 6px;">&nbsp;</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function receiptRow(
  label: string,
  value: string,
  emphasize = false,
): string {
  return `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #2A2A2A; font-family: ${fontStack()}; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: ${BRAND.muted}; width: 42%;">
        ${escapeHtml(label)}
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid #2A2A2A; font-family: ${fontStack()}; font-size: ${emphasize ? "22px" : "15px"}; font-weight: 700; color: ${emphasize ? BRAND.lime : BRAND.white}; text-align: right;">
        ${value}
      </td>
    </tr>
  `;
}

function panel(innerHtml: string, title?: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 24px 0; background-color: ${BRAND.panel}; border-left: 4px solid ${BRAND.lime};">
      <tr>
        <td style="padding: 22px 24px;">
          ${
            title
              ? `<p style="margin: 0 0 14px; font-family: ${fontStack()}; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: ${BRAND.lime};">${escapeHtml(title)}</p>`
              : ""
          }
          ${innerHtml}
        </td>
      </tr>
    </table>
  `;
}

export function generateContributionEmailHTML(
  data: ContributionEmailData,
): string {
  const {
    first_name,
    amount,
    tier_name,
    contribution_date,
    contribution_id,
    payment_method,
    stripe_charge_id,
    benefits_html,
    on_founders_wall,
    display_name,
    founders_wall_message,
    site_url = BRAND.defaultSiteUrl,
  } = data;

  const foundersWallSection = on_founders_wall
    ? `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 8px 0 24px; background-color: ${BRAND.lime};">
        <tr>
          <td style="padding: 22px 24px; text-align: center;">
            <p style="margin: 0 0 8px; font-family: ${displayStack()}; font-size: 22px; letter-spacing: 1px; color: ${BRAND.black}; text-transform: uppercase;">
              You're on the Founders Wall
            </p>
            <p style="margin: 0; font-family: ${fontStack()}; font-size: 15px; color: ${BRAND.black};">
              Displayed as <strong>${escapeHtml(display_name)}</strong>
            </p>
            ${
              founders_wall_message
                ? `<p style="margin: 10px 0 0; font-family: ${fontStack()}; font-size: 14px; color: ${BRAND.black};">${founders_wall_message}</p>`
                : ""
            }
          </td>
        </tr>
      </table>
    `
    : "";

  const bodyHtml = `
    <p style="margin: 0 0 16px; font-family: ${fontStack()}; font-size: 16px; line-height: 1.6; color: ${BRAND.white};">
      Hi ${escapeHtml(first_name)},
    </p>
    <p style="margin: 0 0 8px; font-family: ${fontStack()}; font-size: 16px; line-height: 1.6; color: ${BRAND.white};">
      We're thrilled and grateful for your contribution. You're helping build Bell County's first indoor pickleball home — 10 championship courts, year-round play, and a community that lives for the dink.
    </p>
    ${panel(
      `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        ${receiptRow("Amount", `$${escapeHtml(amount)}`, true)}
        ${receiptRow("Tier", escapeHtml(tier_name))}
        ${receiptRow("Date", escapeHtml(contribution_date))}
        ${receiptRow("Transaction ID", escapeHtml(contribution_id))}
        ${receiptRow("Payment Method", escapeHtml(payment_method))}
        ${receiptRow("Stripe Charge ID", escapeHtml(stripe_charge_id))}
      </table>
      `,
      "Your receipt",
    )}
    ${panel(
      `<div class="benefits" style="font-family: ${fontStack()}; font-size: 15px; line-height: 1.6; color: ${BRAND.white};">${benefits_html}</div>`,
      "Rewards & benefits",
    )}
    ${foundersWallSection}
    <p style="margin: 8px 0 0; font-family: ${fontStack()}; font-size: 16px; line-height: 1.6; color: ${BRAND.white};">
      With gratitude,<br />
      <strong style="color: ${BRAND.lime};">The Dink House Team</strong>
    </p>
  `;

  return renderDinkHouseEmail({
    siteUrl: site_url,
    preheader: `Thank you, ${first_name} — your $${amount} contribution is in. Let's build The Dink House together.`,
    eyebrow: "Contribution confirmed",
    heading: "Thank you for backing The Dink House",
    bodyHtml,
    cta: { label: "Visit The Dink House", href: origin(site_url) },
  });
}

export function generateContributionEmailText(
  data: ContributionEmailData,
): string {
  const {
    first_name,
    amount,
    tier_name,
    contribution_date,
    contribution_id,
    payment_method,
    stripe_charge_id,
    benefits_text,
    on_founders_wall,
    display_name,
    founders_wall_message,
    site_url = BRAND.defaultSiteUrl,
  } = data;

  const founders = on_founders_wall
    ? `\nFOUNDERS WALL\nDisplayed as: ${display_name}\n${founders_wall_message}\n`
    : "";

  return `THE DINK HOUSE
${BRAND.tagline}

Hi ${first_name},

Thank you for your contribution to The Dink House! You're helping build Bell County's first indoor pickleball facility.

RECEIPT
Amount: $${amount}
Tier: ${tier_name}
Date: ${contribution_date}
Transaction ID: ${contribution_id}
Payment Method: ${payment_method}
Stripe Charge ID: ${stripe_charge_id}

BENEFITS
${benefits_text}
${founders}
Visit: ${origin(site_url)}

Questions? ${BRAND.supportEmail}

— The Dink House Team
`;
}
