import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, PRODUCTS, formatINR, type Order } from "../data/store";
import { useApp } from "../context/AppContext";
import { ErrorState, StatusBadge } from "../components/ui";
import { IconArrowRight, IconCheck, IconTruck, IconAlert, IconChat } from "../components/icons";

const FLOW = ["placed", "customization_review", "in_production", "shipped", "delivered"] as const;

export function OrdersList() {
  const { user } = useApp();
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    if (!user) return;
    let live = true;
    api.listOrders(user.email).then((o) => live && setOrders(o));
    return () => { live = false; };
  }, [user]);

  if (!user) {
    return (
      <main id="main" className="container section">
        <ErrorState message="Sign in to see your orders and production status." onRetry={() => window.location.assign("/login?next=/account/orders")} />
        <div className="text-center"><Link className="btn btn--primary" to="/login">Sign in <IconArrowRight size={15} /></Link></div>
      </main>
    );
  }

  return (
    <main id="main" className="container section--tight">
      <nav className="ka-crumbs" aria-label="Breadcrumb"><Link to="/">Home</Link> / <span aria-current="page">My orders</span></nav>
      <h1 style={{ marginBottom: "var(--sp-5)" }}>Order history</h1>
      {orders == null ? (
        <div className="stack" role="status" aria-label="Loading orders">
          {[0, 1].map((i) => <div key={i} className="skeleton" style={{ height: 120 }} />)}
        </div>
      ) : orders.length === 0 ? (
        <p className="text-muted">No orders yet. <Link to="/shop">Start with the collection</Link> or open the <Link to="/customize">customisation studio</Link>.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <caption className="sr-only">Your past and current orders</caption>
            <thead><tr><th scope="col">Order</th><th scope="col">Placed</th><th scope="col">Items</th><th scope="col">Total</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Open</span></th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td><strong>{o.id}</strong></td>
                  <td>{new Date(o.placedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td>{o.lines.reduce((s, l) => s + l.qty, 0)}</td>
                  <td className="mono-num">{formatINR(o.total)}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td><Link to={`/orders/${o.id}`} aria-label={`Open order ${o.id}`}>View <IconArrowRight size={13} /></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

export function OrderDetail() {
  const { id } = useParams();
  const { toast, user } = useApp();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const justPlaced = new URLSearchParams(window.location.search).get("new") === "1";

  useEffect(() => {
    let live = true;
    api.getOrder(id ?? "").then((o) => live && setOrder(o ?? null));
    return () => { live = false; };
  }, [id]);

  if (order === undefined) return <main id="main" className="container section"><div className="skeleton" style={{ height: 340 }} aria-label="Loading order" role="status" /></main>;
  if (order === null) return <main id="main" className="container section"><ErrorState message={`No order ${id} exists on this account.`} onRetry={() => window.location.assign("/account/orders")} /></main>;

  const idx = FLOW.indexOf(order.status as any);

  const advance = async () => {
    setBusy(true);
    const next = await api.advanceOrder(order.id, "Progressed by workshop.");
    if (next) { setOrder({ ...next }); toast("success", `Order moved to “${next.status.replace(/_/g, " ")}”.`); }
    setBusy(false);
  };
  const cancel = async () => {
    setBusy(true);
    try {
      const o = await api.cancelOrder(order.id);
      if (o) { setOrder({ ...o }); toast("info", "Order cancelled — refund initiated to original method."); }
    } catch (e: any) { toast("error", e.message); }
    setBusy(false);
  };

  return (
    <main id="main" className="container section--tight">
      <nav className="ka-crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link> / <Link to="/account/orders">Orders</Link> / <span aria-current="page">{order.id}</span>
      </nav>

      {justPlaced && (
        <div className="card card--pad row" role="status" style={{ gap: 14, borderColor: "var(--ka-success)", background: "var(--ka-success-soft)", marginBottom: "var(--sp-5)" }}>
          <span style={{ color: "var(--ka-success)" }}><IconCheck size={26} /></span>
          <div>
            <strong style={{ color: "var(--ka-charcoal)" }}>Thank you — your commission is confirmed.</strong>
            <p className="text-small" style={{ margin: "2px 0 0" }}>The artisan has been notified. Custom items begin only after you approve the feasibility note.</p>
          </div>
        </div>
      )}

      <div className="row row--between row--wrap" style={{ gap: "var(--sp-3)", marginBottom: "var(--sp-5)" }}>
        <div>
          <h1 style={{ margin: 0 }}>{order.id}</h1>
          <p className="text-muted text-small" style={{ margin: "4px 0 0" }}>
            Placed {new Date(order.placedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} · Est. delivery {new Date(order.eta).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="ka-shop" style={{ gridTemplateColumns: "minmax(0,1fr) 320px" }}>
        <div className="stack" style={{ gap: "var(--sp-5)" }}>
          <section className="card card--pad" aria-labelledby="tl-h">
            <h2 id="tl-h" style={{ fontSize: "1.05rem", marginTop: 0 }}>Production &amp; delivery</h2>
            <ol className="ka-timeline">
              {FLOW.map((st, i) => {
                const ev = order.timeline.find((t) => t.status === st);
                const state = i < idx || (ev && st !== order.status) ? "done" : i === idx ? "current" : "";
                return (
                  <li key={st} className={state}>
                    <strong style={{ color: "var(--ka-charcoal)", textTransform: "capitalize" }}>{st.replace(/_/g, " ")}</strong>
                    <p className="text-small text-muted" style={{ margin: "2px 0 0" }}>
                      {ev ? `${ev.note} · ${new Date(ev.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : "Awaiting"}
                    </p>
                  </li>
                );
              })}
              {order.status === "cancelled" && (
                <li style={{ color: "var(--ka-error)" }}><strong>Cancelled</strong><p className="text-small" style={{ margin: 0 }}>Refund initiated to original payment method.</p></li>
              )}
            </ol>
            {!["delivered", "cancelled"].includes(order.status) && (
              <div className="row row--wrap" style={{ gap: "var(--sp-3)", marginTop: "var(--sp-4)" }}>
                <button className="btn btn--outline btn--sm" onClick={advance} disabled={busy}>
                  <IconTruck size={14} /> Simulate next workshop update
                </button>
                {idx < 3 && (
                  <button className="btn btn--ghost btn--sm" style={{ color: "var(--ka-error)" }} onClick={cancel} disabled={busy}>Cancel order</button>
                )}
              </div>
            )}
            <p className="text-small text-muted" style={{ margin: "12px 0 0" }}>
              In production builds these updates arrive from the artisan app automatically; the simulate control exists for demo purposes and is labelled as such.
            </p>
          </section>

          <section className="card card--pad" aria-labelledby="items-h">
            <h2 id="items-h" style={{ fontSize: "1.05rem", marginTop: 0 }}>Items</h2>
            <ul className="stack" style={{ listStyle: "none", margin: 0, padding: 0, gap: "var(--sp-4)" }}>
              {order.lines.map((l, i) => {
                const p = PRODUCTS.find((x) => x.id === l.productId);
                const pName = p ? p.name : "Handmade Piece";
                const pImg = p?.images?.[0] || "/img/hero-main.jpg";
                const pSlug = p ? p.slug : "";
                return (
                  <li key={i} className="row" style={{ gap: 14, alignItems: "flex-start" }}>
                    <img src={pImg} alt="" width={72} height={72} style={{ width: 72, height: 72, borderRadius: "var(--r-md)", objectFit: "cover", border: "1px solid var(--ka-line)" }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {pSlug ? (
                        <Link to={`/product/${pSlug}`} style={{ fontWeight: 600, color: "var(--ka-charcoal)", textDecoration: "none" }}>{pName} × {l.qty}</Link>
                      ) : (
                        <span style={{ fontWeight: 600, color: "var(--ka-charcoal)" }}>{pName} × {l.qty}</span>
                      )}
                      {Object.entries(l.options).map(([k, v]) => <p key={k} className="text-small text-muted" style={{ margin: "2px 0 0" }}>{k}: {v}</p>)}
                    </div>
                    <strong className="mono-num" style={{ color: "var(--ka-charcoal)" }}>{formatINR(l.unitPrice * l.qty)}</strong>
                  </li>
                );
              })}
            </ul>
            {order.customNote && (
              <p className="text-small row" style={{ gap: 8, marginBottom: 0, marginTop: "var(--sp-4)", color: "var(--ka-ink)" }}>
                <IconChat size={15} /> Your note: “{order.customNote}”
              </p>
            )}
          </section>
        </div>

        <aside className="stack" aria-label="Summary">
          <div className="card card--pad stack">
            <h2 style={{ fontSize: "1rem", margin: 0 }}>Payment</h2>
            <div className="row row--between text-small"><span>Total paid</span><strong className="mono-num">{formatINR(order.total)}</strong></div>
            <p className="text-small text-muted" style={{ margin: 0 }}>UPI · authorised (simulated)</p>
          </div>
          <div className="card card--pad stack">
            <h2 style={{ fontSize: "1rem", margin: 0 }}>Delivering to</h2>
            <p className="text-small" style={{ margin: 0 }}>{order.address || "Address pending"}</p>
            <p className="text-small text-muted row" style={{ gap: 6, margin: 0 }}><IconAlert size={13} /> Contact support before dispatch to change an address.</p>
          </div>
          <Link to="/help" className="btn btn--outline">Need help with this order?</Link>
        </aside>
      </div>
    </main>
  );
}
