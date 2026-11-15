import type { Tables } from "@/integrations/supabase/types";
export type Order = Tables<"pedidos">;
export type Cook = Tables<"cozinheiras">;
export type Notice = Tables<"notificacoes_log">;
export const labels: Record<string, string> = {
  aguardando_aprovacao: "Aguardando aprovação",
  aprovado: "Aprovado",
  em_preparo: "Em preparo",
  saiu_entrega: "Saiu para entrega",
  pronto_retirada: "Pronto para retirada",
  concluido: "Concluído",
};
export const money = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const price = (line: string, qty: number) =>
  Math.round((line === "fit" ? 25.9 : 21.9) * qty * 100) / 100;
export const nextStatus = (order: Pick<Order, "status" | "tipo_recebimento">) =>
  ({
    aguardando_aprovacao: "aprovado",
    aprovado: "em_preparo",
    em_preparo: order.tipo_recebimento === "entrega" ? "saiu_entrega" : "pronto_retirada",
    saiu_entrega: "concluido",
    pronto_retirada: "concluido",
  })[order.status] ?? null;
export const cookOrders = (orders: Order[], id: string) =>
  orders.filter((o) => o.cozinheira_id === id && o.status !== "aguardando_aprovacao");
export const demoCooks: [Cook, Cook] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    nome: "Dona Maria",
    email: "maria@example.com",
    telefone: "11900000001",
    especialidade: "caseira",
    ponto_retirada: "Vila Mariana — demonstração",
    capacidade: 100,
    ativo: true,
    user_id: null,
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    nome: "Chef Ana",
    email: "ana@example.com",
    telefone: "11900000002",
    especialidade: "fit",
    ponto_retirada: "Pinheiros — demonstração",
    capacidade: 80,
    ativo: true,
    user_id: null,
  },
];
export const demoOrders: Order[] = ["Camila Oliveira", "Rafael Santos", "Juliana Costa"].map(
  (nome, i) => ({
    id: `demo-10${i + 1}`,
    user_id: null,
    cliente_nome: nome,
    cliente_email: `cliente${i + 1}@example.com`,
    cliente_telefone: "11900000101",
    linha: i === 1 ? "fit" : "caseira",
    qtd_marmitas: i === 0 ? 5 : 10,
    restricoes: i === 1 ? ["Sem lactose"] : i === 2 ? ["Sem carne vermelha"] : [],
    tipo_recebimento: i === 1 ? "retirada" : "entrega",
    endereco: "Rua de exemplo, 120",
    bairro: "Vila Mariana",
    valor_total: price(i === 1 ? "fit" : "caseira", i === 0 ? 5 : 10),
    status: ["aguardando_aprovacao", "aprovado", "em_preparo"][i] ?? "aguardando_aprovacao",
    cozinheira_id: demoCooks[i === 1 ? 1 : 0].id,
    created_at: "2026-11-14T10:00:00Z",
  }),
);
export function noticesFor(o: Order, cook?: Cook): Omit<Notice, "id" | "enviado_em">[] {
  const text =
    o.status === "aguardando_aprovacao"
      ? `Novo pedido recebido de ${o.cliente_nome}! Aguardando sua aprovação.`
      : o.status === "aprovado"
        ? "Seu pedido foi confirmado e já entrou na programação!"
        : o.status === "em_preparo"
          ? `Suas marmitas já estão sendo preparadas com carinho pela ${cook?.nome ?? "cozinheira"}.`
          : o.status === "pronto_retirada"
            ? "Seu pedido está pronto para ser retirado no local!"
            : o.status === "saiu_entrega"
              ? "O motoboy acabou de sair com o seu pedido! Chegará em breve."
              : "Pedido concluído. Bom apetite!";
  const recipients =
    o.status === "aguardando_aprovacao"
      ? ["Administradora"]
      : [
          o.cliente_email,
          o.cliente_telefone,
          ...(o.status === "aprovado" && cook ? [cook.email] : []),
          ...(o.status === "pronto_retirada" || o.status === "saiu_entrega"
            ? ["Administradora"]
            : []),
        ];
  return recipients.map((r, i) => ({
    pedido_id: o.id,
    tipo: i === 1 ? "whatsapp" : "email",
    destinatario: r,
    assunto: labels[o.status] ?? o.status,
    conteudo: r === cook?.email ? "Novo pedido liberado para sua cozinha!" : text,
    status: "simulado",
  }));
}
