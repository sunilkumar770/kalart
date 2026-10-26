import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, CATEGORIES, categoryName, PRODUCTS, type Product } from "../data/store";
import { CategoryTile, EmptyState, GridSkeleton, ProductCard } from "../components/ui";
import { IconArrowRight } from "../components/icons";

export function CraftsIndex() {
  return (
    <main id="main" className="container section--tight">
      <nav className="ka-crumbs" aria-label="Breadcrumb"><Link to="/">Home</Link> / <span aria-current="page">Crafts</span></nav>
      <header style={{ marginBlock: "var(--sp-4) var(--sp-5)", maxWidth: "58ch" }}>
        <p className="eyebrow">Ten living traditions</p>
        <h1 style={{ marginTop: 0 }}>Browse by craft</h1>
        <p className="lede">Each cluster below names the technique, the region it comes from, and the workshops we partner with there.</p>
      </header>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "var(--sp-6)" }}>
        {CATEGORIES.map((c) => <CategoryTile key={c.slug} {...c} />)}
      </div>
    </main>
  );
}

export function CraftDetail() {
  const { slug } = useParams();
  const cat = CATEGORIES.find((c) => c.slug === slug);
  const [items, setItems] = useState<Product[] | null>(null);
  useEffect(() => { let l = true; api.listProducts({ category: slug }).then((p) => l && setItems(p)); return () => { l = false; }; }, [slug]);

  if (!cat) {
    return <main id="main" className="container section"><EmptyState title="Unknown craft" body="That craft page doesn't exist yet." action={{ label: "All crafts", to: "/crafts" }} /></main>;
  }
  const makers = [...new Set(PRODUCTS.filter((p) => p.categorySlug === slug).map((p) => p.artisanId))];

  return (
    <main id="main" className="container section--tight">
      <nav className="ka-crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link> / <Link to="/crafts">Crafts</Link> / <span aria-current="page">{cat.name}</span>
      </nav>
      <header className="ka-split" style={{ gap: "var(--sp-5)", alignItems: "center", marginBlock: "var(--sp-4) var(--sp-5)" }}>
        <div>
          <p className="eyebrow">{makers.length} partner workshop{makers.length === 1 ? "" : "s"}</p>
          <h1 style={{ marginTop: 0 }}>{cat.name}</h1>
          <p className="lede">{cat.blurb} Every piece lists its maker, materials and honest lead time before you order.</p>
          <Link to={`/shop?category=${cat.slug}`} className="btn btn--outline">
            Filter shop to {cat.name.toLowerCase()} <IconArrowRight size={15} />
          </Link>
        </div>
        <img src={cat.image} alt={`${cat.name} example work`} width={900} height={700} fetchPriority="high"
          style={{ borderRadius: "var(--r-lg)", aspectRatio: "4/3", objectFit: "cover", boxShadow: "var(--sh-md)" }} />
      </header>
      <hr className="divider" />
      <h2 style={{ fontSize: "1.2rem" }}>Pieces available now</h2>
      {items == null ? <GridSkeleton n={4} /> : items.length === 0 ? (
        <EmptyState title="Awaiting this season's drop" body="Workshops restock after each festival cycle." action={{ label: "Browse all pieces", to: "/shop" }} />
      ) : (
        <div className="grid grid-p4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </main>
  );
}
