import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ARTISANS, type Product } from "../data/store";
import {
  ProductCard,
  ProductCardSkeleton,
  ArtisanCarouselCard,
  ArtisanCardSkeleton,
  EmptyState,
  ErrorState,
} from "../components/ui";
import {
  IconArrowRight,
  IconSparkle,
  IconCraftHandloom,
  IconCraftBlockPrint,
  IconCraftPottery,
  IconCraftBrass,
  IconCraftJewellery,
  IconCraftMojari,
} from "../components/icons";

const CRAFT_CHIPS = [
  { slug: "all", name: "All crafts", Icon: IconSparkle },
  { slug: "textiles", name: "Handloom", Icon: IconCraftHandloom },
  { slug: "block-print", name: "Block Print", Icon: IconCraftBlockPrint },
  { slug: "pottery", name: "Pottery", Icon: IconCraftPottery },
  { slug: "lamps", name: "Brass Lamps", Icon: IconCraftBrass },
  { slug: "jewelry", name: "Jewellery", Icon: IconCraftJewellery },
  { slug: "footwear", name: "Mojari", Icon: IconCraftMojari },
];

export default function Home() {
  const [selectedCraft, setSelectedCraft] = useState<string>("all");
  const [products, setProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollection = () => {
    setLoading(true);
    setError(null);
    api
      .listProducts(selectedCraft === "all" ? { sort: "rating" } : { category: selectedCraft })
      .then((p) => {
        setProducts(p.slice(0, 4));
        setLoading(false);
      })
      .catch(() => {
        setError("Couldn't load collection");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCollection();
  }, [selectedCraft]);

  const verifiedArtisans = ARTISANS.filter((a) => a.verified);

  return (
    <main id="main">
      {/* 3. HERO SECTION (NO Image, Editorial Fraunces, 2 Full-Width CTAs) */}
      <section className="section--tight" style={{ borderBottom: "1px solid var(--ka-line)", background: "var(--ka-ivory)" }}>
        <div className="container" style={{ maxWidth: 680 }}>
          <span className="eyebrow" style={{ display: "block", marginBottom: 6 }}>
            Master Artisan Guild · Direct Trade
          </span>
          <h1 style={{ marginBottom: "var(--sp-3)", lineHeight: 1.15 }}>
            Craft with a signature. Made for you, by them.
          </h1>
          <p className="lede" style={{ fontSize: "1.02rem", marginBottom: "var(--sp-5)", color: "var(--ka-ink)" }}>
            Direct from master Indian weavers, potters, and metalworkers. Customise and preview before crafting begins.
          </p>
          <div className="stack" style={{ gap: "var(--sp-3)" }}>
            <Link to="/shop" className="btn btn--primary" style={{ width: "100%", justifyContent: "center", minHeight: 48 }}>
              Shop the collection <IconArrowRight size={16} />
            </Link>
            <Link to="/customize" className="btn btn--outline" style={{ width: "100%", justifyContent: "center", minHeight: 48, borderColor: "var(--ka-indigo)", color: "var(--ka-indigo)" }}>
              <IconSparkle size={16} /> Start a custom order
            </Link>
          </div>
        </div>
      </section>

      {/* 4. HORIZONTALLY SCROLLING CRAFT CHIPS (6 crafts with clean silhouette SVG icons) */}
      <section style={{ borderBottom: "1px solid var(--ka-line)", background: "var(--ka-ivory)", padding: "10px 0" }} aria-label="Craft Categories">
        <div className="container">
          <div className="ka-chips-scroll" role="tablist" aria-label="Filter by craft">
            {CRAFT_CHIPS.map((chip) => {
              const active = selectedCraft === chip.slug;
              const Icon = chip.Icon;
              return (
                <button
                  key={chip.slug}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedCraft(chip.slug)}
                  className={`ka-chip-item ${active ? "ka-chip-item--active" : ""}`}
                >
                  <Icon size={18} />
                  <span>{chip.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. "MOST LOVED" 2-UP PRODUCT CARD GRID (4 products) */}
      <section className="section--tight" aria-labelledby="most-loved-h">
        <div className="container">
          <div className="row row--between" style={{ marginBottom: "var(--sp-4)", alignItems: "baseline" }}>
            <div>
              <p className="eyebrow" id="most-loved-h" style={{ marginBottom: 2 }}>
                Authentic Craft Pieces
              </p>
              <h2 style={{ margin: 0, fontSize: "1.38rem" }}>Most loved</h2>
            </div>
            <Link to="/shop" className="btn btn--ghost btn--sm" style={{ padding: "6px 10px" }}>
              View all <IconArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid-2up" role="status" aria-label="Loading collection">
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={fetchCollection} />
          ) : !products || products.length === 0 ? (
            <EmptyState
              title="No pieces found in this craft"
              body="We could not find active pieces in this workshop category right now. Browse our complete artisan collection."
              action={{ label: "View all crafts", onClick: () => setSelectedCraft("all") }}
            />
          ) : (
            <div className="grid-2up">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. "HOW CUSTOM ORDERS WORK" (4 Numbered Steps, 1-line each) */}
      <section className="section--tight band-stone" aria-labelledby="custom-steps-h">
        <div className="container" style={{ maxWidth: 680 }}>
          <p className="eyebrow" id="custom-steps-h" style={{ marginBottom: 4 }}>
            Direct Guild Commission
          </p>
          <h2 style={{ margin: "0 0 var(--sp-2)", fontSize: "1.38rem" }}>
            How custom orders work
          </h2>
          <p className="text-small text-muted" style={{ margin: "0 0 var(--sp-4)" }}>
            Bespoke craft directly from traditional Indian clusters in four transparent steps.
          </p>

          <div className="ka-custom-steps">
            <div className="ka-custom-step-item">
              <span className="ka-custom-step-num">01</span>
              <p className="ka-custom-step-text">Share your vision, palette, or dimensions</p>
            </div>
            <div className="ka-custom-step-item">
              <span className="ka-custom-step-num">02</span>
              <p className="ka-custom-step-text">Match directly with a verified master guild</p>
            </div>
            <div className="ka-custom-step-item">
              <span className="ka-custom-step-num">03</span>
              <p className="ka-custom-step-text">Review live preview &amp; transparent workshop quote</p>
            </div>
            <div className="ka-custom-step-item">
              <span className="ka-custom-step-num">04</span>
              <p className="ka-custom-step-text">Certified GI dispatch delivered to your door</p>
            </div>
          </div>

          <div style={{ marginTop: "var(--sp-4)" }}>
            <Link to="/customize" className="btn btn--primary" style={{ width: "100%", justifyContent: "center", minHeight: 48 }}>
              Open Customisation Studio <IconArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. "MEET THE MAKERS" (Horizontal Carousel of Artisan Cards) */}
      <section className="section--tight" aria-labelledby="makers-h">
        <div className="container">
          <div className="row row--between" style={{ marginBottom: "var(--sp-4)", alignItems: "baseline" }}>
            <div>
              <p className="eyebrow" id="makers-h" style={{ marginBottom: 2 }}>
                Living Heritage Lineage
              </p>
              <h2 style={{ margin: 0, fontSize: "1.38rem" }}>Meet the makers</h2>
            </div>
            <Link to="/artisans" className="btn btn--ghost btn--sm" style={{ padding: "6px 10px" }}>
              All {ARTISANS.length} artisans <IconArrowRight size={14} />
            </Link>
          </div>

          <div className="ka-maker-carousel" aria-label="Artisan maker list">
            {verifiedArtisans.length === 0 ? (
              <ArtisanCardSkeleton />
            ) : (
              verifiedArtisans.slice(0, 5).map((artisan) => (
                <ArtisanCarouselCard key={artisan.id} artisan={artisan} />
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
