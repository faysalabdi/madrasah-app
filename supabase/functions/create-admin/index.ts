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
    const { email, first_name, last_name } = await req.json()

    if (!email || !first_name || !last_name) {
      return new Response(
        JSON.stringify({ error: "Email, first name, and last name are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    // Check if admin already exists
    const { data: existingAdmin } = await supabaseAdmin
      .from("admins")
      .select("id")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle()

    if (existingAdmin) {
      return new Response(
        JSON.stringify({ error: "Admin with this email already exists" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Get the auth user ID if it exists
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers()
    const authUser = authUsers?.users.find(u => u.email?.toLowerCase() === email.trim().toLowerCase())

    // Create admin record
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from("admins")
      .insert({
        user_id: authUser?.id || null,
        email: email.trim().toLowerCase(),
        first_name: first_name,
        last_name: last_name,
      })
      .select()
      .single()

    if (adminError) {
      console.error("Supabase DB error:", adminError)
      return new Response(
        JSON.stringify({ error: adminError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Admin ${first_name} ${last_name} created successfully.`,
        admin: adminData,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    )
  } catch (error: any) {
    console.error("Error creating admin:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})

