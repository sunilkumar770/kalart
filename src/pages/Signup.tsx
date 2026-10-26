import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../data/store";
import { useApp } from "../context/AppContext";
import { Field } from "../components/ui";
import { IconArrowRight, IconCheck } from "../components/icons";

export default function Signup() {
  const { setUser, toast } = useApp();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [agree, setAgree] = useState(false);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const strength = (() => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
    if (/\d/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s; // 0..4
  })();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const e_: Record<string, string> = {};
    if (name.trim().length < 2) e_.name = "Please tell us your name.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e_.email = "That email doesn't look right.";
    if (pw.length < 8) e_.pw = "At least 8 characters.";
    if (pw !== pw2) e_.pw2 = "Passwords don't match.";
    if (!agree) e_.agree = "Please accept the terms to continue.";
    setErrs(e_);
    if (Object.keys(e_).length) { toast("error", "Please fix the highlighted fields."); return; }
    setBusy(true);
    try {
      // Demo registration: create a session directly (no server in this build).
      const user = { email: email.trim(), name: name.trim(), role: "customer" as const };
      sessionStorage.setItem("kalart-session", JSON.stringify(user));
      setUser(user);
      toast("success", `Welcome to KALART, ${user.name.split(" ")[0]}!`);
      nav("/shop");
    } finally { setBusy(false); }
  };

  return (
    <main id="main" className="container section">
      <div className="ka-auth stack" style={{ gap: "var(--sp-5)" }}>
        <header className="text-center">
          <p className="eyebrow ornament" style={{ justifyContent: "center", display: "flex" }}>Join KALART</p>
          <h1 style={{ margin: "8px 0 4px" }}>Create your account</h1>
          <p className="text-muted text-small" style={{ margin: 0 }}>Save favourites, track commissions, approve designs.</p>
        </header>

        <form className="card card--pad" onSubmit={submit} noValidate>
          <Field label="Full name" htmlFor="su-name" required error={errs.name}>
            <input id="su-name" autoComplete="name" className="input" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errs.name} />
          </Field>
          <Field label="Email" htmlFor="su-email" required error={errs.email}>
            <input id="su-email" type="email" autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errs.email} />
          </Field>
          <Field label="Password" htmlFor="su-pw" required hint="8+ characters with mixed case and a number." error={errs.pw}>
            <input id="su-pw" type="password" autoComplete="new-password" className="input" value={pw} onChange={(e) => setPw(e.target.value)} aria-invalid={!!errs.pw} aria-describedby="su-pw-hint pw-meter" />
            <div id="pw-meter" className="row" style={{ gap: 6 }} role="meter" aria-valuenow={strength} aria-valuemin={0} aria-valuemax={4} aria-label="Password strength">
              {[1, 2, 3, 4].map((i) => (
                <span key={i} style={{ height: 4, flex: 1, borderRadius: 2, background: i <= strength ? (strength >= 3 ? "var(--ka-success)" : "var(--ka-warning)") : "var(--ka-line)" }} />
              ))}
              <span className="text-small text-muted" style={{ minWidth: 52 }}>{["Too short", "Weak", "Fair", "Good", "Strong"][strength]}</span>
            </div>
          </Field>
          <Field label="Confirm password" htmlFor="su-pw2" required error={errs.pw2}>
            <input id="su-pw2" type="password" autoComplete="new-password" className="input" value={pw2} onChange={(e) => setPw2(e.target.value)} aria-invalid={!!errs.pw2} />
          </Field>
          <label className="row" style={{ gap: 10, cursor: "pointer", marginBottom: 4 }}>
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ width: 18, height: 18, accentColor: "var(--ka-indigo)" }} aria-invalid={!!errs.agree} />
            <span className="text-small">I agree to the <Link to="/legal/terms">terms</Link> and <Link to="/legal/privacy">privacy policy</Link>.</span>
          </label>
          {errs.agree && <p className="field-error" role="alert"><IconCheck size={0} />{errs.agree}</p>}
          <button className="btn btn--primary btn--block" style={{ marginTop: 10 }} disabled={busy}>
            {busy ? "Creating account…" : <>Create account <IconArrowRight size={15} /></>}
          </button>
          <p className="text-small text-muted text-center" style={{ marginTop: 14, marginBottom: 0 }}>
            Already registered? <Link to="/login">Sign in</Link> · Selling your craft? <Link to="/sell">Apply as an artisan</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
