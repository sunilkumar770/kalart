import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, ARTISANS, CATEGORIES, PRODUCTS, type Product } from "../data/store";
import { ArtisanCard, CategoryTile, ProductCard, GridSkeleton } from "../components/ui";
import { IconArrowRight, IconCheck, IconLoom, IconShield, IconSparkle, IconTruck } from "../components/icons";

export default function Home() {
  const [featured, setFeatured] = useState<Product[] | null>(null);
  const [customisables, setCustomisables] = useState<Product[] | null>(null);

  useEffect(() => {
    let live = true;
    api.listProducts({ sort: "rating" }).then((p) => live && setFeatured(p.slice(0, 4)));
    api.listProducts({ customOnly: true }).then((p) => live && setCustomisables(p.slice(0, 4)));
    return () => { live = false; };
  }, []);

  return (
    <main id="main">
      {/* HERO */}
      <section className="ka-hero">
        <div className="container ka-hero__grid">
          <div>
            <p className="eyebrow">Handmade in India · Verified artisans</p>
            <h1>Craft with a signature. Made for you, by them.</h1>
            <p className="lede">
              KALART connects you directly with master weavers, potters and painters —
              so you can commission authentic handmade pieces, preview every customisation,
              and approve the design before it reaches the loom or the wheel.
            </p>
            <div className="ka-hero__cta">
              <Link to="/shop" className="btn btn--primary">Shop the collection <IconArrowRight size={16} /></Link>
              <Link to="/customize" className="btn btn--outline"><IconSparkle size={16} /> Start a custom order</Link>
            </div>
            <div className="row row--wrap" style={{ marginTop: "var(--sp-5)", gap: "var(--sp-4)", color: "var(--ka-muted)", fontSize: "0.86rem" }}>
              <span className="row" style={{ gap: 6 }}><IconShield size={16} /> Artisan-verified listings</span>
              <span className="row" style={{ gap: 6 }}><IconTruck size={16} /> Ships pan-India in 7–16 days</span>
              <span className="row" style={{ gap: 6 }}><IconCheck size={16} /> Preview &amp; approve before production</span>
            </div>
          </div>
          <figure className="ka-hero__figure" style={{ margin: 0 }}>
            <img src="/img/hero-main.jpg" width={1400} height={1000} fetchPriority="high" decoding="async"
              alt="Illustrated scene of an artisan draped in an indigo handloom saree beside a lit diya, under a carved arch" />
            <figcaption className="ka-hero__chip" style={{ bottom: 24, left: -8 }}>
              <span aria-hidden style={{ color: "var(--ka-clay)" }}><IconLoom size={20} /></span>
              <span>38 workshops<br /><small className="text-muted" style={{ fontWeight: 400 }}>across 9 craft clusters</small></span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section" aria-labelledby="cats-h">
        <div className="container">
          <div className="row row--between" style={{ marginBottom: "var(--sp-5)", flexWrap: "wrap", gap: "var(--sp-3)" }}>
            <h2 id="cats-h" style={{ margin: 0 }}>Browse by craft</h2>
            <Link to="/crafts" className="btn btn--ghost btn--sm">All crafts <IconArrowRight size={14} /></Link>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "var(--sp-5)" }}>
            {CATEGORIES.map((c) => <CategoryTile key={c.slug} {...c} />)}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="section band-cream" aria-labelledby="feat-h">
        <div className="container">
          <p className="eyebrow text-center ornament" id="feat-h" style={{ justifyContent: "center", display: "flex" }}>Most loved this season</p>
          <h2 className="text-center" style={{ marginTop: 0 }}>Pieces that carry their maker's handwriting</h2>
          <div style={{ height: "var(--sp-5)" }} />
          {!featured ? <GridSkeleton n={4} /> : (
            <div className="grid grid-p4">{featured.map((p) => <ProductCard key={p.id} product={p} />)}</div>
          )}
          <div className="text-center" style={{ marginTop: "var(--sp-6)" }}>
            <Link to="/shop?sort=rating" className="btn btn--secondary">Browse top-rated work <IconArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* EDITORIAL STORY */}
      <section className="section">
        <div className="container ka-split">
          <div>
            <p className="eyebrow">Why handmade matters</p>
            <h2>The slight blur in an ikat is not a defect. It's a decision.</h2>
            <p className="lede">
              Machine printing repeats; hands respond. When Ravi ties a warp thread he is choosing how
              much indigo the fibre keeps. When Meera grinds stone pigment she decides how a monsoon sky
              should feel. KALART pays these decisions properly — artisans set their own prices and keep
              85% of every sale.
            </p>
            <p className="lede">
              Every listing states what is made to order, what can be customised, and exactly when your
              piece will ship — before you commit anything.
            </p>
            <Link to="/about" className="btn btn--outline">Read our sourcing charter <IconArrowRight size={15} /></Link>
          </div>
          <div className="grid grid-p2" style={{ gap: "var(--sp-4)" }}>
            <img src="/img/story-workshop.jpg" width={800} height={800} loading="lazy" decoding="async"
              alt="Weaver at a pit loom in a sunlit workshop"
              style={{ borderRadius: "var(--r-lg)", aspectRatio: "3/4", objectFit: "cover", boxShadow: "var(--sh-md)" }} />
            <div className="stack" style={{ gap: "var(--sp-4)" }}>
              <img src="/img/story-print.jpg" width={900} height={900} loading="lazy" decoding="async"
                alt="Indigo block-print cloth drying on a line"
                style={{ borderRadius: "var(--r-lg)", aspectRatio: "1/1", objectFit: "cover" }} />
              <div className="card card--pad">
                <strong style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "var(--ka-charcoal)" }}>₹2.4 Cr+</strong>
                <p className="text-small text-muted" style={{ margin: 0 }}>paid directly to partner workshops in 2026</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CUSTOMISATION TEASER */}
      <section className="section band-stone" aria-labelledby="cust-h">
        <div className="container">
          <div className="row row--between" style={{ marginBottom: "var(--sp-5)", flexWrap: "wrap", gap: "var(--sp-3)" }}>
            <div>
              <p className="eyebrow" id="cust-h" style={{ marginBottom: 4 }}>The KALART difference</p>
              <h2 style={{ margin: 0 }}>Commission it your way — see it first</h2>
            </div>
            <Link to="/customize" className="btn btn--primary">Open the studio <IconArrowRight size={16} /></Link>
          </div>
          <div className="ka-steps">
            <div className="ka-step"><h3 style={{ fontSize: "1.05rem" }}>Choose a base piece</h3><p className="text-small text-muted">Start from real photography of what the workshop makes today.</p></div>
            <div className="ka-step"><h3 style={{ fontSize: "1.05rem" }}>Adjust colour, size, text</h3><p className="text-small text-muted">Only options the artisan has marked feasible are offered.</p></div>
            <div className="ka-step"><h3 style={{ fontSize: "1.05rem" }}>Review a generated preview</h3><p className="text-small text-muted">Previews are clearly labelled as AI-assisted visualisations, never promises.</p></div>
            <div className="ka-step"><h3 style={{ fontSize: "1.05rem" }}>Approve &amp; the artisan begins</h3><p className="text-small text-muted">A human karigar signs off feasibility and final pricing before production.</p></div>
          </div>
          <div style={{ height: "var(--sp-6)" }} />
          {!customisables ? <GridSkeleton n={4} /> : (
            <div className="grid grid-p4">{customisables.map((p) => <ProductCard key={p.id} product={p} />)}</div>
          )}
        </div>
      </section>

      {/* ARTISANS */}
      <section className="section">
        <div className="container">
          <div className="row row--between" style={{ marginBottom: "var(--sp-5)", flexWrap: "wrap", gap: "var(--sp-3)" }}>
            <h2 style={{ margin: 0 }}>Meet the makers</h2>
            <Link to="/artisans" className="btn btn--ghost btn--sm">All artisans <IconArrowRight size={14} /></Link>
          </div>
          <div className="grid grid-p4">
            {ARTISANS.filter((a) => a.verified).slice(0, 4).map((a) => <ArtisanCard key={a.id} artisan={a} />)}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="band-ink" style={{ background: "var(--ka-surface-ink)", paddingBlock: "var(--sp-8)" }}>
        <div className="container text-center">
          <h2 style={{ color: "#f3ecdf" }}>Practice your craft. We'll handle the rest.</h2>
          <p style={{ color: "#b9ae97", maxWidth: "54ch", margin: "0 auto var(--sp-5)" }}>
            Join 38 partner workshops earning without middlemen. Set your price, your lead time, your limits.
          </p>
          <Link to="/sell" className="btn btn--primary">Become an artisan partner <IconArrowRight size={16} /></Link>
        </div>
      </section>
    </main>
  );
}
