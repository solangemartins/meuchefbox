import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  Check,
  Leaf,
  Utensils,
  Truck,
  MapPin,
  MessageCircle,
  ShieldCheck,
  QrCode,
  CreditCard,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { placeOrder } from "@/lib/chefbox/functions";
import { money, price } from "@/lib/chefbox/domain";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
export function Subscription() {
  const [line, setLine] = useState("caseira"),
    [qty, setQty] = useState(5),
    [delivery, setDelivery] = useState("entrega"),
    [restrictions, setRestrictions] = useState<string[]>([]),
    [checkout, setCheckout] = useState(false),
    [method, setMethod] = useState("pix"),
    [busy, setBusy] = useState(false),
    [order, setOrder] = useState<string | null>(null),
    [form, setForm] = useState({
      cliente_nome: "",
      cliente_email: "",
      cliente_telefone: "",
      endereco: "",
      bairro: "",
    });
  const submitOrder = useServerFn(placeOrder);
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chefbox_settings")
        .select("*")
        .eq("id", 1)
        .single();
      if (error) throw error;
      return data;
    },
  });
  const total = price(line, qty);
  const whatsapp = (text: string) => {
    if (!settings?.whatsapp) {
      toast.info("O WhatsApp de atendimento ainda não foi configurado.");
      return;
    }
    window.open(
      `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };
  const finalize = async () => {
    setBusy(true);
    try {
      const res = await submitOrder({
        data: {
          ...form,
          cliente_telefone: form.cliente_telefone.replace(/\D/g, ""),
          linha: line as "caseira" | "fit",
          qtd_marmitas: qty as 5 | 10,
          restricoes: restrictions as ("Sem glúten" | "Sem lactose" | "Sem carne vermelha")[],
          tipo_recebimento: delivery as "entrega" | "retirada",
        },
      });
      setOrder(res.id);
      toast.success("Pedido recebido! Aguardando aprovação.");
      whatsapp(
        `Olá! Acabei de fazer meu pedido #${res.id.slice(0, 8)} (Plano ${line === "fit" ? "Fit" : "Caseira"}, ${qty} marmitas). Segue o comprovante para confirmação e boas-vindas!`,
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível salvar o pedido.");
    } finally {
      setBusy(false);
    }
  };
  const field = (key: keyof typeof form, label: string, type = "text") => (
    <label className="field">
      {label}
      <input
        required
        value={form[key]}
        type={type}
        minLength={key === "cliente_telefone" ? 10 : key === "cliente_nome" ? 3 : undefined}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
    </label>
  );
  return (
    <section id="planos" className="subscription-section">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">DO SEU JEITO, NA SUA ROTINA</span>
          <h2>Uma semana mais leve começa aqui.</h2>
          <p>Monte seu box. A gente cuida do resto.</p>
        </div>
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            setCheckout(true);
          }}
          className="subscription-layout"
        >
          <div className="subscription-options">
            <h3>
              <span className="step-number">1</span> Escolha sua linha
            </h3>
            <div className="option-grid">
              {[
                ["caseira", "Caseira Tradicional", "O gostinho de comida de casa.", Utensils],
                ["fit", "Fit & Low Carb", "Equilíbrio sem abrir mão do sabor.", Leaf],
              ].map(([v, title, sub, Icon]) => {
                const I = Icon as typeof Leaf;
                return (
                  <Button
                    key={String(v)}
                    type="button"
                    variant="outline"
                    className={`choice-card ${line === v ? "selected" : ""}`}
                    onClick={() => setLine(String(v))}
                  >
                    <I />
                    <span>
                      <strong>{String(title)}</strong>
                      <small>{String(sub)}</small>
                    </span>
                    <span className="choice-radio">{line === v && <Check size={12} />}</span>
                  </Button>
                );
              })}
            </div>
            <h3>
              <span className="step-number">2</span> Quantas refeições por semana?
            </h3>
            <div className="option-grid">
              {[5, 10].map((q) => (
                <Button
                  type="button"
                  key={q}
                  variant="outline"
                  className={`choice-card ${qty === q ? "selected" : ""}`}
                  onClick={() => setQty(q)}
                >
                  <span>
                    <strong>{q} refeições</strong>
                    <small>
                      {q === 5 ? "Seu almoço, de segunda a sexta." : "Almoço e jantar resolvidos."}
                    </small>
                  </span>
                  <span className="choice-radio">{qty === q && <Check size={12} />}</span>
                </Button>
              ))}
            </div>
            <h3>
              <span className="step-number">3</span> Alguma preferência alimentar?{" "}
              <small>Opcional</small>
            </h3>
            <div className="restriction-row">
              {["Sem glúten", "Sem lactose", "Sem carne vermelha"].map((r) => (
                <label key={r}>
                  <input
                    type="checkbox"
                    checked={restrictions.includes(r)}
                    onChange={() =>
                      setRestrictions(
                        restrictions.includes(r)
                          ? restrictions.filter((s) => s !== r)
                          : [...restrictions, r],
                      )
                    }
                  />
                  {r}
                </label>
              ))}
            </div>
            <h3>
              <span className="step-number">4</span> Como quer receber?
            </h3>
            <div className="option-grid">
              {[
                ["entrega", "Entrega em casa", Truck],
                ["retirada", "Retirada no local", MapPin],
              ].map(([v, t, Icon]) => {
                const I = Icon as typeof Truck;
                return (
                  <Button
                    type="button"
                    key={String(v)}
                    variant="outline"
                    className={`choice-card ${delivery === v ? "selected" : ""}`}
                    onClick={() => setDelivery(String(v))}
                  >
                    <I />
                    <strong>{String(t)}</strong>
                    <span className="choice-radio">{delivery === v && <Check size={12} />}</span>
                  </Button>
                );
              })}
            </div>
            {delivery === "entrega" ? (
              <div className="form-grid">
                {field("endereco", "Endereço completo")}
                {field("bairro", "Bairro")}
              </div>
            ) : (
              <p className="pickup-note">
                <MapPin size={16} />
                {settings?.retirada ?? "Ponto de retirada a confirmar"}
              </p>
            )}
            <h3>
              <span className="step-number">5</span> Vamos conhecer você
            </h3>
            <div className="form-grid">
              {field("cliente_nome", "Nome completo")}
              {field("cliente_email", "E-mail", "email")}
              {field("cliente_telefone", "WhatsApp com DDD", "tel")}
            </div>
          </div>
          <aside className="order-summary">
            <div className="summary-icon">
              <ChefBoxIcon />
            </div>
            <h3>Seu próximo ChefBox</h3>
            <p>Comida de verdade. Tempo para você.</p>
            <div className="summary-row">
              <span>Linha</span>
              <strong>{line === "fit" ? "Fit & Low Carb" : "Caseira Tradicional"}</strong>
            </div>
            <div className="summary-row">
              <span>Refeições</span>
              <strong>{qty} por semana</strong>
            </div>
            <div className="summary-row">
              <span>Recebimento</span>
              <strong>{delivery === "entrega" ? "Em casa" : "Retirada"}</strong>
            </div>
            <div className="summary-total">
              <span>Total semanal</span>
              <strong>{money(total)}</strong>
              <small>{money(total / qty)} por refeição · entrega a confirmar</small>
            </div>
            <div className="summary-row">
              <span>Estimativa mensal (4 semanas)</span>
              <strong>{money(total * 4)}</strong>
            </div>
            <Button variant="warm" size="lg" type="submit" className="w-full">
              Montar minha assinatura
              <ArrowRight />
            </Button>
            <span className="payment-note">
              <ShieldCheck size={14} /> Checkout demonstrativo · Sem cobrança real
            </span>
            <Button
              type="button"
              variant="ghost"
              className="w-full support-button"
              onClick={() =>
                whatsapp(
                  "Olá! Estava montando meu plano no ChefBox e gostaria de tirar uma dúvida sobre os pratos.",
                )
              }
            >
              <MessageCircle />
              Tirar dúvidas antes de assinar
            </Button>
          </aside>
        </form>
      </div>
      <Dialog open={checkout} onOpenChange={setCheckout}>
        <DialogContent>
          <DialogTitle>
            {order ? "Seu box está a caminho da aprovação!" : "Finalize sua assinatura"}
          </DialogTitle>
          <DialogDescription>
            {order
              ? `Pedido #${order.slice(0, 8)} recebido. Você será avisado após a confirmação.`
              : "Pagamento simulado. Nenhum valor será cobrado e não solicitamos dados bancários."}
          </DialogDescription>
          {!order && (
            <>
              <div className="option-grid">
                <Button
                  variant={method === "pix" ? "default" : "outline"}
                  onClick={() => setMethod("pix")}
                >
                  <QrCode />
                  PIX
                </Button>
                <Button
                  variant={method === "card" ? "default" : "outline"}
                  onClick={() => setMethod("card")}
                >
                  <CreditCard />
                  Cartão
                </Button>
              </div>
              <div className="simulated-payment">
                {method === "pix" ? <QrCode size={100} /> : <CreditCard size={70} />}
                <strong>{money(total)}</strong>
                <span>
                  {method === "pix"
                    ? "PIX demonstrativo · não pagável"
                    : "Cartão de demonstração · aprovado para teste"}
                </span>
              </div>
              <Button variant="warm" disabled={busy} onClick={finalize}>
                {busy ? "Salvando pedido…" : "Simular pagamento e assinar"}
                <ArrowRight />
              </Button>
            </>
          )}
          {order && <Button onClick={() => setCheckout(false)}>Continuar no ChefBox</Button>}
        </DialogContent>
      </Dialog>
    </section>
  );
}
function ChefBoxIcon() {
  return <Utensils size={25} />;
}
