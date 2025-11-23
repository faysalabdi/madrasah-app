import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const WEB3FORMS_ACCESS_KEY = Deno.env.get("WEB3FORMS_ACCESS_KEY") || "0d1a51cf-4e51-4254-adcf-0cd9af908071"

function buildHtmlEmail(content: string, logoUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Madrasah Abu Bakr As-Siddiq</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header with Logo -->
          <tr>
            <td style="background-color: #1a472a; padding: 30px 20px; text-align: center;">
              <img src="${logoUrl}" alt="Madrasah Abu Bakr As-Siddiq" style="max-width: 200px; height: auto; margin-bottom: 10px;" />
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Madrasah Abu Bakr As-Siddiq</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px; background-color: #ffffff;">
              <div style="color: #333333; font-size: 16px; line-height: 1.6;">
                ${content}
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px 30px; border-top: 1px solid #e5e5e5; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #666666; font-size: 12px; line-height: 1.5;">
                This is an email from Madrasah Abu Bakr As-Siddiq.
              </p>
              <p style="margin: 0; color: #666666; font-size: 12px; line-height: 1.5;">
                If you have any questions, please contact us at <a href="mailto:madrasahabubakr1@gmail.com" style="color: #1a472a; text-decoration: none;">madrasahabubakr1@gmail.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email, confirmationUrl, parentName } = await req.json()

    if (!email || !confirmationUrl) {
      return new Response(
        JSON.stringify({ error: "Email and confirmation URL are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const emailSubject = "Set Up Your Parent Portal Password - Madrasah Abu Bakr As-Siddiq"

    const frontendUrl = Deno.env.get("FRONTEND_URL") || "https://madrasahabubakr.com.au"
    const logoUrl = `${frontendUrl}/logo.png`
    
    const emailContent = `<p style="margin: 0 0 20px 0;">Assalamu Alaikum ${parentName || "Dear Parent"},</p>
      <p style="margin: 0 0 20px 0;">Thank you for accessing the Parent Portal at Madrasah Abu Bakr As-Siddiq!</p>
      <p style="margin: 0 0 20px 0;">To complete your account setup, please click the link below to confirm your email and set up your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${confirmationUrl}" style="display: inline-block; background-color: #1a472a; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">Set Up Password</a>
      </div>
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Or copy and paste this link into your browser:</p>
      <p style="margin: 0 0 20px 0; font-size: 12px; color: #999; word-break: break-all;">${confirmationUrl}</p>
      <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <p style="margin: 0; color: #856404; font-size: 14px;"><strong>Important:</strong></p>
        <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #856404; font-size: 14px;">
          <li style="margin-bottom: 5px;">This link will expire in 24 hours</li>
          <li style="margin-bottom: 5px;">After clicking the link, you'll be able to set up your password</li>
          <li style="margin-bottom: 5px;">Once your password is set, you can log in to access your parent portal</li>
        </ul>
      </div>
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px 0; color: #1a472a; font-size: 18px;">What you can do in the Parent Portal:</h3>
        <ul style="margin: 0; padding-left: 20px; color: #333;">
          <li style="margin-bottom: 8px;">View your children's enrollment information</li>
          <li style="margin-bottom: 8px;">Check payment history and status</li>
          <li style="margin-bottom: 8px;">Pay term fees online</li>
          <li style="margin-bottom: 8px;">Access billing and subscription management</li>
          <li style="margin-bottom: 8px;">View your children's progress, attendance, and homework</li>
          <li style="margin-bottom: 8px;">Order books</li>
        </ul>
      </div>
      <p style="margin: 20px 0 0 0;">If you did not request this email, please ignore it or contact us at <a href="mailto:madrasahabubakr1@gmail.com" style="color: #1a472a; text-decoration: none;">madrasahabubakr1@gmail.com</a></p>
      <p style="margin: 20px 0 0 0;">If you have any questions, please don't hesitate to contact us.</p>
      <p style="margin: 20px 0 0 0;">Jazakallahu Khairan,<br>Madrasah Abu Bakr As-Siddiq Team</p>`
    
    const emailBody = buildHtmlEmail(emailContent, logoUrl)

    // Send email via Resend (switching from Web3Forms for better HTML support)
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
    if (RESEND_API_KEY) {
      const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "noreply@madrasahabubakr.com.au"
      const fromName = "Madrasah Abu Bakr As-Siddiq"
      
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: `${fromName} <${fromEmail}>`,
          to: [email],
          subject: emailSubject,
          html: emailBody,
        }),
      })
      
      if (!emailResponse.ok) {
        const errorData = await emailResponse.json().catch(() => ({}))
        console.error("Resend API error:", errorData)
        // Fall back to Web3Forms if Resend fails
      } else {
        const emailResult = await emailResponse.json()
        return new Response(
          JSON.stringify({ 
            success: true,
            emailSent: true,
            message: "Password setup email sent successfully"
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        )
      }
    }
    
    // Fallback to Web3Forms if Resend is not configured
    const emailResponse = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: emailSubject,
        from_name: "Madrasah Abu Bakr As-Siddiq",
        from_email: "noreply@madrasahabubakr.com.au",
        to_email: email,
        message: emailBody,
      }),
    })

    const emailResult = await emailResponse.json()

    if (!emailResult.success) {
      console.error("Email sending failed:", emailResult)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Failed to send email",
          details: emailResult
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        emailSent: true,
        message: "Password setup email sent successfully"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    )
  } catch (error: any) {
    console.error("Error sending password setup email:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})

