import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Field } from "../components/ui";
import { ARTISANS } from "../data/store";
import { useApp } from "../context/AppContext";
import { IconArrowRight, IconCheck, IconChat, IconMail, IconPin, IconShield } from "../components/icons";

export function About() {
  return (
    <main id="main" className="container section--tight">
      <nav className="ka-crumbs" aria-label="Breadcrumb"><Link to="/">Home</Link> / <span aria-current="page">Our story</span></nav>
      <header style={{ paddingBlock: "var(--sp-4)", maxWidth: "62ch" }}>
        <p className="eyebrow ornament" style={{ display: "flex", justifyContent: "flex-start" }}>Since 2024 · Bengaluru</p>
        <h1>KALART exists so that craft pays.</h1>
        <p className="lede">
          India's handmade sectors are rich in skill and poor in margins. Middlemen take most of what customers pay;
          makers rarely see a photograph of the home their work ended up in. We built KALART to invert that: artisans set
          prices, keep 85%, approve every customisation themselves, and get paid 50% upfront before they start.
        </p>
      </header>
      <img src="/img/story-workshop.jpg" alt="A weaver at a pit loom, threads dyed with natural indigo" width={1600} height={900} fetchPriority="high"
        style={{ borderRadius: "var(--r-lg)", aspectRatio: "21/9", objectFit: "cover", marginBlock: "var(--sp-5)" }} />
      <div className="grid grid-p3">
        {[
          ["Verified, not scraped", "We visit every workshop. Profiles publish what our team saw, photographed and cross-checked against GI-cluster records."],
          ["Honest previews", "AI previews are always labelled as visualisations. A human artisan signs off feasibility and final cost before production begins."],
          ["Pricing transparency", "The listing shows the maker's share, materials, and lead time. No fake MRPs, no festival discount theatre."],
        ].map(([t, b]) => (
          <section key={t} className="card card--pad">
            <h2 style={{ fontSize: "1.05rem" }}>{t}</h2>
            <p className="text-small text-muted" style={{ margin: 0 }}>{b}</p>
          </section>
        ))}
      </div>
      <section className="band-cream" style={{ marginInline: "calc(50% - 50vw)", paddingInline: "calc(50vw - 50%)", marginTop: "var(--sp-7)" }}>
        <div className="container" style={{ paddingBlock: "var(--sp-6)" }}>
          <h2 style={{ fontSize: "1.3rem" }}>Numbers we publish yearly</h2>
          <div className="grid grid-p4">
            {[[`${ARTISANS.length}`, "partner workshops"], ["₹2.4 Cr", "paid to makers in 2026"], ["91%", "orders delivered on stated date"], ["4.8★", "median artisan rating"]].map(([n, l]) => (
              <div key={l}><strong style={{ fontFamily: "var(--font-display)", fontSize: "1.9rem", color: "var(--ka-clay)" }} className="mono-num">{n}</strong><p className="text-small text-muted" style={{ margin: 0 }}>{l}</p></div>
            ))}
          </div>
        </div>
      </section>
      <div className="text-center" style={{ marginTop: "var(--sp-6)" }}>
        <Link to="/artisans" className="btn btn--primary">Meet the artisans <IconArrowRight size={15} /></Link>
      </div>
    </main>
  );
}

