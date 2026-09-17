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

function logoUrl(siteUrl: string): string {
  return `${siteUrl.replace(/\/$/, "")}/dinklogo.jpg`;
}

export function generateContributionEmailHTML(data: ContributionEmailData): string {
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
    site_url = "https://thedinkhousepb.com",
  } = data;

  const foundersWallSection = on_founders_wall
    ? `
    <div class="recognition-box">
      <h3>You're on the Founders Wall!</h3>
      <p>Your name will be displayed as: <strong>${display_name}</strong></p>
      <p style="margin-top: 8px;">${founders_wall_message}</p>
    </div>
  `
    : "";

  return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; line-height: 1.6; color: #ffffff; margin: 0; padding: 0; background-color: #0a0a0a; }
    .container { max-width: 650px; margin: 0 auto; background-color: #1a1a1a; }
    .header { background: linear-gradient(135deg, #B3FF00 0%, #9BCF00 100%); padding: 40px 30px; text-align: center; }
    .logo { max-width: 200px; height: auto; margin-bottom: 15px; }
    .header h1 { color: #000000; margin: 0; font-size: 28px; font-weight: 700; }
    .content { padding: 40px 35px; background-color: #1a1a1a; }
    .section { margin: 30px 0; padding: 25px; background: #2a2a2a; border-radius: 8px; border-left: 4px solid #B3FF00; }
    .receipt-label { font-size: 12px; text-transform: uppercase; color: #888888; font-weight: 600; margin-bottom: 5px; }
    .receipt-value { font-size: 16px; color: #ffffff; font-weight: 600; }
    .receipt-value.amount { font-size: 24px; color: #B3FF00; font-weight: 700; }
    .recognition-box { background: linear-gradient(135deg, #B3FF00 0%, #9BCF00 100%); padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; color: #000; }
    .button { display: inline-block; background: #B3FF00; color: #000000; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 700; }
    .footer { background: #0a0a0a; color: #888888; padding: 30px 35px; text-align: center; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${logoUrl(site_url)}" alt="The Dink House" class="logo" />
      <h1>Thank You for Your Contribution!</h1>
    </div>
    <div class="content">
      <p>Hi ${first_name},</p>
      <p>We are thrilled and grateful for your generous contribution to The Dink House.</p>
      <div class="section">
        <div class="receipt-label">Contribution Amount</div>
        <div class="receipt-value amount">$${amount}</div>
        <div class="receipt-label" style="margin-top:12px">Tier</div>
        <div class="receipt-value">${tier_name}</div>
        <div class="receipt-label" style="margin-top:12px">Date</div>
        <div class="receipt-value">${contribution_date}</div>
        <div class="receipt-label" style="margin-top:12px">Transaction ID</div>
        <div class="receipt-value">${contribution_id}</div>
        <div class="receipt-label" style="margin-top:12px">Payment Method</div>
        <div class="receipt-value">${payment_method}</div>
        <div class="receipt-label" style="margin-top:12px">Stripe Charge ID</div>
        <div class="receipt-value">${stripe_charge_id}</div>
      </div>
      <div class="section">
        <p>Your rewards &amp; benefits:</p>
        ${benefits_html}
      </div>
      ${foundersWallSection}
      <p style="text-align:center;margin:30px 0">
        <a href="${site_url}" class="button">Visit The Dink House</a>
      </p>
      <p>With gratitude,<br/>The Dink House Team</p>
    </div>
    <div class="footer">
      <p><strong>The Dink House</strong> — Where Pickleball Lives</p>
      <p>Questions? support@thedinkhouse.com</p>
    </div>
  </div>
</body>
</html>`;
}

export function generateContributionEmailText(data: ContributionEmailData): string {
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
    site_url = "https://thedinkhousepb.com",
  } = data;

  const founders = on_founders_wall
    ? `\nFOUNDERS WALL\nDisplayed as: ${display_name}\n${founders_wall_message}\n`
    : "";

  return `Hi ${first_name},

Thank you for your contribution to The Dink House!

Amount: $${amount}
Tier: ${tier_name}
Date: ${contribution_date}
Transaction ID: ${contribution_id}
Payment Method: ${payment_method}
Stripe Charge ID: ${stripe_charge_id}

Benefits:
${benefits_text}
${founders}
Visit: ${site_url}

— The Dink House Team`;
}
