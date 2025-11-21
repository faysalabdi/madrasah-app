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
    const { first_name, last_name, email, mobile, password } = await req.json()

    if (!first_name || !last_name || !email || !password) {
      return new Response(
        JSON.stringify({ error: "First name, last name, email, and password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 6 characters long" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Create user in Auth using admin client (bypasses email confirmation)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: password,
      email_confirm: true, // Auto-confirm email so no confirmation needed
    })

    if (authError) {
      console.error("Auth error:", authError)
      return new Response(
        JSON.stringify({ error: authError.message || "Failed to create user account" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: "Failed to create user account" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Create teacher record in database
    const { data: teacherData, error: teacherError } = await supabaseAdmin
      .from("teachers")
      .insert({
        first_name,
        last_name,
        email: email.trim().toLowerCase(),
        mobile: mobile || null,
      })
      .select()
      .single()

    if (teacherError) {
      // If teacher creation fails, try to clean up the auth user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return new Response(
        JSON.stringify({ error: teacherError.message || "Failed to create teacher record" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        teacher: teacherData,
        message: `Teacher ${first_name} ${last_name} created successfully. They can now log in with their email and password.`
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    )
  } catch (error: any) {
    console.error("Error creating teacher:", error)
    return new Response(
      JSON.stringify({ error: error.message || "Failed to create teacher" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})

