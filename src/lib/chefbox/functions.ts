import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { nextStatus, noticesFor, price } from "./domain";
export const orderSchema = z
  .object({
    cliente_nome: z.string().trim().min(3).max(120),
    cliente_email: z.string().email().max(200),
    cliente_telefone: z.string().regex(/^\d{10,13}$/),
    linha: z.enum(["caseira", "fit"]),
    qtd_marmitas: z.union([z.literal(5), z.literal(10)]),
    restricoes: z.array(z.enum(["Sem glúten", "Sem lactose", "Sem carne vermelha"])).max(3),
    tipo_recebimento: z.enum(["entrega", "retirada"]),
    endereco: z.string().max(250),
    bairro: z.string().max(100),
  })
  .refine(
    (d) =>
      d.tipo_recebimento === "retirada" ||
      (d.endereco.trim().length >= 5 && d.bairro.trim().length >= 2),
    "Informe endereço e bairro para entrega.",
  );
export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator(orderSchema)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: cook } = await supabaseAdmin
      .from("cozinheiras")
      .select("*")
      .eq("especialidade", data.linha)
      .eq("ativo", true)
      .order("nome")
      .limit(1)
      .maybeSingle();
    const { data: order, error } = await supabaseAdmin
      .from("pedidos")
      .insert({
        ...data,
        valor_total: price(data.linha, data.qtd_marmitas),
        cozinheira_id: cook?.id ?? null,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    const { error: logError } = await supabaseAdmin
      .from("notificacoes_log")
      .insert(noticesFor(order, cook ?? undefined));
    if (logError) console.error("Notification log:", logError.message);
    return { id: order.id };
  });
export const managementData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: roles, error: roleError } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (roleError) throw new Error(roleError.message);
    const role = roles?.some((r) => r.role === "admin")
      ? "admin"
      : roles?.some((r) => r.role === "cook")
        ? "cook"
        : "user";
    if (role === "user") return { role, orders: [], cooks: [], notices: [] };
    const [o, c, n] = await Promise.all([
      context.supabase.from("pedidos").select("*").order("created_at", { ascending: false }),
      context.supabase.from("cozinheiras").select("*"),
      role === "admin"
        ? context.supabase
            .from("notificacoes_log")
            .select("*")
            .order("enviado_em", { ascending: false })
            .limit(100)
        : Promise.resolve({ data: [], error: null }),
    ]);
    for (const r of [o, c, n]) if (r.error) throw new Error(r.error.message);
    return { role, orders: o.data ?? [], cooks: c.data ?? [], notices: n.data ?? [] };
  });
export const advanceOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), cookId: z.string().uuid().optional() }))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    const { data: o, error } = await context.supabase
      .from("pedidos")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error || !o) throw new Error("Pedido não encontrado.");
    const { data: c } = await context.supabase
      .from("cozinheiras")
      .select("*")
      .eq("id", data.cookId ?? o.cozinheira_id ?? "")
      .maybeSingle();
    if (
      !isAdmin &&
      (c?.user_id !== context.userId || !["aprovado", "em_preparo"].includes(o.status))
    )
      throw new Error("Acesso não autorizado.");
    const status = nextStatus(o);
    if (!status) throw new Error("Pedido já concluído.");
    if (status === "aprovado" && (!c || !c.ativo || c.especialidade !== o.linha))
      throw new Error("Selecione uma cozinheira ativa da mesma linha.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("pedidos")
      .update({ status, cozinheira_id: c?.id ?? o.cozinheira_id })
      .eq("id", o.id)
      .eq("status", o.status)
      .select("*")
      .single();
    if (updateError) throw new Error(updateError.message);
    const { error: logError } = await supabaseAdmin
      .from("notificacoes_log")
      .insert(noticesFor(updated, c ?? undefined));
    if (logError) console.error(logError.message);
    return updated;
  });
