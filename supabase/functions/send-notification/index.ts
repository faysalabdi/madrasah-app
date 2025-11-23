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
      parentEmail,
      parentName,
      studentName,
      notificationType,
      subject,
      message,
      htmlMessage,
    } = await req.json()

    if (!parentEmail || !notificationType) {
      return new Response(
        JSON.stringify({ error: "Parent email and notification type are required" }),
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

    // Get from email from environment or use default
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "noreply@madrasahabubakr.com.au"
    const fromName = "Madrasah Abu Bakr As-Siddiq"

    // Build email subject if not provided
    const emailSubject = subject || getDefaultSubject(notificationType, studentName)

    // Build HTML email - always use the template, wrapping either htmlMessage or plain text message
    const contentToWrap = htmlMessage || message || getDefaultMessage(notificationType, studentName, parentName)
    const emailHtml = buildHtmlEmail(contentToWrap)

    // Send email via Resend API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [parentEmail],
        subject: emailSubject,
        html: emailHtml,
      }),
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json().catch(() => ({}))
      console.error("Resend API error:", errorData)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Failed to send email",
          details: errorData
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const emailResult = await emailResponse.json()

    return new Response(
      JSON.stringify({ 
        success: true,
        emailId: emailResult.id,
        message: "Notification email sent successfully"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    )
  } catch (error: any) {
    console.error("Error sending notification email:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})

function getDefaultSubject(type: string, studentName?: string): string {
  const student = studentName ? ` - ${studentName}` : ""
  switch (type) {
    case "homework":
      return `New Homework Assignment${student}`
    case "attendance":
      return `Attendance Update${student}`
    case "behavior":
      return `Behavior Note${student}`
    case "note":
      return `Teacher Note${student}`
    default:
      return `Notification from Madrasah Abu Bakr As-Siddiq${student}`
  }
}

function getDefaultMessage(type: string, studentName?: string, parentName?: string): string {
  const greeting = parentName ? `Assalamu Alaikum ${parentName}` : "Assalamu Alaikum"
  const student = studentName ? ` for ${studentName}` : ""
  
  switch (type) {
    case "homework":
      return `${greeting},\n\nYour child${student} has been assigned new homework. Please check the parent portal for details.\n\nJazakallahu Khairan,\nMadrasah Abu Bakr As-Siddiq Team`
    case "attendance":
      return `${greeting},\n\nThere has been an attendance update${student}. Please check the parent portal for details.\n\nJazakallahu Khairan,\nMadrasah Abu Bakr As-Siddiq Team`
    case "behavior":
      return `${greeting},\n\nA behavior note has been added${student}. Please check the parent portal for details.\n\nJazakallahu Khairan,\nMadrasah Abu Bakr As-Siddiq Team`
    case "note":
      return `${greeting},\n\nA teacher note has been added${student}. Please check the parent portal for details.\n\nJazakallahu Khairan,\nMadrasah Abu Bakr As-Siddiq Team`
    default:
      return `${greeting},\n\nYou have a new notification${student}. Please check the parent portal for details.\n\nJazakallahu Khairan,\nMadrasah Abu Bakr As-Siddiq Team`
  }
}

function buildHtmlEmail(content: string): string {
  const frontendUrl = Deno.env.get("FRONTEND_URL") || "https://madrasahabubakr.com.au"
  const logoUrl = `${frontendUrl}/logo.png`
  
  // Check if content is already HTML (contains HTML tags) or plain text
  const isHtml = /<[a-z][\s\S]*>/i.test(content)
  
  // If it's plain text, convert newlines to <br>, otherwise use as-is
  const formattedContent = isHtml ? content : content.replace(/\n/g, '<br>')
  
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
              <div style="color: #333333; font-size: 16px; line-height: 1.6;">${formattedContent}</div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px 30px; border-top: 1px solid #e5e5e5; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #666666; font-size: 12px; line-height: 1.5;">
                This is an automated notification from Madrasah Abu Bakr As-Siddiq.
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

