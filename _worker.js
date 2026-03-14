export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle API route
    if (url.pathname === "/api/submit-audit" && request.method === "POST") {
      return handleSubmitAudit(request, env);
    }

    // For everything else, serve static assets
    return env.ASSETS.fetch(request);
  }
};

async function handleSubmitAudit(request, env) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }

    const { email, company } = body;

    if (!email || !company) {
      return jsonResponse({ error: "Email and Company Name are required" }, 400);
    }

    const RESEND_API_KEY = env.RESEND_API_KEY || "re_BwCbz1BS_GUD6WDYdKpBNo14Y6MAWWqas";

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #050A18; color: #ECEFF1; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .card { background-color: #0A1128; border: 1px solid rgba(0, 230, 118, 0.2); border-radius: 12px; padding: 40px; }
        h1 { color: #fff; font-size: 24px; margin-top: 0; margin-bottom: 24px; }
        p { color: #90A4AE; font-size: 16px; line-height: 1.6; margin-bottom: 24px; }
        .highlight { color: #00E676; font-weight: 600; }
        .status-box { background-color: rgba(0, 230, 118, 0.08); border-left: 3px solid #00E676; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0; }
        .status-box p { margin: 0; font-size: 14px; }
        .status-box .label { color: #69F0AE; font-weight: 700; margin-bottom: 6px; }
        .status-box .detail { color: #B0BEC5; }
        .footer { text-align: center; margin-top: 40px; color: #546E7A; font-size: 12px; line-height: 1.8; }
        .logo { font-size: 28px; font-weight: bold; color: #00E676; margin-bottom: 30px; letter-spacing: 2px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">S E N T I N E L</div>
        <div class="card">
          <h1>Welcome, <span class="highlight">${company}</span></h1>
          <p>We have successfully received your request for a <strong style="color:#fff;">Free SaaS Waste Audit</strong>.</p>
          <p>Our intelligence engine is initializing the environment for your semantic contract analysis. A dedicated member of our success team will reach out within <strong style="color:#fff;">24 hours</strong> to securely connect your data and begin the audit.</p>
          <div class="status-box">
            <p class="label">Status: Processing Request</p>
            <p class="detail">An analyst will contact <strong>${email}</strong> to initiate the data sync.</p>
          </div>
          <p>Get ready to discover exactly where you're overpaying.</p>
          <p>Securely,<br><strong style="color:#fff;">The Sentinel Team</strong></p>
        </div>
        <div class="footer">
          Request ID: ${crypto.randomUUID().split("-")[0].toUpperCase()}<br>
          &copy; 2026 Sentinel Intelligence. The AI Guardian of Your Bottom Line.<br>
          This is an automated message, please do not reply.
        </div>
      </div>
    </body>
    </html>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Sentinel <contact@sentinell-ai.com>",
        to: [email],
        subject: "Your Sentinel Audit Request is Confirmed",
        html: htmlContent
      })
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend API Error:", resendData);
      return jsonResponse({ error: "Failed to send email", details: resendData }, 500);
    }

    // Send Admin Notification Email
    const adminHtmlContent = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2 style="color: #00E676;">New Audit Request! 🚀</h2>
        <p>A new lead has requested a SaaS Waste Audit.</p>
        <table style="width: 100%; max-width: 500px; text-align: left; border-collapse: collapse;">
          <tr>
            <th style="padding: 10px; border-bottom: 1px solid #eee;">Company</th>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>${company}</strong></td>
          </tr>
          <tr>
            <th style="padding: 10px; border-bottom: 1px solid #eee;">Email</th>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${email}</td>
          </tr>
        </table>
        <p style="margin-top: 20px; font-size: 12px; color: #666;">
          <em>Tip: You can reply directly to this email to contact the lead.</em>
        </p>
      </div>
    `;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Sentinel Alerts <contact@sentinell-ai.com>",
        to: ["contact@sentinell-ai.com"], // Sending to the admin
        reply_to: email, // If admin hits reply, it goes to the lead
        subject: `New Lead Alert: ${company}`,
        html: adminHtmlContent
      })
    });

    return jsonResponse({ success: true, message: "Emails sent", id: resendData.id }, 200);

  } catch (error) {
    console.error("Internal Server Error:", error);
    return jsonResponse({ error: "Internal Server Error" }, 500);
  }
}

function jsonResponse(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
