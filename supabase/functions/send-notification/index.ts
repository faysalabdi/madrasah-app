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

    // Build HTML email if htmlMessage provided, otherwise use plain text
    const emailHtml = htmlMessage || buildHtmlEmail(message || getDefaultMessage(notificationType, studentName, parentName))

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
      <p>This is an automated notification from Madrasah Abu Bakr As-Siddiq.</p>
      <p>If you have any questions, please contact us at madrasahabubakr1@gmail.com</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

