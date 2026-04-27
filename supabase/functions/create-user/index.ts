import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VALID_ROLES = ["admin", "administrative", "coordinator", "technician", "user"];

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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("create-user: missing Authorization header");
      throw new Error("Não autenticado");
    }

    const callerClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user: caller }, error: callerErr } = await callerClient.auth.getUser();
    if (callerErr || !caller) {
      console.error("create-user: getUser failed", callerErr);
      throw new Error("Não autenticado");
    }

    const { data: callerRoles, error: rolesErr } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin");
    if (rolesErr) {
      console.error("create-user: roles lookup failed", rolesErr);
      throw new Error("Erro ao validar permissão");
    }
    if (!callerRoles?.length) throw new Error("Sem permissão de administrador");

    const body = await req.json();
    const { email, password, full_name, role } = body;
    if (!email || !password || !full_name || !role) {
      throw new Error("Campos obrigatórios faltando (email, senha, nome, perfil)");
    }
    if (!VALID_ROLES.includes(role)) {
      throw new Error(`Perfil inválido: ${role}`);
    }
    if (password.length < 6) {
      throw new Error("A senha deve ter no mínimo 6 caracteres");
    }

    // Create user with auto-confirm
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });
    if (createError) {
      console.error("create-user: createUser failed", createError);
      // Friendlier message for common case
      const msg = createError.message?.toLowerCase().includes("already")
        ? "Já existe um operador com esse e-mail"
        : createError.message;
      throw new Error(msg);
    }
    if (!newUser?.user) throw new Error("Falha ao criar usuário");

    // The handle_new_user trigger creates profile + default 'user' role.
    // If role is not 'user', update it.
    if (role !== "user") {
      const { error: updateRoleErr } = await supabaseAdmin
        .from("user_roles")
        .update({ role })
        .eq("user_id", newUser.user.id);
      if (updateRoleErr) {
        console.error("create-user: role update failed", updateRoleErr);
        // Roll back: delete the just-created user to keep state consistent
        await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
        throw new Error(`Erro ao definir perfil: ${updateRoleErr.message}`);
      }
    }

    return new Response(JSON.stringify({ user: newUser.user }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("create-user error:", error?.message || error);
    return new Response(JSON.stringify({ error: error?.message || "Erro desconhecido" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
