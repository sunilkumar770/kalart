import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, PRODUCTS, formatINR } from "../data/store";
import { useApp } from "../context/AppContext";
import { EmptyState, Field, Price } from "../components/ui";
import { IconArrowRight, IconMinus, IconPlus, IconShield, IconTrash, IconTruck } from "../components/icons";

export default function Cart() {
  const { cart, setQty, toast, user } = useApp();
  const nav = useNavigate();
  const [placing, setPlacing] = useState(false);

  const subtotal = useMemo(() => cart.reduce((s, l) => s + l.unitPrice * l.qty, 0), [cart]);
  const shipping = subtotal >= 2000 || subtotal === 0 ? 0 : 99;

  if (cart.length === 0) {
    return (
      <main id="main" className="container section">
        <EmptyState title="Your bag is empty"
          body="Everything here is made to order by a named artisan — start with the bestsellers or open the customisation studio."
          action={{ label: "Browse the collection", to: "/shop" }} />
      </main>
    );
  }

  const checkout = async () => {
    if (!user) {
      toast("info", "Please sign in to complete your order.");
      nav("/login?next=/checkout");
      return;
    }
    setPlacing(true);
    try {
      const order = await api.placeOrder({ userEmail: user.email, address: "" });
      toast("success", `Order ${order.id} placed.`);
      nav(`/orders/${order.id}`);
    } catch (e: any) {
      toast("error", e.message ?? "Couldn't place the order.");
      nav("/checkout");
    } finally { setPlacing(false); }
  };

  return (
    <main id="main" className="container section--tight">
      <nav className="ka-crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link> / <span aria-current="page">Shopping bag</span>
      </nav>
      <h1 style={{ marginBottom: "var(--sp-5)" }}>Your bag</h1>
      <div className="ka-shop" style={{ gridTemplateColumns: "minmax(0,1fr) 340px" }}>
        <section className="stack" aria-label="Bag items">
          {cart.map((l, i) => {
            const p = PRODUCTS.find((x) => x.id === l.productId)!;
            return (
              <article key={l.productId + JSON.stringify(l.options)} className="card card--pad row" style={{ gap: "var(--sp-4)", alignItems: "flex-start" }}>
                <img src={p.images[0]} alt={p.name} width={96} height={96} loading="lazy"
                  style={{ width: 96, height: 96, borderRadius: "var(--r-md)", objectFit: "cover", border: "1px solid var(--ka-line)", flex: "none" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link to={`/product/${p.slug}`} style={{ fontWeight: 650, color: "var(--ka-charcoal)", textDecoration: "none" }}>{p.name}</Link>
                  {Object.keys(l.options).length > 0 && (
                    <ul className="text-small text-muted" style={{ margin: "6px 0 0", paddingLeft: 18 }}>
                      {Object.entries(l.options).map(([k, v]) => <li key={k}>{k}: {v}</li>)}
                    </ul>
                  )}
                  <p className="text-small text-muted" style={{ margin: "6px 0 0" }}>Unit price {formatINR(l.unitPrice)}</p>
                </div>
                <div className="row" style={{ gap: "var(--sp-4)", flexWrap: "wrap" }}>
                  <div className="ka-stepper" role="group" aria-label={`Quantity for ${p.name}`}>
                    <button onClick={() => setQty(i, l.qty - 1)} aria-label="Decrease quantity"><IconMinus size={14} /></button>
                    <output aria-live="polite">{l.qty}</output>
                    <button onClick={() => setQty(i, Math.min(p.stock, l.qty + 1))} disabled={l.qty >= p.stock} aria-label="Increase quantity"><IconPlus size={14} /></button>
                  </div>
                  <strong className="mono-num" style={{ minWidth: 84, textAlign: "right", color: "var(--ka-charcoal)" }}>{formatINR(l.unitPrice * l.qty)}</strong>
                  <button className="btn btn--ghost btn--sm" aria-label={`Remove ${p.name} from bag`}
                    onClick={() => { setQty(i, 0); toast("info", `${p.name} removed.`); }}>
                    <IconTrash size={15} />
                  </button>
                </div>
              </article>
            );
          })}
          <p className="text-small text-muted row" style={{ gap: 8 }}>
            <IconTruck size={15} /> Customised items enter production only after the artisan confirms feasibility — you approve every change.
          </p>
        </section>

        <aside className="ka-buybox card card--pad stack" aria-label="Order summary">
          <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Summary</h2>
          <div className="row row--between text-small"><span>Subtotal</span><strong className="mono-num">{formatINR(subtotal)}</strong></div>
          <div className="row row--between text-small"><span>Shipping{subtotal >= 2000 ? " (free over ₹2,000)" : ""}</span><strong className="mono-num">{shipping === 0 ? "Free" : formatINR(shipping)}</strong></div>
          <hr className="divider" style={{ margin: 0 }} />
          <div className="row row--between"><strong>Total</strong><Price value={subtotal + shipping} /></div>
          <button className="btn btn--primary btn--block" onClick={checkout} disabled={placing}>
            {placing ? "Placing order…" : <>Secure checkout <IconArrowRight size={15} /></>}
          </button>
          <p className="text-small text-muted row" style={{ gap: 8, margin: 0 }}>
            <IconShield size={15} /> Payment is simulated in this build; no card details are collected.
          </p>
        </aside>
      </div>
    </main>
  );
}
