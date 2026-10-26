import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, ARTISANS, PRODUCTS, type PreviewState, type Product } from "../data/store";
import { useApp } from "../context/AppContext";
import { Field, Price, UploadBox } from "../components/ui";
import {
  IconAlert, IconArrowRight, IconCheck, IconClose, IconEye, IconRefresh,
  IconShield, IconSparkle, IconTruck,
} from "../components/icons";

const STEPS = ["Choose base piece", "Set options", "Generate preview", "Artisan feasibility", "Approve & produce"];

export default function Customize() {
  const [params] = useSearchParams();
  const { addToCart, toast, user } = useApp();
  const [product, setProduct] = useState<Product | null>(null);
  const [opts, setOpts] = useState<Record<string, string>>({});
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [textErr, setTextErr] = useState<Record<string, string>>({});
  const [refName, setRefName] = useState<string | undefined>();
  const [pstate, setPstate] = useState<PreviewState>("idle");
  const [attempt, setAttempt] = useState(0);
  const genTimer = useRef<number | undefined>(undefined);

  // product picker (default: first customisable)
  useEffect(() => {
    const slug = params.get("product");
    const p = slug ? PRODUCTS.find((x) => x.slug === slug || x.id === slug) : PRODUCTS.find((x) => x.customizable && x.customization.length);
    if (p) { setProduct(p); setOpts({}); setTexts({}); setPstate("idle"); }
  }, [params]);

  const optionPriceDelta = useMemo(() => {
    if (!product) return 0;
    let d = 0;
    for (const [k, v] of Object.entries(opts)) {
      const o = product.customization.find((c) => c.label === k);
      const m = /\(\+₹([\d,]+)\)/.exec(v);
      d += Math.max(o?.priceDelta ?? 0, m ? Number(m[1].replace(/,/g, "")) : 0);
    }
    for (const o of product.customization) {
      if (o.freeText && texts[o.label]?.trim() && o.priceDelta) d += o.priceDelta;
    }
    return d;
  }, [opts, texts, product]);

  const unit = (product?.price ?? 0) + optionPriceDelta;

  if (!product) return <main id="main" className="container section"><div className="skeleton" style={{ height: 300 }} /></main>;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    for (const o of product.customization) {
      if (o.freeText) {
        const val = texts[o.label]?.trim();
        if (val && o.maxLength && val.length > o.maxLength) errs[o.label] = `Please keep it to ${o.maxLength} characters.`;
        if (val && !/^[A-Za-z0-9 .,'&\-–—]*$/.test(val)) errs[o.label] = "Letters, numbers and basic punctuation only.";
      }
    }
    setTextErr(errs);
    return !Object.keys(errs).length;
  };

  const generate = () => {
    if (!validate()) { toast("error", "Fix the personalisation fields before generating."); return; }
    window.clearTimeout(genTimer.current);
    setPstate("generating");
    // Simulated generation pipeline — deterministic failure on attempt 2
    // so retry/revision states are reachable and testable without a fake success.
    const willFail = attempt === 1;
    genTimer.current = window.setTimeout(() => {
      setPstate(willFail ? "failed" : "ready");
      setAttempt((a) => a + 1);
      if (willFail) toast("error", "Preview service timed out. Nothing was charged — try again.");
    }, 1800);
  };

  useEffect(() => () => window.clearTimeout(genTimer.current), []);

  const requestFeasibility = () => {
    setPstate("in_review");
    toast("info", "Sent to the artisan for a feasibility check. Usually answered within 24 hours.");
  };
  const approveAndAdd = () => {
    const chosen: Record<string, string> = { ...opts };
    for (const o of product.customization) if (o.freeText && texts[o.label]?.trim()) chosen[o.label] = texts[o.label].trim();
    addToCart({ productId: product.id, qty: 1, options: chosen, unitPrice: unit });
    setPstate("approved");
    toast("success", "Design locked in and added to your bag. Checkout reserves your production slot.");
  };

  const stepIndex = pstate === "idle" ? (Object.keys(opts).length || Object.keys(texts).length ? 1 : 0)
    : pstate === "generating" || pstate === "failed" ? 2
    : pstate === "ready" ? 2
    : pstate === "in_review" || pstate === "revision" ? 3
    : 4;

  return (
    <main id="main" className="container section--tight">
      <nav className="ka-crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link> / <span aria-current="page">Customisation studio</span>
      </nav>

      <header style={{ marginBottom: "var(--sp-5)" }}>
        <p className="eyebrow">The KALART studio</p>
        <h1 style={{ margin: "0 0 6px" }}>Commission a piece, see it before it's made</h1>
        <ol className="row row--wrap ka-stepsbar" style={{ listStyle: "none", margin: 0, padding: 0, gap: 6, fontSize: "0.82rem" }} aria-label="Customisation progress">
          {STEPS.map((s, i) => (
            <li key={s} className={"badge " + (i < stepIndex ? "badge--success" : i === stepIndex ? "badge--clay" : "badge--neutral")}
              aria-current={i === stepIndex ? "step" : undefined}>
              {i < stepIndex && <IconCheck size={12} />}{String(i + 1)}. {s}
            </li>
          ))}
        </ol>
      </header>

      <div className="ka-studio">
        {/* CONTROLS */}
        <section className="stack" aria-labelledby="controls-h" style={{ gap: "var(--sp-4)" }}>
          <div className="card card--pad">
            <Field label="Base piece" htmlFor="base-product" hint="Only pieces the workshop can realistically alter appear here.">
              <select id="base-product" className="select" value={product.slug}
                onChange={(e) => { window.location.href = `/customize?product=${e.target.value}`; }}>
                {PRODUCTS.filter((p) => p.customizable).map((p) => (
                  <option key={p.slug} value={p.slug}>{p.name} — from ₹{p.price.toLocaleString("en-IN")}</option>
                ))}
              </select>
            </Field>
            <p className="text-small text-muted" style={{ margin: 0 }}>
              Made by <ArtisanInline id={product.artisanId} /> · lead time {product.leadTimeDays[0]}–{product.leadTimeDays[1]} days
            </p>
          </div>

          <div className="card card--pad stack" style={{ gap: "var(--sp-4)" }}>
            <h2 style={{ fontSize: "1.05rem", margin: 0 }}>Your customisations</h2>
            {product.customization.map((o) => (
              <div key={o.label}>
                {o.choices && (
                  <>
                    <span className="ka-option-label" id={`c-${o.label}`}>
                      {o.label}
                      {o.priceDelta ? <span className="text-muted" style={{ fontWeight: 400 }}> · add-on ₹{o.priceDelta.toLocaleString("en-IN")}</span> : null}
                    </span>
                    <div className="row row--wrap" style={{ gap: 8 }} role="radiogroup" aria-labelledby={`c-${o.label}`}>
                      {o.choices.map((ch) => (
                        <label key={ch} className="ka-choice">
                          <input type="radio" name={o.label} checked={opts[o.label] === ch}
                            onChange={() => { setOpts((s) => ({ ...s, [o.label]: ch })); if (pstate !== "idle") setPstate("idle"); }} />
                          <span>{ch}</span>
                        </label>
                      ))}
                    </div>
                  </>
                )}
                {o.freeText && (
                  <Field label={o.label} htmlFor={`f-${o.label}`} hint={`${o.note ?? ""} Add-on ₹${(o.priceDelta ?? 0).toLocaleString("en-IN")}.`} error={textErr[o.label]}>
                    <input id={`f-${o.label}`} className="input" placeholder="Type here…" maxLength={(o.maxLength ?? 40) + 12}
                      aria-invalid={!!textErr[o.label]}
                      value={texts[o.label] ?? ""}
                      onChange={(e) => { setTextVals(e.target.name, e.target.value); }} name={o.label} />
                  </Field>
                )}
              </div>
            ))}
            <UploadBox onUploaded={(n) => { setRefName(n); toast("success", "Reference attached to your request."); }} />
          </div>

          <div className="card card--pad row row--between" style={{ flexWrap: "wrap", gap: "var(--sp-3)" }}>
            <div>
              <p className="text-small text-muted" style={{ margin: 0 }}>Confirmed price after approval</p>
              <Price value={unit} size="md" />
              <p className="text-small text-muted" style={{ margin: "4px 0 0" }}>Includes every selected add-on. The artisan confirms or adjusts before you pay.</p>
            </div>
            <button className="btn btn--primary" onClick={generate} disabled={pstate === "generating"}>
              {pstate === "generating" ? <><Spinner /> Generating…</> : <><IconSparkle size={16} /> Generate preview</>}
            </button>
          </div>
        </section>

        {/* PREVIEW */}
        <section aria-labelledby="preview-h" className="stack" style={{ gap: "var(--sp-3)" }}>
          <h2 id="preview-h" className="sr-only">Design preview</h2>
          <div className="ka-preview-frame">
            <PreviewCanvas product={product} state={pstate} opts={opts} texts={texts} refName={refName} />
          </div>

          {pstate === "idle" && (
            <p className="text-small text-muted row" style={{ gap: 8 }}>
              <IconEye size={15} /> Left: real product photography. Your preview will appear here once generated.
            </p>
          )}
          {pstate === "generating" && (
            <p className="text-small text-muted row" style={{ gap: 8 }} role="status" aria-live="polite">
              <Spinner /> Compositing your options onto the workshop's latest sample… ~30 s
            </p>
          )}
          {pstate === "failed" && (
            <div className="card card--pad row row--between" style={{ borderColor: "var(--ka-error)", gap: "var(--sp-3)", flexWrap: "wrap" }} role="alert">
              <span className="row" style={{ gap: 10, color: "var(--ka-error)", fontWeight: 600 }}>
                <IconAlert size={18} /> Preview failed to render — no charge, nothing sent yet.
              </span>
              <button className="btn btn--outline btn--sm" onClick={generate}><IconRefresh size={14} /> Retry generation</button>
            </div>
          )}
          {pstate === "ready" && (
            <div className="card card--pad stack" style={{ gap: "var(--sp-3)" }}>
              <strong style={{ color: "var(--ka-charcoal)" }}>Happy with this direction?</strong>
              <p className="text-small text-muted" style={{ margin: 0 }}>
                Before production, {""}<ArtisanInline id={product.artisanId} /> reviews your brief for material feasibility and confirms final pricing
                and timeline. You'll be asked to approve their answer.
              </p>
              <div className="row row--wrap" style={{ gap: "var(--sp-3)" }}>
                <button className="btn btn--secondary" onClick={requestFeasibility}><IconShield size={15} /> Send for artisan review</button>
                <button className="btn btn--ghost" onClick={() => { setPstate("idle"); }}><IconClose size={14} /> Discard preview</button>
              </div>
            </div>
          )}
          {pstate === "in_review" && (
            <div className="card card--pad stack" style={{ gap: "var(--sp-3)", borderColor: "var(--ka-warning)" }} role="status" aria-live="polite">
              <span className="row" style={{ gap: 10 }}>
                <StatusDot pulse /> <strong style={{ color: "var(--ka-charcoal)" }}>Awaiting artisan feasibility check</strong>
              </span>
              <p className="text-small text-muted" style={{ margin: 0 }}>
                Typical response: under 24 h. In this demo you can simulate either outcome below —
                in production these arrive as notifications to your account.
              </p>
              <div className="row row--wrap" style={{ gap: "var(--sp-3)" }}>
                <button className="btn btn--outline btn--sm" onClick={() => setPstate("revision")}><IconRefresh size={14} /> Artisan requested a change</button>
                <button className="btn btn--primary btn--sm" onClick={approveAndAdd}><IconCheck size={14} /> Feasible — show approval</button>
              </div>
            </div>
          )}
          {pstate === "revision" && (
            <div className="card card--pad stack" style={{ gap: "var(--sp-3)", borderColor: "var(--ka-warning)" }} role="alert">
              <strong className="row" style={{ color: "var(--ka-charcoal)" }}>Artisan suggests one adjustment</strong>
              <p className="text-small" style={{ margin: 0 }}>
                “The initials at 12&nbsp;mm sit very close to the pallu border. I'd move them 1&nbsp;cm up — everything else is exactly doable.”
              </p>
              <div className="row row--wrap" style={{ gap: "var(--sp-3)" }}>
                <button className="btn btn--primary btn--sm" onClick={approveAndAdd}><IconCheck size={14} /> Accept revision &amp; approve</button>
                <button className="btn btn--outline btn--sm" onClick={() => { setPstate("idle"); toast("info", "Back to options — adjust anything and regenerate."); }}>Tweak my design</button>
              </div>
            </div>
          )}
          {pstate === "approved" && (
            <div className="card card--pad stack" style={{ gap: "var(--sp-3)", borderColor: "var(--ka-success)" }}>
              <strong className="row" style={{ gap: 10, color: "var(--ka-success)" }}><IconCheck size={16} /> Design approved — version 1 locked</strong>
              <ul className="stack" style={{ listStyle: "none", margin: 0, padding: 0, gap: 8, fontSize: "0.9rem" }}>
                <li className="row" style={{ gap: 8 }}><IconTruck size={15} /> Production starts tomorrow · arrives around {eta(product)}</li>
                <li className="row" style={{ gap: 8 }}><IconShield size={15} /> Signed authenticity card included</li>
              </ul>
              <div className="row row--wrap" style={{ gap: "var(--sp-3)" }}>
                <Link to="/cart" className="btn btn--primary">Go to checkout <IconArrowRight size={15} /></Link>
                {!user && <Link to="/signup" className="btn btn--ghost btn--sm">Create an account to track production</Link>}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );

  function setTextVals(name: string, value: string) {
    setTexts((s) => ({ ...s, [name]: value }));
    setTextErr((s) => ({ ...s, [name]: "" }));
    if (pstate !== "idle") setPstate("idle");
  }
}

function eta(p: Product): string {
  const d = new Date(Date.now() + (p.leadTimeDays[1] + 4) * 864e5);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long" });
}

function ArtisanInline({ id }: { id: string }) {
  const found = ARTISANS.find((x) => x.id === id);
  return found ? <Link to={`/artisan/${id}`}>{found.name}</Link> : <>the artisan</>;
}

function Spinner() {
  return (
    <span aria-hidden style={{
      width: 15, height: 15, borderRadius: "50%", display: "inline-block",
      border: "2px solid rgba(255,255,255,.4)", borderTopColor: "#fff",
      animation: "ka-spin 0.8s linear infinite",
    }} />
  );
}
function StatusDot({ pulse }: { pulse?: boolean }) {
  return <span aria-hidden style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--ka-warning)", display: "inline-block", animation: pulse ? "ka-pulse 1.4s ease infinite" : undefined }} />;
}

// ------------------------------------------------------------------ canvas
function PreviewCanvas({ product, state, opts, texts, refName }: {
  product: Product; state: PreviewState; opts: Record<string, string>; texts: Record<string, string>; refName?: string;
}) {
  if (state === "idle" || state === "generating") {
    return (
      <div style={{ position: "relative" }}>
        <img src={product.images[0]} alt={`Original photograph of ${product.name} — the starting point for your customisation`}
          width={900} height={900} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover" }} />
        <span className="badge badge--neutral ka-preview-tag">Original product photo</span>
        {state === "generating" && (
          <div className="skeleton" style={{ position: "absolute", inset: 0, opacity: 0.75, borderRadius: 0 }} aria-hidden />
        )}
      </div>
    );
  }
  const colorChoice = Object.values(opts).find((v) => /indigo|night|rust|blue|earth|terracotta|sand|storm/i.test(v)) ?? "";
  const tint = /indigo|night|storm|blue|ink/i.test(colorChoice) ? "rgba(46,61,99,0.28)"
    : /rust|earth|terracotta|desert|sand|rose/i.test(colorChoice) ? "rgba(168,80,58,0.26)"
    : /green|sage|forest|emerald/i.test(colorChoice) ? "rgba(49,73,60,0.28)"
    : "rgba(0,0,0,0.0)";
  const initials = Object.entries(texts).filter(([, v]) => v.trim()).map(([k, v]) => `${k.split(" ")[0]}: “${v.trim()}”`);

  return (
    <figure style={{ margin: 0, position: "relative" }}>
      <div style={{ position: "relative" }}>
        <img src={product.images[0]} alt="" aria-hidden width={900} height={900}
          style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", filter: state === "failed" ? "grayscale(0.6)" : undefined }} />
        <div style={{ position: "absolute", inset: 0, background: tint, transition: "background var(--t-med)" }} aria-hidden />
        {(initials.length > 0 || refName) && (
          <figcaption style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            background: "linear-gradient(transparent, rgba(38,33,28,0.88))",
            color: "#f3ecdf", padding: "44px 16px 14px", fontSize: "0.86rem", lineHeight: 1.5,
          }}>
            {initials.length > 0 && <div>Personalisation woven in — {initials.join(" · ")}</div>}
            {refName && <div>Reference: {refName}</div>}
          </figcaption>
        )}
        <span className="badge ka-preview-tag" style={{ background: "var(--ka-gold-soft)", color: "#5c4517", fontWeight: 700 }}>
          <IconSparkle size={12} /> AI-assisted preview — not the final handmade result
        </span>
      </div>
      <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "4px 14px", margin: 0, padding: "12px 16px", fontSize: "0.85rem", borderTop: "1px solid var(--ka-line)" }}>
        <dt className="text-muted">Piece</dt><dd style={{ margin: 0 }}>{product.name}</dd>
        {Object.entries(opts).map(([k, v]) => (<div key={k} style={{ display: "contents" }}><dt className="text-muted">{k}</dt><dd style={{ margin: 0 }}>{v}</dd></div>))}
        {initials.map((i) => (<div key={i} style={{ display: "contents" }}><dt className="text-muted">Text</dt><dd style={{ margin: 0 }}>{i}</dd></div>))}
        {refName && (<><dt className="text-muted">Reference</dt><dd style={{ margin: 0 }}>{refName}</dd></>)}
      </dl>
    </figure>
  );
}
