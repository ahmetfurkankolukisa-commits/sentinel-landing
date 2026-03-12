export async function onRequestPost({ request, env }) {
  try {
    // 1. Parse the incoming JSON from the frontend
    const formData = await request.json();
    const userEmail = formData.email;
    const userCompany = formData.company;

    if (!userEmail || !userCompany) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. Prepare Resend HTML Payload (Welcome Automaton)
    const emailHtml = `
      <div style="font-family: 'Inter', Helvetica, sans-serif; background-color: #050A18; color: #ECEFF1; padding: 40px; border-radius: 12px; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #00E676; margin: 0; font-size: 24px; letter-spacing: 1px;">S E N T I N E L</h1>
          <p style="color: #90A4AE; font-size: 14px; margin-top: 5px;">AI-Powered SaaS Intelligence</p>
        </div>
        
        <div style="background-color: #0A1128; padding: 30px; border-radius: 8px; border: 1px solid #111D3D;">
          <h2 style="margin-top: 0; font-size: 20px;">Audit Request Received</h2>
          <p style="color: #B0BEC5; line-height: 1.6;">Hello ${userCompany} Team,</p>
          <p style="color: #B0BEC5; line-height: 1.6;">Our intelligence unit has successfully logged your request for a Free SaaS Waste Audit. Sentinel is preparing to analyze your contract structures and usage data.</p>
          
          <div style="background-color: rgba(0, 230, 118, 0.1); border-left: 3px solid #00E676; padding: 15px; margin: 25px 0;">
            <p style="margin: 0; color: #69F0AE; font-size: 14px;"><strong>Status:</strong> Processing Request</p>
            <p style="margin: 5px 0 0 0; color: #B0BEC5; font-size: 14px;">One of our analysts will reach out to <strong>${userEmail}</strong> within 24 hours to initiate the data sync.</p>
          </div>

          <p style="color: #B0BEC5; line-height: 1.6; font-size: 14px;">Securely,<br><strong>The Sentinel Team</strong></p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #546E7A; font-size: 12px;">
          Request ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}<br>
          © ${new Date().getFullYear()} Sentinel Intelligence
        </div>
      </div>
    `;

    // 3. Make the API Call to Resend
    // Important: We use the API Key passed via environment variables (or fallback for local dev if set)
    const API_KEY = env.RESEND_API_KEY || 're_gQ9gzEC4_5bzXyHEVZYKNP7j8GFjW3JMR'; 

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Sentinel Intelligence <onboarding@resend.dev>', // Note: Use onboard address unless domain verified
        to: [userEmail],
        subject: 'Sentinel Audit Requested: Initiating Analysis',
        html: emailHtml
      })
    });

    const resendResult = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('Resend Error:', resendResult);
      return new Response(JSON.stringify({ error: resendResult }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 4. Return Success to Frontend
    return new Response(JSON.stringify({ success: true, id: resendResult.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
