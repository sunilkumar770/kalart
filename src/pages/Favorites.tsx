import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, PRODUCTS } from "../data/store";
import { useApp } from "../context/AppContext";
import { EmptyState, ProductCard } from "../components/ui";
import { IconHeart } from "../components/icons";

export default function Favorites() {
  const { favorites } = useApp();
  const [items, setItems] = useState<typeof PRODUCTS | null>(null);
  useEffect(() => { let l = true; api.listProducts().then((p) => l && setItems(p.filter((x) => favorites.includes(x.id)))); return () => { l = false; }; }, [favorites]);

  return (
    <main id="main" className="container section--tight">
      <nav className="ka-crumbs" aria-label="Breadcrumb"><Link to="/">Home</Link> / <span aria-current="page">Favourites</span></nav>
      <div className="row" style={{ gap: 12, marginBlock: "var(--sp-4) var(--sp-5)" }}>
        <IconHeart size={26} />
        <h1 style={{ margin: 0 }}>Saved pieces</h1>
      </div>
      {items == null ? (
        <div className="grid grid-p4">{[0, 1].map((i) => <div key={i} className="skeleton" style={{ aspectRatio: "1/1" }} role="status" aria-label="Loading favourites" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState title="Nothing saved yet" body="Tap the heart on any piece to keep it here while you decide." action={{ label: "Find something to save", to: "/shop" }} />
      ) : (
        <div className="grid grid-p4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </main>
  );
}
