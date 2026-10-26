import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api, DEMO_ACCOUNTS } from "../data/store";
import { useApp } from "../context/AppContext";
import { Field } from "../components/ui";
import { IconArrowRight, IconInfo } from "../components/icons";

export default function Login() {
  const [params] = useSearchParams();
  const next = params.get("next") ?? "/account/orders";
  const { setUser, toast } = useApp();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      const u = await api.login(email, pw);
      setUser(u);
      toast("success", `Welcome back, ${u.name.split(" ")[0]}.`);
      nav(u.role === "admin" ? "/admin" : u.role === "artisan" ? "/artisan" : next);
    } catch (ex: any) {
      setErr(ex.message ?? "Login failed.");
    } finally { setBusy(false); }
  };

  return (
    <main id="main" className="container section">
      <div className="ka-auth stack" style={{ gap: "var(--sp-5)" }}>
        <header className="text-center">
          <p className="eyebrow ornament" style={{ justifyContent: "center", display: "flex" }}>Welcome back</p>
          <h1 style={{ margin: "8px 0 4px" }}>Sign in to KALART</h1>
          <p className="text-muted text-small" style={{ margin: 0 }}>Track orders, saved pieces and customisation approvals.</p>
        </header>

        <form className="card card--pad" onSubmit={submit} noValidate aria-describedby="login-note">
          <Field label="Email" htmlFor="li-email" required error={err && !email ? err : undefined}>
            <input id="li-email" type="email" autoComplete="email" className="input" value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </Field>
          <Field label="Password" htmlFor="li-pw" required>
            <input id="li-pw" type="password" autoComplete="current-password" className="input" value={pw}
              onChange={(e) => setPw(e.target.value)} />
          </Field>
          {err && (
            <p className="field-error" role="alert" style={{ marginBottom: 12 }}><IconInfo size={14} /> {err}</p>
          )}
          <button className="btn btn--primary btn--block" disabled={busy}>{busy ? "Signing in…" : <>Sign in <IconArrowRight size={15} /></>}</button>
          <p className="text-small text-muted text-center" style={{ marginTop: 14, marginBottom: 0 }}>
            New here? <Link to="/signup">Create an account</Link>
          </p>
        </form>

        <aside className="card card--pad" id="login-note" aria-labelledby="demo-h" style={{ background: "var(--ka-cream)", borderStyle: "dashed" }}>
          <h2 id="demo-h" style={{ fontSize: "0.95rem", marginTop: 0 }}>Demo accounts (password: <code>demo1234</code>)</h2>
          <ul className="stack" style={{ listStyle: "none", margin: 0, padding: 0, gap: 8, fontSize: "0.88rem" }}>
            {DEMO_ACCOUNTS.map((a) => (
              <li key={a.email} className="row row--between" style={{ gap: 8 }}>
                <span><strong>{a.role}</strong> · {a.email}</span>
                <button className="btn btn--ghost btn--sm" onClick={() => { setEmail(a.email); setPw("demo1234"); }}>Use</button>
              </li>
            ))}
          </ul>
          <p className="text-small text-muted" style={{ margin: "10px 0 0" }}>
            Authentication here is a clearly-labelled demo layer backed by local storage — not real credential security.
          </p>
        </aside>
      </div>
    </main>
  );
}
