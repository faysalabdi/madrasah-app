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
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Madrasah Abu Bakr As-Siddiq</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #1a472a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0;">Madrasah Abu Bakr As-Siddiq</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #ddd;">
    <div style="white-space: pre-wrap; margin-bottom: 20px;">${message.replace(/\n/g, '<br>')}</div>
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px;">
      <p>This is an email from Madrasah Abu Bakr As-Siddiq.</p>
      <p>If you have any questions, please contact us at madrasahabubakr1@gmail.com</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

