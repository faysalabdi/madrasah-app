import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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
    const {
      parentEmail,
      parentName,
      numberOfChildren,
      children,
      isTrial = false,
      paymentAmount,
    } = await req.json()

    if (!parentEmail) {
      return new Response(
        JSON.stringify({ error: "Parent email is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Build email content
    const childrenList = children && Array.isArray(children)
      ? children.map((child: any, index: number) => 
          `${index + 1}. ${child.firstName || ""} ${child.lastName || ""} (${child.yearLevel || "N/A"})`
        ).join("\n")
      : `${numberOfChildren} child/children`

    const emailSubject = isTrial
      ? "Welcome to Madrasah Abu Bakr As-Siddiq - Your 14-Day Free Trial Has Started!"
      : "Welcome to Madrasah Abu Bakr As-Siddiq - Enrollment Confirmed!"

    const frontendUrl = Deno.env.get("FRONTEND_URL") || "https://madrasahabubakr.com.au"
    const logoUrl = `${frontendUrl}/logo.png`
    
    const emailContent = isTrial
      ? `<p style="margin: 0 0 20px 0;">Assalamu Alaikum ${parentName || "Dear Parent"},</p>
        <p style="margin: 0 0 20px 0;">Thank you for enrolling your child/children at Madrasah Abu Bakr As-Siddiq!</p>
        <p style="margin: 0 0 20px 0;">Your 14-day free trial has started. Your child/children can begin attending classes immediately.</p>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1a472a; font-size: 18px;">Enrollment Details:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #333;">
            <li style="margin-bottom: 8px;">Parent Name: ${parentName || "N/A"}</li>
            <li style="margin-bottom: 8px;">Number of Children: ${numberOfChildren}</li>
            <li style="margin-bottom: 8px;">Children: ${childrenList}</li>
          </ul>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1a472a; font-size: 18px;">Trial Period:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #333;">
            <li style="margin-bottom: 8px;">Trial Start Date: ${new Date().toLocaleDateString()}</li>
            <li style="margin-bottom: 8px;">Trial End Date: ${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}</li>
            <li style="margin-bottom: 8px;">Payment Amount: $${paymentAmount || "N/A"} AUD (will be charged after trial period)</li>
          </ul>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1a472a; font-size: 18px;">What's Next:</h3>
          <ol style="margin: 0; padding-left: 20px; color: #333;">
            <li style="margin-bottom: 8px;">Your child/children can start attending classes immediately</li>
            <li style="margin-bottom: 8px;">Our team will contact you within 3-5 business days to schedule an assessment</li>
            <li style="margin-bottom: 8px;">Payment will be automatically processed after the 14-day trial period</li>
            <li style="margin-bottom: 8px;">You can cancel anytime during the trial period</li>
          </ol>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1a472a; font-size: 18px;">Class Schedule:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #333;">
            <li style="margin-bottom: 8px;">Tuesday: 5:30 PM - 7:30 PM</li>
            <li style="margin-bottom: 8px;">Thursday: 5:30 PM - 7:30 PM</li>
            <li style="margin-bottom: 8px;">Saturday: 10:00 AM - 12:00 PM</li>
          </ul>
        </div>
        <p style="margin: 20px 0 0 0;">If you have any questions, please don't hesitate to contact us at <a href="mailto:madrasahabubakr1@gmail.com" style="color: #1a472a; text-decoration: none;">madrasahabubakr1@gmail.com</a></p>
        <p style="margin: 20px 0 0 0;">Jazakallahu Khairan,<br>Madrasah Abu Bakr As-Siddiq Team</p>`
      : `<p style="margin: 0 0 20px 0;">Assalamu Alaikum ${parentName || "Dear Parent"},</p>
        <p style="margin: 0 0 20px 0;">Thank you for enrolling your child/children at Madrasah Abu Bakr As-Siddiq!</p>
        <p style="margin: 0 0 20px 0;">Your enrollment has been confirmed and payment has been successfully processed.</p>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1a472a; font-size: 18px;">Enrollment Details:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #333;">
            <li style="margin-bottom: 8px;">Parent Name: ${parentName || "N/A"}</li>
            <li style="margin-bottom: 8px;">Number of Children: ${numberOfChildren}</li>
            <li style="margin-bottom: 8px;">Children: ${childrenList}</li>
            <li style="margin-bottom: 8px;">Payment Amount: $${paymentAmount || "N/A"} AUD</li>
            <li style="margin-bottom: 8px;">Payment Status: Confirmed</li>
          </ul>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1a472a; font-size: 18px;">What's Next:</h3>
          <ol style="margin: 0; padding-left: 20px; color: #333;">
            <li style="margin-bottom: 8px;">Our team will contact you within 3-5 business days to schedule your child's assessment</li>
            <li style="margin-bottom: 8px;">Once the assessment is complete, you'll receive all details about class schedules and start dates</li>
            <li style="margin-bottom: 8px;">Your child/children can begin attending classes as soon as the assessment is completed</li>
          </ol>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1a472a; font-size: 18px;">Class Schedule:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #333;">
            <li style="margin-bottom: 8px;">Tuesday: 5:30 PM - 7:30 PM</li>
            <li style="margin-bottom: 8px;">Thursday: 5:30 PM - 7:30 PM</li>
            <li style="margin-bottom: 8px;">Saturday: 10:00 AM - 12:00 PM</li>
          </ul>
        </div>
        <p style="margin: 20px 0 0 0;">If you have any questions, please don't hesitate to contact us at <a href="mailto:madrasahabubakr1@gmail.com" style="color: #1a472a; text-decoration: none;">madrasahabubakr1@gmail.com</a></p>
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
          to: [parentEmail],
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
            message: "Enrollment email sent successfully"
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
        to_email: parentEmail,
        message: emailBody,
      }),
    })

    const emailResult = await emailResponse.json()

    if (!emailResult.success) {
      console.error("Email sending failed:", emailResult)
      // Don't fail the request if email fails
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        emailSent: emailResult.success,
        message: "Enrollment email sent successfully"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    )
  } catch (error) {
    console.error("Error sending enrollment email:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    )
  }
})