export function Help() {
  const { toast } = useApp();
  const nav = useNavigate();
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: "", email: "", topic: "Orders & delivery", message: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!form.name.trim()) er.name = "Please add your name.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) er.email = "A valid email lets us reply.";
    if (form.message.trim().length < 10) er.message = "Tell us a little more (10+ characters).";
    setErrs(er);
    if (Object.keys(er).length) { toast("error", "Please fix the highlighted fields."); return; }
    setBusy(true);
    setTimeout(() => { // simulated ticket creation — clearly labelled below
      setBusy(false); setSent(true); toast("success", "Message received — replies within one working day.");
    }, 700);
  };

  return (
    <main id="main" className="container section--tight">
      <nav className="ka-crumbs" aria-label="Breadcrumb"><Link to="/">Home</Link> / <span aria-current="page">Help</span></nav>
      <h1 style={{ marginBlock: "var(--sp-4) var(--sp-5)" }}>Help &amp; contact</h1>
      <div className="ka-shop" style={{ gridTemplateColumns: "minmax(0,1fr) 360px" }}>
        <div className="stack" style={{ gap: "var(--sp-4)" }}>
          {[
            ["Where is my order?", "Open My orders → your order shows a live production timeline updated by the artisan. Shipped orders include courier tracking.", "/account/orders"],
            ["Can I change a customisation after approving?", "Yes — until the artisan marks production started. Request a revision from the order page; pricing may adjust and be re-confirmed.", "/account/orders"],
            ["Are previews accurate?", "Previews are AI-assisted visualisations, always labelled. The artisan reviews feasibility and confirms before anything is made.", "/customize"],
            ["Returns", "Standard pieces: 14 days. Customised work: accepted only if it differs from your approved preview or arrives damaged.", "/legal/returns"],
          ].map(([q, a, link]) => (
            <details key={q} className="card card--pad">
              <summary style={{ fontWeight: 650, color: "var(--ka-charcoal)", cursor: "pointer" }}>{q}</summary>
              <p className="text-small text-muted" style={{ margin: "10px 0 0" }}>{a} <Link to={link}>Go there →</Link></p>
            </details>
          ))}
        </div>
        <aside className="card card--pad stack" aria-labelledby="contact-h">
          <h2 id="contact-h" style={{ fontSize: "1.05rem", margin: 0 }}>Write to us</h2>
          {sent ? (
            <div className="stack" role="status">
              <span className="badge badge--success" style={{ alignSelf: "flex-start" }}><IconCheck size={12} /> Ticket created</span>
              <p className="text-small text-muted" style={{ margin: 0 }}>Reference HLP-{Math.floor(1000 + Math.random() * 9000)}. A reply goes to {form.email}.</p>
              <button className="btn btn--outline btn--sm" onClick={() => { setSent(false); setForm({ ...form, message: "" }); }}>Send another</button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="stack" style={{ gap: 0 }}>
              <Field label="Name" htmlFor="hp-name" required error={errs.name}>
                <input id="hp-name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="Email" htmlFor="hp-email" required error={errs.email}>
                <input id="hp-email" type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
              <Field label="Topic" htmlFor="hp-topic">
                <select id="hp-topic" className="select" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}>
                  {["Orders & delivery", "Customisation", "Artisan partnership", "Payments & refunds", "Something else"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Message" htmlFor="hp-msg" required error={errs.message}>
                <textarea id="hp-msg" className="textarea" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} aria-invalid={!!errs.message} />
              </Field>
              <button className="btn btn--primary btn--block" disabled={busy}>{busy ? "Sending…" : <><IconMail size={15} /> Send message</>}</button>
              <p className="text-small text-muted row" style={{ gap: 6, margin: "10px 0 0" }}><IconShield size={13} /> Demo build: tickets are recorded locally, not emailed.</p>
            </form>
          )}
          <hr className="divider" />
          <p className="text-small text-muted row" style={{ gap: 8, margin: 0 }}><IconChat size={15} /> Craft managers reply Mon–Sat, 9–18 IST.</p>
          <p className="text-small text-muted row" style={{ gap: 8, margin: 0 }}><IconPin size={15} /> Support desk: 4th Cross, Malleshwaram, Bengaluru 560003</p>
        </aside>
      </div>
    </main>
  );
}

export function Sell() {
  const { toast } = useApp();
  const nav = useNavigate();
  const [done, setDone] = useState(false);
  return (
    <main id="main" className="container section">
      <div className="ka-split">
        <div>
          <p className="eyebrow">For makers</p>
          <h1>Sell your craft on your terms.</h1>
          <ul className="stack" style={{ paddingLeft: 20, gap: 10 }}>
            <li><strong>85% revenue share</strong>, paid twice monthly, plus 50% advance on commissions.</li>
            <li>You define which customisations you accept — and pause them during festivals or monsoon.</li>
            <li>A craft manager photographs your workshop and writes nothing you didn't say.</li>
            <li>Free verification: GI-cluster cross-check, authenticity card printing, shipping pickups.</li>
          </ul>
          <p className="text-small text-muted">Onboarding takes about two weeks: application → workshop photos → catalogue upload → first listing live.</p>
        </div>
        <div className="card card--pad">
          {done ? (
            <div className="stack text-center" role="status">
              <span className="badge badge--success" style={{ alignSelf: "center" }}><IconCheck size={12} /> Application received</span>
              <p className="text-small text-muted" style={{ margin: 0 }}>A craft manager will call within two working days. Meanwhile, explore how the workspace works using the demo artisan login.</p>
              <button className="btn btn--outline btn--sm" onClick={() => nav("/login")}>Try the artisan workspace</button>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setDone(true); toast("success", "Application submitted."); }} className="stack" style={{ gap: 0 }}>
              <h2 style={{ fontSize: "1.1rem", marginTop: 0 }}>Apply as an artisan partner</h2>
              <Field label="Full name" htmlFor="sl-name" required><input id="sl-name" className="input" autoComplete="name" /></Field>
              <Field label="Primary craft" htmlFor="sl-craft" required>
                <select id="sl-craft" className="select">{["Weaving", "Block printing", "Pottery", "Metal / jewellery", "Woodwork", "Embroidery", "Painting", "Basketry"].map((c) => <option key={c}>{c}</option>)}</select>
              </Field>
              <Field label="Village / town & state" htmlFor="sl-loc" required><input id="sl-loc" className="input" /></Field>
              <Field label="Mobile number" htmlFor="sl-phone" required hint="Craft managers call — WhatsApp works too."><input id="sl-phone" type="tel" className="input" inputMode="numeric" /></Field>
              <Field label="Years practising & family/workshop background" htmlFor="sl-story"><textarea id="sl-story" className="textarea" rows={3} /></Field>
              <button className="btn btn--primary btn--block" type="submit">Submit application <IconArrowRight size={15} /></button>
              <p className="text-small text-muted" style={{ margin: "10px 0 0" }}>Demo build: submissions are stored locally for review flow testing.</p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
