import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization")!;
    const callerClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) throw new Error("Não autenticado");

    const { data: callerRoles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin");
    if (!callerRoles?.length) throw new Error("Sem permissão de administrador");

    const body = await req.json();
    const { action } = body;

    if (action === "update") {
      const { user_id, full_name, phone } = body;
      if (!user_id) throw new Error("user_id é obrigatório");

      // Update profile
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({ full_name: full_name || "", phone: phone || null })
        .eq("user_id", user_id);
      if (profileError) throw profileError;

      // Update auth user metadata
      await supabaseAdmin.auth.admin.updateUserById(user_id, {
        user_metadata: { full_name: full_name || "" },
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete") {
      const { user_id } = body;
      if (!user_id) throw new Error("user_id é obrigatório");
      if (user_id === caller.id) throw new Error("Você não pode excluir a si mesmo");

      // Unassign from service orders
      await supabaseAdmin
        .from("service_orders")
        .update({ assigned_to: null, assigned_name: "" })
        .eq("assigned_to", user_id);

      // Delete user roles
      await supabaseAdmin.from("user_roles").delete().eq("user_id", user_id);
      
      // Delete profile
      await supabaseAdmin.from("profiles").delete().eq("user_id", user_id);

      // Delete auth user
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user_id);
      if (deleteError) throw deleteError;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Ação inválida. Use 'update' ou 'delete'.");
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
