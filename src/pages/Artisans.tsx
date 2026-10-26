import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, ARTISANS, PRODUCTS, type Artisan } from "../data/store";
import { EmptyState, ErrorState, ProductCard, Rating } from "../components/ui";
import { IconCheck, IconPin, IconShield } from "../components/icons";

export function ArtisanList() {
  const [artisans, setArtisans] = useState<Artisan[] | null>(null);
  useEffect(() => { let l = true; api.listArtisans().then((a) => l && setArtisans(a)); return () => { l = false; }; }, []);
  return (
    <main id="main" className="container section--tight">
      <nav className="ka-crumbs" aria-label="Breadcrumb"><Link to="/">Home</Link> / <span aria-current="page">Artisans</span></nav>
      <header style={{ marginBlock: "var(--sp-4) var(--sp-5)", maxWidth: "60ch" }}>
        <p className="eyebrow">The people behind the pieces</p>
        <h1 style={{ marginTop: 0 }}>Every listing has a name, a town and a phone number.</h1>
        <p className="lede">We visit each workshop before onboarding, verify GI-cluster claims, and publish what we saw. Browse by craft cluster or open a profile to read the maker's own account of their process.</p>
      </header>
      {artisans == null ? (
        <div className="grid grid-p4">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ aspectRatio: "4/3", borderRadius: "var(--r-lg)" }} role="status" aria-label="Loading artisans" />)}</div>
      ) : (
        <div className="grid grid-p3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {artisans.map((a) => (
            <article key={a.id} className="card" style={{ overflow: "hidden" }}>
              <Link to={`/artisan/${a.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{ aspectRatio: "16/9", overflow: "hidden" }}>
                  <img src={a.image} alt={`${a.name}, ${a.craft.toLowerCase()} in ${a.location}`} width={800} height={450} loading="lazy" decoding="async"
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 28%" }} />
                </div>
                <div style={{ padding: "14px 16px 18px" }}>
                  <div className="row row--between" style={{ gap: 8 }}>
                    <h2 style={{ fontSize: "1.1rem", margin: 0 }}>{a.name}</h2>
                    {a.verified && <span className="badge badge--success"><IconShield size={12} /> Verified</span>}
                  </div>
                  <p className="text-small text-muted row" style={{ gap: 6, margin: "4px 0 8px" }}><IconPin size={13} /> {a.craft} · {a.location}</p>
                  <Rating value={a.rating} count={a.reviews} />
                  <p className="text-small" style={{ margin: "10px 0 0", color: "var(--ka-ink)" }}>{a.specialties.join(" · ")}</p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export function ArtisanProfile() {
  const { id } = useParams();
  const [artisan, setArtisan] = useState<Artisan | null | undefined>(undefined);
  useEffect(() => { let l = true; api.getArtisan(id ?? "").then((a) => l && setArtisan(a ?? null)); return () => { l = false; }; }, [id]);

  if (artisan === undefined) return <main id="main" className="container section"><div className="skeleton" style={{ height: 400 }} role="status" aria-label="Loading artisan" /></main>;
  if (artisan === null) return <main id="main" className="container section"><ErrorState message="No artisan profile matches that address." onRetry={() => window.location.assign("/artisans")} /></main>;

  const products = PRODUCTS.filter((p) => p.artisanId === artisan.id);

  return (
    <main id="main">
      <section className="band-cream" style={{ paddingTop: "var(--sp-6)" }}>
        <div className="container ka-split" style={{ gap: "var(--sp-6)" }}>
          <img src={artisan.image} alt={`Portrait of ${artisan.name} at work`} width={1200} height={900} fetchPriority="high"
            style={{ borderRadius: "var(--r-lg)", aspectRatio: "4/3", objectFit: "cover", objectPosition: "center 25%", boxShadow: "var(--sh-md)" }} />
          <div>
            <nav className="ka-crumbs" aria-label="Breadcrumb"><Link to="/">Home</Link> / <Link to="/artisans">Artisans</Link> / <span aria-current="page">{artisan.name}</span></nav>
            <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
              <h1 style={{ margin: 0 }}>{artisan.name}</h1>
              {artisan.verified ? <span className="badge badge--success"><IconCheck size={12} /> Verified partner</span> : <span className="badge badge--warning">Verification in progress</span>}
            </div>
            <p className="text-muted row" style={{ gap: 6, margin: "6px 0 var(--sp-3)" }}><IconPin size={15} /> {artisan.craft} · {artisan.location} · practising since {artisan.since}</p>
            <Rating value={artisan.rating} count={artisan.reviews} />
            <p style={{ marginTop: "var(--sp-4)" }}>{artisan.story}</p>
            <div className="row row--wrap" style={{ gap: 8 }}>
              {artisan.specialties.map((s) => <span key={s} className="badge badge--neutral">{s}</span>)}
            </div>
          </div>
        </div>
      </section>
      <section className="section container" aria-labelledby="work-h">
        <h2 id="work-h">Current work ({products.length})</h2>
        {products.length === 0 ? <EmptyState title="Nothing listed yet" body="This workshop is preparing its catalogue — check back soon." /> : (
          <div className="grid grid-p4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </main>
  );
}
