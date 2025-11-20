import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

const WEB3FORMS_ACCESS_KEY = Deno.env.get("WEB3FORMS_ACCESS_KEY") || "0d1a51cf-4e51-4254-adcf-0cd9af908071"

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
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

    const emailBody = isTrial
      ? `Assalamu Alaikum ${parentName || "Dear Parent"},

Thank you for enrolling your child/children at Madrasah Abu Bakr As-Siddiq!

Your 14-day free trial has started. Your child/children can begin attending classes immediately.

**Enrollment Details:**
- Parent Name: ${parentName || "N/A"}
- Number of Children: ${numberOfChildren}
- Children: ${childrenList}

**Trial Period:**
- Trial Start Date: ${new Date().toLocaleDateString()}
- Trial End Date: ${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}
- Payment Amount: $${paymentAmount || "N/A"} AUD (will be charged after trial period)

**What's Next:**
1. Your child/children can start attending classes immediately
2. Our team will contact you within 3-5 business days to schedule an assessment
3. Payment will be automatically processed after the 14-day trial period
4. You can cancel anytime during the trial period

**Class Schedule:**
- Tuesday: 5:00 PM - 7:00 PM
- Thursday: 5:00 PM - 7:00 PM
- Saturday: 10:00 AM - 12:00 PM

If you have any questions, please don't hesitate to contact us at madrasahabubakr1@gmail.com

Jazakallahu Khairan,
Madrasah Abu Bakr As-Siddiq Team`
      : `Assalamu Alaikum ${parentName || "Dear Parent"},

Thank you for enrolling your child/children at Madrasah Abu Bakr As-Siddiq!

Your enrollment has been confirmed and payment has been successfully processed.

**Enrollment Details:**
- Parent Name: ${parentName || "N/A"}
- Number of Children: ${numberOfChildren}
- Children: ${childrenList}
- Payment Amount: $${paymentAmount || "N/A"} AUD
- Payment Status: Confirmed

**What's Next:**
1. Our team will contact you within 3-5 business days to schedule your child's assessment
2. Once the assessment is complete, you'll receive all details about class schedules and start dates
3. Your child/children can begin attending classes as soon as the assessment is completed

**Class Schedule:**
- Tuesday: 5:00 PM - 7:00 PM
- Thursday: 5:00 PM - 7:00 PM
- Saturday: 10:00 AM - 12:00 PM

If you have any questions, please don't hesitate to contact us at madrasahabubakr1@gmail.com

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

