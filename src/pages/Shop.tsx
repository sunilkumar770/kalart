import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, CATEGORIES, categoryName, type Product } from "../data/store";
import { EmptyState, ErrorState, GridSkeleton, ProductCard } from "../components/ui";
import { IconClose, IconFilter } from "../components/icons";

const SORTS = [
  { v: "popular", label: "Most reviewed" },
  { v: "rating", label: "Top rated" },
  { v: "price-asc", label: "Price: low to high" },
  { v: "price-desc", label: "Price: high to low" },
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const category = params.get("category") ?? "";
  const sort = params.get("sort") ?? "popular";
  const maxP = params.get("max") ? Number(params.get("max")) : null;
  const customOnly = params.get("custom") === "1";

  const [items, setItems] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    let live = true;
    setItems(null); setError(null);
    api.listProducts({ q, category, sort, max: maxP ?? undefined, customOnly })
      .then((p) => live && setItems(p))
      .catch(() => live && setError("The catalogue service didn't respond."));
    return () => { live = false; };
  }, [q, category, sort, maxP, customOnly, reloadKey]);

  const setParam = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v == null || v === "") next.delete(k); else next.set(k, v);
    setParams(next, { replace: true });
  };

  const activeCat = CATEGORIES.find((c) => c.slug === category);
  const heading = q ? `Results for “${q}”` : activeCat ? activeCat.name : "All handmade pieces";

  return (
    <main id="main" className="container section--tight">
      <nav className="ka-crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link> / <span aria-current="page">{activeCat ? activeCat.name : "Shop"}</span>
      </nav>

      <div className="row row--between row--wrap" style={{ marginBottom: "var(--sp-4)", gap: "var(--sp-3)" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "clamp(1.6rem, 1.2rem + 1.6vw, 2.3rem)" }}>{heading}</h1>
          <p className="text-muted text-small" role="status" aria-live="polite" style={{ margin: "6px 0 0" }}>
            {items == null ? "Loading pieces…" : `${items.length} piece${items.length === 1 ? "" : "s"} · handmade to order`}
          </p>
        </div>
        <div className="row" style={{ gap: "var(--sp-3)" }}>
          <button className="btn btn--outline btn--sm ka-mobile-only-inline" onClick={() => setDrawerOpen((v) => !v)} aria-expanded={drawerOpen}>
            <IconFilter size={15} /> Filters
          </button>
          <label className="row" style={{ gap: 8 }}>
            <span className="sr-only">Sort products</span>
            <select className="select" style={{ width: "auto", minWidth: 170 }} value={sort}
              onChange={(e) => setParam("sort", e.target.value)}>
              {SORTS.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
            </select>
          </label>
        </div>
      </div>

      {/* active filter pills */}
      {(q || category || maxP != null || customOnly) && (
        <div className="ka-chipbar" style={{ marginBottom: "var(--sp-4)" }}>
          {q && <Chip k="Search" v={q} onClear={() => setParam("q", null)} />}
          {category && <Chip k="Craft" v={activeCat?.name ?? category} onClear={() => setParam("category", null)} />}
          {maxP != null && <Chip k="Under" v={`₹${maxP.toLocaleString("en-IN")}`} onClear={() => setParam("max", null)} />}
          {customOnly && <Chip k="Customisable only" v="" onClear={() => setParam("custom", null)} />}
          <button className="btn btn--ghost btn--sm" onClick={() => setParams({}, { replace: true })}>Clear all</button>
        </div>
      )}

      <div className="ka-shop">
        <aside className={"ka-filters card card--pad" + (drawerOpen ? " is-open" : "")} aria-label="Product filters">
          <div className="row row--between" style={{ marginBottom: "var(--sp-3)" }}>
            <h2 style={{ fontSize: "1.05rem", margin: 0 }}>Refine</h2>
            <button className="btn btn--ghost btn--sm ka-mobile-only-inline" onClick={() => setDrawerOpen(false)} aria-label="Close filters"><IconClose size={16} /></button>
          </div>

          <fieldset style={{ border: 0, padding: 0, margin: "0 0 var(--sp-4)" }}>
            <legend className="ka-option-label">Craft</legend>
            <div className="stack" style={{ gap: 2 }}>
              <FilterRadio checked={!category} onChange={() => setParam("category", null)} label="All crafts" />
              {CATEGORIES.map((c) => (
                <FilterRadio key={c.slug} checked={category === c.slug} onChange={() => setParam("category", c.slug)} label={c.name} />
              ))}
            </div>
          </fieldset>

          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="ka-option-label">Budget</legend>
            {[1000, 2500, 5000, null].map((m) => (
              <FilterRadio key={String(m)} checked={(maxP == null && m == null) || maxP === m}
                onChange={() => m == null ? setParam("max", null) : setParam("max", String(m))}
                label={m == null ? "Any price" : `Under ₹${m.toLocaleString("en-IN")}`} />
            ))}
          </fieldset>

          <hr className="divider" />
          <label className="row" style={{ gap: 10, cursor: "pointer" }}>
            <input type="checkbox" checked={customOnly} onChange={(e) => setParam("custom", e.target.checked ? "1" : null)}
              style={{ width: 18, height: 18, accentColor: "var(--ka-indigo)" }} />
            <span className="text-small" style={{ fontWeight: 600, color: "var(--ka-charcoal)" }}>Show only customisable pieces</span>
          </label>
        </aside>

        <section aria-label="Products">
          {error ? <ErrorState message={error} onRetry={() => setReloadKey((k) => k + 1)} />
            : items == null ? <GridSkeleton n={8} />
            : items.length === 0 ? (
              <EmptyState
                title="No pieces match those filters"
                body="Handmade work takes time — try widening your budget or clearing the craft filter. New drops land every Friday."
                action={{ label: "Browse everything", to: "/shop" }} />
            ) : (
              <div className="grid grid-p3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
                {items.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
        </section>
      </div>
    </main>
  );
}

function Chip({ k, v, onClear }: { k: string; v: string; onClear: () => void }) {
  return (
    <span className="badge badge--neutral" style={{ padding: "6px 6px 6px 12px", fontSize: "0.82rem" }}>
      <span className="text-muted">{k}{v ? ":" : ""}</span>&nbsp;<strong>{v}</strong>
      <button aria-label={`Remove ${k} filter`} onClick={onClear}
        style={{ border: 0, background: "var(--ka-line)", borderRadius: "50%", width: 20, height: 20, display: "grid", placeItems: "center", marginLeft: 4 }}>
        <IconClose size={11} />
      </button>
    </span>
  );
}

function FilterRadio({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className="row" style={{ gap: 10, padding: "6px 4px", cursor: "pointer", borderRadius: "var(--r-sm)" }}>
      <input type="radio" name="filterradio" checked={checked} onChange={onChange}
        style={{ width: 16, height: 16, accentColor: "var(--ka-clay)" }} />
      <span className="text-small" style={{ color: checked ? "var(--ka-charcoal)" : "var(--ka-ink)", fontWeight: checked ? 650 : 400 }}>{label}</span>
    </label>
  );
}
