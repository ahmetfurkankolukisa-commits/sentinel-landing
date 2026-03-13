export async function onRequestPost(context) {
  try {
    // 1. Get the request body
    const { request, env } = context;
    let body;
    
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const { email, company } = body;

    // 2. Validate input
    if (!email || !company) {
      return new Response(JSON.stringify({ error: "Email and Company Name are required" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Use the hardcoded key during testing if environment variable is not set up yet
    const RESEND_API_KEY = env.RESEND_API_KEY || "re_BwCbz1BS_GUD6WDYdKpBNo14Y6MAWWqas";

    // 3. Construct the HTML email
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
        .footer { text-align: center; margin-top: 40px; color: #546E7A; font-size: 14px; }
        .logo { font-size: 24px; font-weight: bold; color: #00E676; margin-bottom: 30px; letter-spacing: -1px; }
        .button { display: inline-block; background-color: #00E676; color: #050A18; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">Sentinel.</div>
        <div class="card">
          <h1>Welcome to Sentinel, <span class="highlight">${company}</span></h1>
          <p>We have successfully received your request for a Free SaaS Waste Audit.</p>
          <p>Our intelligence engine is currently initializing the environment for your semantic analysis. A dedicated member of our success team will reach out to you within the next 24 hours to securely connect your contract data and begin the audit process.</p>
          <p>Get ready to discover exactly where you're overpaying.</p>
          <p>Best regards,<br>The Sentinel Team</p>
        </div>
        <div class="footer">
          © 2026 Sentinel. The AI Guardian of Your Bottom Line.<br>
          This is an automated message, please do not reply.
        </div>
      </div>
    </body>
    </html>
    `;

    // 4. Call Resend API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        // Resend testing domain default (onboarding@resend.dev) can only send to the email address you verified on Resend.
        // For production, this should be something like hello@sentinel.com
        from: "Sentinel <onboarding@resend.dev>",
        to: [email],
        reply_to: "support@sentinel.com",
        subject: "Your Sentinel Audit Request is Confirmed",
        html: htmlContent
      })
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend API Error:", resendData);
      return new Response(JSON.stringify({ error: "Failed to send email", details: resendData }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 5. Return success
    return new Response(JSON.stringify({ success: true, message: "Email queued successfully", data: resendData }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Internal Server Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
