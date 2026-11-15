import { describe, it, expect } from "vitest";
import { cookOrders, demoOrders, demoCooks, nextStatus, price, noticesFor } from "./domain";
import { orderSchema } from "./functions";
describe("ChefBox rules", () => {
  const first = demoOrders[0];
  if (!first) throw new Error("Missing order fixture");
  it("only accepts 5 or 10 meals", () => {
    expect(orderSchema.safeParse({ ...first, qtd_marmitas: 7 }).success).toBe(false);
    expect(orderSchema.safeParse(first).success).toBe(true);
  });
  it("new orders first need approval", () => {
    expect(nextStatus({ status: "aguardando_aprovacao", tipo_recebimento: "entrega" })).toBe(
      "aprovado",
    );
  });
  it("cook only sees approved orders", () => {
    expect(cookOrders(demoOrders, first.cozinheira_id ?? "").map((o) => o.cliente_nome)).toEqual([
      "Juliana Costa",
    ]);
  });
  it("pickup and delivery have distinct ready states", () => {
    expect(nextStatus({ status: "em_preparo", tipo_recebimento: "retirada" })).toBe(
      "pronto_retirada",
    );
    expect(nextStatus({ status: "em_preparo", tipo_recebimento: "entrega" })).toBe("saiu_entrega");
  });
  it("notifies cook after approval", () => {
    expect(
      noticesFor(
        { ...first, status: "aprovado" },
        { ...demoCooks[0], email: "cook@example.com" },
      ).some((n) => n.destinatario === "cook@example.com"),
    ).toBe(true);
  });
  it("calculates example weekly prices", () => {
    expect(price("caseira", 5)).toBe(109.5);
    expect(price("fit", 10)).toBe(259);
  });
});
