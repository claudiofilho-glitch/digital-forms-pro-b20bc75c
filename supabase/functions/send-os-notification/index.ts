import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const FROM_EMAIL = "Interative <onboarding@resend.dev>";
const APP_URL = "https://digital-forms-pro.lovable.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const baseStyles = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
  color: #1f2937;
`;

const tableStyles = `width: 100%; border-collapse: collapse; margin: 16px 0;`;
const cellLabel = `padding: 8px 12px; background: #f3f4f6; font-weight: 600; border: 1px solid #e5e7eb; width: 35%;`;
const cellValue = `padding: 8px 12px; border: 1px solid #e5e7eb;`;
const buttonStyles = (color: string) => `
  display: inline-block;
  background: ${color};
  color: #ffffff;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 600;
  margin-top: 16px;
`;

function renderRows(rows: Array<[string, string]>): string {
  return rows
    .map(
      ([label, value]) =>
        `<tr><td style="${cellLabel}">${label}</td><td style="${cellValue}">${value}</td></tr>`
    )
    .join("");
}

const EVENT_CONFIG: Record<
  string,
  { subject: (os: any) => string; body: (os: any) => string }
> = {
  created: {
    subject: (os) => `✅ Nova OS #${os.order_number} criada`,
    body: (os) => `
      <div style="${baseStyles}">
        <h2 style="color: #0d9488; margin-bottom: 8px;">Nova Ordem de Serviço</h2>
        <table style="${tableStyles}">
          ${renderRows([
            ["Número", `#${os.order_number}`],
            ["Título", os.title || "—"],
            ["Cliente", os.client_name || "—"],
            ["Tipo", os.attendance_type || "—"],
            ["Solicitante", os.requester_name || "—"],
          ])}
        </table>
        <a href="${APP_URL}/os/${os.id}" style="${buttonStyles("#0d9488")}">Ver OS no sistema</a>
      </div>
    `,
  },
  assigned: {
    subject: (os) => `🔧 OS #${os.order_number} atribuída a você`,
    body: (os) => `
      <div style="${baseStyles}">
        <h2 style="color: #0d9488; margin-bottom: 8px;">OS Atribuída a Você</h2>
        <table style="${tableStyles}">
          ${renderRows([
            ["Número", `#${os.order_number}`],
            ["Título", os.title || "—"],
            ["Cliente", os.client_name || "—"],
            ["Tipo", os.attendance_type || "—"],
          ])}
        </table>
        <a href="${APP_URL}/os/${os.id}" style="${buttonStyles("#0d9488")}">Abrir OS</a>
      </div>
    `,
  },
  escalated: {
    subject: (os) => `🚨 OS #${os.order_number} — Prioridade Urgente`,
    body: (os) => `
      <div style="${baseStyles}">
        <h2 style="color: #dc2626; margin-bottom: 8px;">⚠️ OS Escalada para Urgente</h2>
        <table style="${tableStyles}">
          ${renderRows([
            ["Número", `#${os.order_number}`],
            ["Título", os.title || "—"],
            ["Cliente", os.client_name || "—"],
            ["Técnico", os.assigned_name || "Não atribuído"],
          ])}
        </table>
        <a href="${APP_URL}/os/${os.id}" style="${buttonStyles("#dc2626")}">Ver OS urgente</a>
      </div>
    `,
  },
  completed: {
    subject: (os) => `✔️ OS #${os.order_number} finalizada`,
    body: (os) => `
      <div style="${baseStyles}">
        <h2 style="color: #16a34a; margin-bottom: 8px;">✅ Ordem de Serviço Concluída</h2>
        <table style="${tableStyles}">
          ${renderRows([
            ["Número", `#${os.order_number}`],
            ["Título", os.title || "—"],
            ["Técnico", os.assigned_name || "—"],
            ["Observações", os.notes || "—"],
          ])}
        </table>
        <a href="${APP_URL}/os/${os.id}" style="${buttonStyles("#16a34a")}">Ver detalhes</a>
      </div>
    `,
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY não configurada");

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

    const res = await fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": RESEND_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [recipient_email],
        subject: config.subject(order),
        html: config.body(order),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Resend gateway error:", res.status, data);
      throw new Error(`Resend [${res.status}]: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-os-notification error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
