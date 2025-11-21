import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const WEB3FORMS_ACCESS_KEY = Deno.env.get("WEB3FORMS_ACCESS_KEY") || "0d1a51cf-4e51-4254-adcf-0cd9af908071"

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

    const emailBody = `Assalamu Alaikum ${parentName || "Dear Parent"},

Thank you for accessing the Parent Portal at Madrasah Abu Bakr As-Siddiq!

To complete your account setup, please click the link below to confirm your email and set up your password:

${confirmationUrl}

**Important:**
- This link will expire in 24 hours
- After clicking the link, you'll be able to set up your password
- Once your password is set, you can log in to access your parent portal

**What you can do in the Parent Portal:**
- View your children's enrollment information
- Check payment history and status
- Pay term fees online
- Access billing and subscription management
- View grades (coming soon)
- Order books (coming soon)

If you did not request this email, please ignore it or contact us at madrasahabubakr1@gmail.com

If you have any questions, please don't hesitate to contact us.

Jazakallahu Khairan,
Madrasah Abu Bakr As-Siddiq Team`

    // Send email via Web3Forms
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

