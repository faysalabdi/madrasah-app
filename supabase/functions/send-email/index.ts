import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const {
      to,
      subject,
      message,
      htmlMessage,
      sendToAllParents = false,
    } = await req.json()

    if (!subject || (!message && !htmlMessage)) {
      return new Response(
        JSON.stringify({ error: "Subject and message are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    // Get from email from environment or use default
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "noreply@madrasahabubakr.com.au"
    const fromName = "Madrasah Abu Bakr As-Siddiq"

    // Build HTML email
    const emailHtml = htmlMessage || buildHtmlEmail(message)

    let recipients: string[] = []

    if (sendToAllParents) {
      // Get all parent emails
      const { data: parents, error: parentsError } = await supabaseClient
        .from("parents")
        .select("parent1_email")
        .not("parent1_email", "is", null)

      if (parentsError) {
        throw new Error(`Failed to fetch parents: ${parentsError.message}`)
      }

      recipients = (parents || [])
        .map(p => p.parent1_email)
        .filter((email): email is string => !!email && email.trim() !== "")
    } else {
      // Use provided email addresses
      if (!to || (Array.isArray(to) && to.length === 0)) {
        return new Response(
          JSON.stringify({ error: "Recipient email(s) are required when not sending to all parents" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      recipients = Array.isArray(to) ? to : [to]
    }

    if (recipients.length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid recipients found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Send emails (Resend supports up to 50 recipients per request)
    const results = {
      success: [] as string[],
      failed: [] as Array<{ email: string; error: string }>,
    }

    // Split recipients into batches of 50
    const batchSize = 50
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize)
      
      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: `${fromName} <${fromEmail}>`,
            to: batch,
            subject: subject,
            html: emailHtml,
          }),
        })

        if (!emailResponse.ok) {
          const errorData = await emailResponse.json().catch(() => ({}))
          // Mark all in batch as failed
          batch.forEach(email => {
            results.failed.push({
              email,
              error: errorData.message || "Failed to send email"
            })
          })
        } else {
          // Mark all in batch as successful
          results.success.push(...batch)
        }
      } catch (error: any) {
        // Mark all in batch as failed
        batch.forEach(email => {
          results.failed.push({
            email,
            error: error.message || "Unknown error"
          })
        })
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        total: recipients.length,
        succeeded: results.success.length,
        failed: results.failed.length,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    )
  } catch (error: any) {
    console.error("Error sending email:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})

function buildHtmlEmail(message: string): string {
  const frontendUrl = Deno.env.get("FRONTEND_URL") || "https://madrasahabubakr.com.au"
  const logoUrl = `${frontendUrl}/logo.png`
  
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
              <div style="color: #333333; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">${message.replace(/\n/g, '<br>')}</div>
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

