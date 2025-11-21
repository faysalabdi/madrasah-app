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
    const { email } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
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

    // Find and delete the auth user
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers()
    const authUser = authUsers?.users.find(u => u.email?.toLowerCase() === email.trim().toLowerCase())

    if (authUser) {
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(authUser.id)
      if (deleteError) {
        console.error("Failed to delete auth user:", deleteError)
        return new Response(
          JSON.stringify({ error: deleteError.message || "Failed to delete auth user" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "User deleted successfully"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    )
  } catch (error: any) {
    console.error("Error deleting user:", error)
    return new Response(
      JSON.stringify({ error: error.message || "Failed to delete user" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})

