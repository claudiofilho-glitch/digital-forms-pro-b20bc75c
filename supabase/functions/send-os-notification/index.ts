import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const SMTP_USER = Deno.env.get("SMTP_USER")!;
const SMTP_PASS = Deno.env.get("SMTP_PASS")!;
const APP_URL = "https://digital-forms-pro.lovable.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EVENT_CONFIG: Record<string, {
  subject: (os: any) => string;
  body: (os: any) => string;
}> = {
  created: {
    subject: (os) => `✅ Nova OS #${os.order_number} criada`,
    body: (os) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0d9488;">Nova Ordem de Serviço</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Número</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">#${os.order_number}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Título</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${os.title}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Cliente</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${os.client_name || "—"}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Tipo</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${os.service_type || "—"}</td></tr>
          <tr><td style="padding: 8px;"><strong>Solicitante</strong></td><td style="padding: 8px;">${os.requester_name}</td></tr>
        </table>
        <a href="${APP_URL}/helpdesk/os/${os.id}" style="display: inline-block; background: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Ver OS no sistema</a>
      </div>
    `,
  },
  assigned: {
    subject: (os) => `🔧 OS #${os.order_number} atribuída a você`,
    body: (os) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0d9488;">OS Atribuída a Você</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Número</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">#${os.order_number}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Título</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${os.title}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Cliente</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${os.client_name || "—"}</td></tr>
          <tr><td style="padding: 8px;"><strong>Tipo</strong></td><td style="padding: 8px;">${os.service_type || "—"}</td></tr>
        </table>
        <a href="${APP_URL}/helpdesk/os/${os.id}" style="display: inline-block; background: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Abrir OS</a>
      </div>
    `,
  },
  escalated: {
    subject: (os) => `🚨 OS #${os.order_number} — Prioridade Urgente`,
    body: (os) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">⚠️ OS Escalada para Urgente</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Número</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">#${os.order_number}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Título</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${os.title}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Cliente</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${os.client_name || "—"}</td></tr>
          <tr><td style="padding: 8px;"><strong>Técnico</strong></td><td style="padding: 8px;">${os.assigned_name || "Não atribuído"}</td></tr>
        </table>
        <a href="${APP_URL}/helpdesk/os/${os.id}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Ver OS urgente</a>
      </div>
    `,
  },
  completed: {
    subject: (os) => `✔️ OS #${os.order_number} finalizada`,
    body: (os) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">✅ Ordem de Serviço Concluída</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Número</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">#${os.order_number}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Título</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${os.title}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Técnico</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${os.assigned_name || "—"}</td></tr>
          <tr><td style="padding: 8px;"><strong>Observações</strong></td><td style="padding: 8px;">${os.notes || "—"}</td></tr>
        </table>
        <a href="${APP_URL}/helpdesk/os/${os.id}" style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Ver detalhes</a>
      </div>
    `,
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { event, order, recipient_email } = await req.json();

    if (!event || !order || !recipient_email) {
      return new Response(JSON.stringify({ error: "Dados inválidos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const config = EVENT_CONFIG[event];
    if (!config) {
      return new Response(JSON.stringify({ error: "Evento desconhecido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 465,
        tls: true,
        auth: {
          username: SMTP_USER,
          password: SMTP_PASS,
        },
      },
    });

    await client.send({
      from: SMTP_USER,
      to: recipient_email,
      subject: config.subject(order),
      content: "Visualize este e-mail em um cliente compatível com HTML.",
      html: config.body(order),
    });

    await client.close();

    console.log(`Email enviado: evento=${event} para=${recipient_email} OS=${order.order_number}`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("SMTP error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
