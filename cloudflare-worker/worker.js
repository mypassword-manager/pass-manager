export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    if (url.pathname === '/api/send-email' && request.method === 'POST') {
      try {
        const { email, subject, htmlContent } = await request.json()

        const mailjetResponse = await fetch('https://api.mailjet.com/v3.1/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(`${env.MAILJET_API_KEY}:${env.MAILJET_SECRET_KEY}`)
          },
          body: JSON.stringify({
            Messages: [
              {
                From: { Email: env.SENDER_EMAIL, Name: "My Personal Vault" },
                To: [{ Email: email }],
                Subject: subject,
                HTMLPart: htmlContent
              }
            ]
          })
        })

        const result = await mailjetResponse.json()
        return new Response(JSON.stringify({ success: true, result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders })
  }
}
