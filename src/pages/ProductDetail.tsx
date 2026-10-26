import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  api, ARTISANS, categoryName, PRODUCTS,
  type Artisan, type Product, type Review,
} from "../data/store";
import { useApp } from "../context/AppContext";
import {
  ErrorState, FavoriteButton, Gallery, Price, ProductCard, Rating, StatusBadge, Field,
} from "../components/ui";
import {
  IconArrowRight, IconCheck, IconChat, IconMinus, IconPlus, IconRefresh,
  IconShield, IconSparkle, IconTruck,
} from "../components/icons";

export default function ProductDetail() {
  const { slug } = useParams();
  const { addToCart, toast, user } = useApp();
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [qty, setQty] = useState(1);
  const [opts, setOpts] = useState<Record<string, string>>({});
  const [textVals, setTextVals] = useState<Record<string, string>>({});
  const [textErr, setTextErr] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<"details" | "shipping" | "returns">("details");

  useEffect(() => {
    let live = true;
    setProduct(undefined);
    api.getProduct(slug ?? "").then(async (p) => {
      if (!live) return;
      setProduct(p ?? null);
      if (p) {
        setArtisan((await api.getArtisan(p.artisanId)) ?? null);
        setReviews(await api.reviewsFor(p.id));
        const rel = await api.listProducts({ category: p.categorySlug });
        live && setRelated(rel.filter((x) => x.id !== p.id).slice(0, 4));
      }
    });
    return () => { live = false; };
  }, [slug]);

  if (product === undefined) {
    return (
      <main id="main" className="container section" aria-busy="true">
        <div className="ka-pdp">
          <div className="skeleton" style={{ aspectRatio: "1/1", borderRadius: "var(--r-lg)" }} />
          <div className="stack">
            <div className="skeleton" style={{ height: 28, width: "70%" }} />
            <div className="skeleton" style={{ height: 18, width: "40%" }} />
            <div className="skeleton" style={{ height: 60 }} />
            <div className="skeleton" style={{ height: 120 }} />
          </div>
        </div>
      </main>
    );
  }
  if (product === null) {
    return (
      <main id="main" className="container section">
        <ErrorState message="We couldn't find that piece. It may have sold out and been retired from the catalogue." onRetry={() => window.location.assign("/shop")} />
      </main>
    );
  }

  const unitBase = product.price + Object.entries(opts).reduce((s, [k, v]) => {
    const o = product.customization.find((c) => c.label === k);
    const delta = o?.priceDelta ?? 0;
    const extraFromLabel = /\(\+₹([\d,]+)\)/.exec(v);
    return s + Math.max(delta, extraFromLabel ? Number(extraFromLabel[1].replace(/,/g, "")) : 0);
  }, 0);

  const validateTexts = (): boolean => {
    const errs: Record<string, string> = {};
    for (const o of product.customization) {
      if (o.freeText) {
        const val = textVals[o.label]?.trim();
        if (val && o.maxLength && val.length > o.maxLength) errs[o.label] = `Please keep it to ${o.maxLength} characters.`;
        if (val && !/^[A-Za-z0-9 .,'&\-–—]*$/.test(val)) errs[o.label] = "Letters, numbers and basic punctuation only.";
      }
    }
    setTextErr(errs);
    return Object.keys(errs).length === 0;
  };

  const chosenOptions = (): Record<string, string> => {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(opts)) if (v) out[k] = v;
    for (const o of product.customization) {
      if (o.freeText && textVals[o.label]?.trim()) out[o.label] = textVals[o.label].trim();
    }
    return out;
  };

  const hasSelection = Object.keys(chosenOptions()).length > 0;

  const add = () => {
    if (!validateTexts()) { toast("error", "Please fix the highlighted personalisation fields."); return; }
    addToCart({ productId: product.id, qty, options: chosenOptions(), unitPrice: unitBase });
    toast("success", `${product.name} added to your bag.`);
  };

  return (
    <main id="main" className="container section--tight">
      <nav className="ka-crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link> / <Link to={`/shop?category=${product.categorySlug}`}>{categoryName(product.categorySlug)}</Link>
        / <span aria-current="page">{product.name}</span>
      </nav>

      <div className="ka-pdp">
        <div>
          <Gallery images={product.images} name={product.name} />
        </div>

        <div className="stack" style={{ gap: "var(--sp-4)" }}>
          <div>
            <div className="row row--wrap" style={{ gap: 8, marginBottom: 8 }}>
              <span className="badge badge--neutral"><IconCheck size={12} /> Handmade to order</span>
              {product.customizable && <span className="badge badge--indigo"><IconSparkle size={12} /> Customisable</span>}
              {product.stock <= 5 && <span className="badge badge--warning">Only {product.stock} workshop slots left this month</span>}
            </div>
            <h1 style={{ margin: "0 0 8px" }}>{product.name}</h1>
            <div className="row row--wrap" style={{ gap: "var(--sp-4)" }}>
              <Rating value={product.rating} count={product.reviewCount} />
              <a href="#reviews" className="text-small">Read {reviews.length || product.reviewCount} reviews</a>
            </div>
          </div>

          <Price value={unitBase} compareAt={product.compareAt} size="lg" />
          {product.compareAt && product.compareAt > product.price && (
            <p className="text-small" style={{ color: "var(--ka-success)", margin: 0, fontWeight: 600 }}>
              You save {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(product.compareAt - unitBase > 0 ? product.compareAt - unitBase : 0)} — artisan-set pricing, no inflated MRPs.
            </p>
          )}

          <p>{product.description}</p>

          {/* Artisan strip */}
          {artisan && (
            <Link to={`/artisan/${artisan.id}`} className="card card--pad row" style={{ textDecoration: "none", gap: 14 }} aria-label={`View ${artisan.name}'s profile`}>
              <img src={artisan.image} alt="" width={56} height={56} loading="lazy"
                style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--ka-line)" }} />
              <span style={{ flex: 1 }}>
                <strong style={{ color: "var(--ka-charcoal)", display: "block" }}>{artisan.name} <span className="text-muted" style={{ fontWeight: 400 }}>· {artisan.craft}</span></strong>
                <span className="text-small text-muted">{artisan.location} · weaving since {artisan.since} {artisan.verified && "· verified"}</span>
              </span>
              <IconArrowRight size={16} />
            </Link>
          )}

          {/* Customization */}
          {product.customizable && product.customization.length > 0 && (
            <section className="card card--pad" aria-labelledby="cust-h" style={{ background: "var(--ka-ivory)" }}>
              <div className="row row--between" style={{ marginBottom: "var(--sp-3)" }}>
                <h2 id="cust-h" style={{ fontSize: "1.1rem", margin: 0 }}>Make it yours</h2>
                <Link to={`/customize?product=${product.slug}`} className="btn btn--ghost btn--sm">Open preview studio <IconArrowRight size={14} /></Link>
              </div>
              <p className="text-small text-muted" style={{ marginTop: 0 }}>
                These options are pre-approved by {artisan?.name.split(" ")[0] ?? "the artisan"} as feasible — what you pick here is exactly what they'll confirm before starting.
              </p>
              {product.customization.map((o) => (
                <div key={o.label} style={{ marginBottom: "var(--sp-4)" }}>
                  {o.choices && (
                    <>
                      <span className="ka-option-label" id={`opt-${o.label}`}>{o.label}</span>
                      <div className="row row--wrap" style={{ gap: 8 }} role="radiogroup" aria-labelledby={`opt-${o.label}`}>
                        {o.choices.map((ch) => (
                          <label key={ch} className="ka-choice">
                            <input type="radio" name={o.label} checked={opts[o.label] === ch}
                              onChange={() => setOpts((s) => ({ ...s, [o.label]: ch }))} />
                            <span>{ch}</span>
                          </label>
                        ))}
                      </div>
                    </>
                  )}
                  {o.freeText && (
                    <Field label={o.label} htmlFor={`txt-${o.label}`} hint={`${o.note ?? ""} Max ${o.maxLength} characters.`}
                      error={textErr[o.label]}>
                      <input id={`txt-${o.label}`} className="input" maxLength={(o.maxLength ?? 40) + 10}
                        aria-invalid={!!textErr[o.label]}
                        aria-describedby={textErr[o.label] ? `txt-${o.label}-error` : `txt-${o.label}-hint`}
                        placeholder="e.g. PS" value={textVals[o.label] ?? ""}
                        onChange={(e) => { setTextVals((s) => ({ ...s, [o.label]: e.target.value })); setTextErr((s) => ({ ...s, [o.label]: "" })); }} />
                    </Field>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Buy box */}
          <div className="ka-buybox card card--pad stack" style={{ gap: "var(--sp-4)" }}>
            <div className="row row--wrap" style={{ gap: "var(--sp-4)" }}>
              <div className="ka-stepper" role="group" aria-label="Quantity">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity"><IconMinus size={15} /></button>
                <output aria-live="polite">{qty}</output>
                <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} aria-label="Increase quantity" disabled={qty >= product.stock}><IconPlus size={15} /></button>
              </div>
              <span className="text-small text-muted">{product.stock} available · lead time {product.leadTimeDays[0]}–{product.leadTimeDays[1]} days</span>
            </div>
            <div className="row" style={{ gap: "var(--sp-3)", flexWrap: "wrap" }}>
              <button className="btn btn--primary" style={{ flex: 1, minWidth: 200 }} onClick={add}>Add to bag · {(unitBase * qty).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}</button>
              <FavoriteButton productId={product.id} />
            </div>
            {hasSelection && (
              <Link to={`/customize?product=${product.slug}`} className="btn btn--secondary btn--block">
                <IconSparkle size={16} /> Preview this customisation first
              </Link>
            )}
            {!user && (
              <p className="text-small text-muted" style={{ margin: 0 }}>
                <Link to="/login">Sign in</Link> to track this order and chat with {artisan?.name.split(" ")[0] ?? "the artisan"} while it's made.
              </p>
            )}
            <ul className="stack" style={{ listStyle: "none", margin: 0, padding: 0, gap: 10, fontSize: "0.88rem" }}>
              <li className="row" style={{ gap: 10 }}><IconShield size={16} /> Authenticity card signed by {artisan?.name ?? "the maker"} ships with the piece</li>
              <li className="row" style={{ gap: 10 }}><IconTruck size={16} /> Free shipping over ₹2,000 · insured pan-India delivery</li>
              <li className="row" style={{ gap: 10 }}><IconRefresh size={16} /> 14-day returns on standard pieces (custom work excluded — see policy)</li>
              <li className="row" style={{ gap: 10 }}><IconChat size={16} /> Questions about materials? Ask the workshop directly.</li>
            </ul>
          </div>

          {/* Tabs */}
          <section aria-labelledby="spec-h">
            <h2 id="spec-h" className="sr-only">Specifications</h2>
            <div className="row" role="tablist" aria-label="Product information tabs" style={{ gap: 4, borderBottom: "1px solid var(--ka-line)" }}>
              {([["details", "Materials & care"], ["shipping", "Delivery"], ["returns", "Returns"]] as const).map(([k, l]) => (
                <button key={k} role="tab" id={`tab-${k}`} aria-selected={tab === k} aria-controls={`panel-${k}`}
                  className={"ka-navlink" + (tab === k ? " ka-navlink--active" : "")} onClick={() => setTab(k)}>{l}</button>
              ))}
            </div>
            <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} style={{ paddingTop: "var(--sp-4)" }}>
              {tab === "details" && (
                <dl className="grid grid-p2" style={{ gap: "var(--sp-4)", margin: 0 }}>
                  <div><dt className="text-small eyebrow" style={{ marginBottom: 2 }}>Materials</dt><dd style={{ margin: 0 }}>{product.materials}</dd></div>
                  <div><dt className="text-small eyebrow" style={{ marginBottom: 2 }}>Dimensions</dt><dd style={{ margin: 0 }}>{product.dimensions}</dd></div>
                  <div style={{ gridColumn: "1 / -1" }}><dt className="text-small eyebrow" style={{ marginBottom: 2 }}>Care</dt><dd style={{ margin: 0 }}>{product.care}</dd></div>
                </dl>
              )}
              {tab === "shipping" && (
                <p style={{ margin: 0 }}>
                  Made to order in {artisan?.location ?? "the artisan's workshop"}. Production takes {product.leadTimeDays[0]}–{product.leadTimeDays[1]} days,
                  then 3–5 days insured transit. You'll receive a tracking link at each stage, and can watch production status from your account.
                </p>
              )}
              {tab === "returns" && (
                <p style={{ margin: 0 }}>
                  Standard pieces: 14-day no-questions returns, pickup arranged by us. Customised pieces can't be resold, so we only accept them
                  if the work differs from your approved preview or arrives damaged — documented with photos within 48 hours of delivery.
                </p>
              )}
            </div>
          </section>

          {/* Reviews */}
          <section id="reviews" aria-labelledby="rev-h">
            <h2 id="rev-h" style={{ fontSize: "1.2rem" }}>Reviews <span className="text-muted text-small">({reviews.length})</span></h2>
            {reviews.length === 0 ? (
              <p className="text-muted text-small">No written reviews yet — the shop rating comes from repeat-order scores.</p>
            ) : (
              <div className="stack">
                {reviews.map((r) => (
                  <article key={r.id} className="card card--pad">
                    <div className="row row--between" style={{ flexWrap: "wrap", gap: 8 }}>
                      <strong style={{ color: "var(--ka-charcoal)" }}>{r.author}</strong>
                      <Rating value={r.rating} />
                    </div>
                    <p style={{ margin: "8px 0 4px" }}>“{r.body}”</p>
                    <time className="text-small text-muted" dateTime={r.date}>{new Date(r.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</time>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="section band-cream" aria-labelledby="rel-h" style={{ marginLeft: "calc(50% - 50vw)", marginRight: "calc(50% - 50vw)", paddingLeft: "calc(50vw - 50%)", paddingRight: "calc(50vw - 50%)" }}>
          <div className="container">
            <h2 id="rel-h" style={{ fontSize: "1.4rem" }}>More from {categoryName(product.categorySlug).toLowerCase()}</h2>
            <div className="grid grid-p4">{related.map((p) => <ProductCard key={p.id} product={p} />)}</div>
          </div>
        </section>
      )}
    </main>
  );
}
