import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Brand } from "@/components/chefbox/header";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import "@lovable.dev/cloud-auth-js/styles.css";
export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entre na sua conta | ChefBox" },
      { name: "description", content: "Acesse sua conta ChefBox com segurança." },
      { property: "og:title", content: "Entre na sua conta | ChefBox" },
      {
        property: "og:description",
        content: "Acesso para clientes e cozinheiras parceiras ChefBox.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Auth,
});
function Auth() {
  const [mode, setMode] = useState("login"),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [name, setName] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const navigate = useNavigate();
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Se houver uma conta, você receberá o link de recuperação.");
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { nome: name }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (data.session) await navigate({ to: "/gestao" });
        else toast.success("Confira seu e-mail para confirmar sua conta.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await navigate({ to: "/gestao" });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível entrar.");
    } finally {
      setBusy(false);
    }
  };
  const oauth = async (provider: "google" | "lovable") => {
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error(result.error.message);
      return;
    }
    if (!result.redirected) await navigate({ to: "/gestao" });
  };
  return (
    <main className="auth-page">
      <div className="auth-panel">
        <Brand />
        <h1>
          {mode === "signup"
            ? "Seu lugar à mesa."
            : mode === "forgot"
              ? "Recupere seu acesso."
              : "Bom ter você por aqui."}
        </h1>
        <p>
          {mode === "signup"
            ? "Crie sua conta e deixe a semana mais leve."
            : "Entre para acompanhar o ChefBox."}
        </p>
        <form onSubmit={submit}>
          {mode === "signup" && (
            <label className="field">
              Nome completo
              <input required value={name} onChange={(e) => setName(e.target.value)} />
            </label>
          )}
          <label className="field">
            E-mail
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          {mode !== "forgot" && (
            <label className="field">
              Senha
              <input
                type="password"
                minLength={8}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
            </label>
          )}
          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}
          <Button size="lg" disabled={busy} type="submit">
            {busy
              ? "Aguarde…"
              : mode === "signup"
                ? "Criar minha conta"
                : mode === "forgot"
                  ? "Enviar link de recuperação"
                  : "Entrar na minha conta"}
          </Button>
          {mode === "login" && (
            <Button variant="link" type="button" onClick={() => setMode("forgot")}>
              Esqueci minha senha
            </Button>
          )}
        </form>
        {mode !== "forgot" && (
          <div className="oauth-buttons">
            <Button variant="outline" onClick={() => oauth("google")}>
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
                />
              </svg>
              Continuar com Google
            </Button>
            <Button className="lovable-auth-button" onClick={() => oauth("lovable")}>
              Continuar com Lovable
            </Button>
          </div>
        )}
        <div className="auth-footer">
          <Button variant="link" onClick={() => setMode(mode === "signup" ? "login" : "signup")}>
            {mode === "signup" ? "Já tenho uma conta" : "Criar uma conta"}
          </Button>
          <Button variant="link" asChild>
            <Link to="/">Voltar ao ChefBox</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
