import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ARTISANS, CATEGORIES, type Product } from "../data/store";
import { ArtisanCard, CategoryTile, ProductCard, GridSkeleton } from "../components/ui";
import {
  IconArrowRight,
  IconCheck,
  IconLoom,
  IconShield,
  IconSparkle,
  IconTruck,
} from "../components/icons";

export default function Home() {
  const [featured, setFeatured] = useState<Product[] | null>(null);
  const [customisables, setCustomisables] = useState<Product[] | null>(null);

  useEffect(() => {
    let live = true;
    api.listProducts({ sort: "rating" }).then((p) => live && setFeatured(p.slice(0, 4)));
    api.listProducts({ customOnly: true }).then((p) => live && setCustomisables(p.slice(0, 4)));
    return () => {
      live = false;
    };
  }, []);

  const verifiedArtisans = ARTISANS.filter((a) => a.verified);
  const totalArtisansCount = ARTISANS.length;

  return (
    <main id="main">
      {/* ================= HERO SECTION ================= */}
      <section className="ka-hero">
        <div className="container ka-hero__grid">
          <div>
            <span className="badge badge--clay" style={{ marginBottom: "var(--sp-3)" }}>
              <span className="dot" aria-hidden /> 0% commission on partner workshops
            </span>
            <h1>Craft with a signature. Made for you, by them.</h1>
            <p className="lede">
              KALART connects you directly with master weavers, potters and painters across India.
              Commission authentic handmade pieces, preview every customisation, and approve the design
              before production starts.
            </p>
            <div className="ka-hero__cta">
              <Link to="/shop" className="btn btn--primary">
                Shop the collection <IconArrowRight size={16} />
              </Link>
              <Link to="/customize" className="btn btn--outline">
                <IconSparkle size={16} /> Start a custom order
              </Link>
            </div>
            <div
              className="row row--wrap"
              style={{
                marginTop: "var(--sp-5)",
                gap: "var(--sp-4)",
                color: "var(--ka-muted)",
                fontSize: "0.86rem",
              }}
            >
              <span className="row" style={{ gap: 6 }}>
                <IconShield size={16} /> Artisan-verified listings
              </span>
              <span className="row" style={{ gap: 6 }}>
                <IconTruck size={16} /> Ships pan-India in 7–16 days
              </span>
              <span className="row" style={{ gap: 6 }}>
                <IconCheck size={16} /> Preview &amp; approve before production
              </span>
            </div>
          </div>
          <figure className="ka-hero__figure" style={{ margin: 0 }}>
            <img
              src="/img/hero-main.jpg"
              width={1400}
              height={1000}
              fetchPriority="high"
              decoding="async"
              alt="Artisan at work in an Indian handloom workshop with woven textiles"
            />
            <figcaption className="ka-hero__chip" style={{ bottom: 24, left: -8 }}>
              <span aria-hidden="true" style={{ color: "var(--ka-clay)" }}>
                <IconLoom size={20} />
              </span>
              <span>
                {totalArtisansCount} verified workshops
                <br />
                <small className="text-muted" style={{ fontWeight: 400 }}>
                  across 9 traditional craft clusters
                </small>
              </span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ================= TRUST BAR ================= */}
      <section className="section--tight band-stone" aria-label="Trust & Fair Trade Highlights">
        <div className="container">
          <div className="trust-bar" style={{ padding: 0, margin: 0 }}>
            <div className="trust-item">
              <IconShield size={22} />
              <div>
                <b>Direct artisan trade</b>
                <p>No middlemen markups</p>
              </div>
            </div>
            <div className="trust-item">
              <IconCheck size={22} />
              <div>
                <b>Fair craft prices</b>
                <p>Artisans set their pricing</p>
              </div>
            </div>
            <div className="trust-item">
              <IconSparkle size={22} />
              <div>
                <b>Guided customisation</b>
                <p>Preview before production</p>
              </div>
            </div>
            <div className="trust-item">
              <IconTruck size={22} />
              <div>
                <b>Insured delivery</b>
                <p>Provenance card included</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="section" aria-labelledby="cats-h">
        <div className="container">
          <div
            className="row row--between"
            style={{ marginBottom: "var(--sp-5)", flexWrap: "wrap", gap: "var(--sp-3)" }}
          >
            <div>
              <p className="eyebrow" id="cats-h" style={{ marginBottom: 4 }}>
                Traditional Heritage
              </p>
              <h2 style={{ margin: 0 }}>Browse by craft</h2>
            </div>
            <Link to="/crafts" className="btn btn--ghost btn--sm">
              All crafts <IconArrowRight size={14} />
            </Link>
          </div>
          <div
            className="grid"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "var(--sp-5)" }}
          >
            {CATEGORIES.map((c) => (
              <CategoryTile key={c.slug} {...c} />
            ))}
          </div>
        </div>
      </section>

      {/* ================= FEATURED CATALOG ================= */}
      <section className="section band-cream" aria-labelledby="feat-h">
        <div className="container">
          <p
            className="eyebrow text-center ornament"
            id="feat-h"
            style={{ justifyContent: "center", display: "flex" }}
          >
            Most loved this season
          </p>
          <h2 className="text-center" style={{ marginTop: 0 }}>
            Pieces that carry their maker's signature
          </h2>
          <div style={{ height: "var(--sp-5)" }} />
          {!featured ? (
            <GridSkeleton n={4} />
          ) : (
            <div className="grid grid-p4">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
          <div className="text-center" style={{ marginTop: "var(--sp-6)" }}>
            <Link to="/shop?sort=rating" className="btn btn--secondary">
              Browse top-rated work <IconArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="section band-stone" aria-labelledby="how-h">
        <div className="container">
          <div
            className="row row--between"
            style={{ marginBottom: "var(--sp-5)", flexWrap: "wrap", gap: "var(--sp-3)" }}
          >
            <div>
              <p className="eyebrow" id="how-h" style={{ marginBottom: 4 }}>
                The KALART difference
              </p>
              <h2 style={{ margin: 0 }}>Commission it your way — see it first</h2>
            </div>
            <Link to="/customize" className="btn btn--primary">
              Open the studio <IconArrowRight size={16} />
            </Link>
          </div>
          <div className="ka-steps">
            <div className="ka-step">
              <h3 style={{ fontSize: "1.05rem" }}>Choose a base piece</h3>
              <p className="text-small text-muted">
                Start from authentic workshop designs created by master karigars.
              </p>
            </div>
            <div className="ka-step">
              <h3 style={{ fontSize: "1.05rem" }}>Adjust colour, size, motif</h3>
              <p className="text-small text-muted">
                Only options marked feasible by the workshop are offered.
              </p>
            </div>
            <div className="ka-step">
              <h3 style={{ fontSize: "1.05rem" }}>Review your preview</h3>
              <p className="text-small text-muted">
                Visualise the bespoke piece and review transparent workshop pricing.
              </p>
            </div>
            <div className="ka-step">
              <h3 style={{ fontSize: "1.05rem" }}>Artisan begins crafting</h3>
              <p className="text-small text-muted">
                The artisan reviews the brief and hand-crafts the piece to order.
              </p>
            </div>
          </div>
          <div style={{ height: "var(--sp-6)" }} />
          {!customisables ? (
            <GridSkeleton n={4} />
          ) : (
            <div className="grid grid-p4">
              {customisables.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= MEET THE MAKERS ================= */}
      <section className="section" aria-labelledby="artisans-h">
        <div className="container">
          <div
            className="row row--between"
            style={{ marginBottom: "var(--sp-5)", flexWrap: "wrap", gap: "var(--sp-3)" }}
          >
            <div>
              <p className="eyebrow" id="artisans-h" style={{ marginBottom: 4 }}>
                Artisan Guild
              </p>
              <h2 style={{ margin: 0 }}>Meet the makers</h2>
            </div>
            <Link to="/artisans" className="btn btn--ghost btn--sm">
              All {totalArtisansCount} artisans <IconArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-p4">
            {verifiedArtisans.slice(0, 4).map((a) => (
              <ArtisanCard key={a.id} artisan={a} />
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA BAND ================= */}
      <section
        className="band-ink"
        style={{ background: "var(--ka-surface-ink)", paddingBlock: "var(--sp-8)" }}
      >
        <div className="container text-center">
          <h2 style={{ color: "#f3ecdf" }}>Practice your craft. We'll handle the rest.</h2>
          <p
            style={{
              color: "#b9ae97",
              maxWidth: "54ch",
              margin: "0 auto var(--sp-5)",
              fontSize: "1.02rem",
            }}
          >
            Join {totalArtisansCount} partner workshops earning directly without middlemen. Set your
            price, your lead time, and your customisation limits.
          </p>
          <Link to="/sell" className="btn btn--primary">
            Become an artisan partner <IconArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}
