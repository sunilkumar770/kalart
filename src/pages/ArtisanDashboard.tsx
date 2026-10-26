import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api, ARTISANS, PRODUCTS, formatINR, type DesignRequest, type Order } from "../data/store";
import { useApp } from "../context/AppContext";
import { ConfirmDialog, EmptyState, StatusBadge } from "../components/ui";
import {
  IconArrowRight, IconBox, IconChart, IconCheck, IconClose, IconEye,
  IconRupee, IconSparkle, IconUpload, IconRefresh, IconChat, IconShield, IconGrid,
} from "../components/icons";

export default function ArtisanDashboard() {
  const { user, toast } = useApp();
  const artisan = ARTISANS.find((a) => a.id === user?.artisanId) ?? ARTISANS[0];
  const [requests, setRequests] = useState<DesignRequest[] | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const confirmRef = useRef<HTMLDialogElement>(null);
  const pendingDecline = useRef<string | null>(null);

  const myProducts = useMemo(() => PRODUCTS.filter((p) => p.artisanId === artisan.id), [artisan.id]);

  const load = () => {
    api.listRequests(artisan.id).then(setRequests);
    api.listOrders().then((os) => setOrders(os.filter((o) => o.lines.some((l) => PRODUCTS.find((p) => p.id === l.productId)?.artisanId === artisan.id))));
  };
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (user?.role !== "artisan") {
    return (
      <main id="main" className="container section">
        <EmptyState title="Artisan workspace — demo access"
          body={`Sign in with ravi@kalart.in / demo1234 to see ${artisan.name}'s live queue, or explore this view as ${artisan.name}.`}
          action={{ label: `Explore as ${artisan.name}`, onClick: () => window.location.assign("/login") }} />
      </main>
    );
  }

  const act = async (id: string, patch: Partial<DesignRequest>, msg: string) => {
    await api.updateRequest(id, patch);
    setRequests((rs) => (rs ? rs.map((r) => (r.id === id ? { ...r, ...patch } : r)) : rs));
    toast("success", msg);
  };

  const newCount = requests?.filter((r) => r.status === "new").length ?? 0;
  const earnings = orders.reduce((s, o) => s + Math.round(o.total * 0.85), 0);

  return (
    <main id="main" className="container section--tight">
      <div className="row row--between row--wrap" style={{ gap: "var(--sp-3)", marginBlock: "var(--sp-4)" }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: 2 }}>Artisan workspace</p>
          <h1 style={{ margin: 0 }}>{artisan.name}</h1>
          <p className="text-muted text-small" style={{ margin: "4px 0 0" }}>{artisan.craft} · {artisan.location}{artisan.verified ? " · Verified partner" : " · Verification pending"}</p>
        </div>
        <Link to="/sell" className="btn btn--outline btn--sm">Onboarding &amp; verification</Link>
      </div>

      {!artisan.verified && (
        <div className="card card--pad row" style={{ gap: 12, borderColor: "var(--ka-warning)", marginBottom: "var(--sp-4)" }}>
          <IconShield size={20} />
          <p className="text-small" style={{ margin: 0 }}>Upload two authenticity photos of your workshop to complete verification and unlock featured placement.</p>
        </div>
      )}

      <section className="ka-kpis" aria-label="Key metrics" style={{ marginBottom: "var(--sp-5)" }}>
        <Kpi icon={<IconSparkle size={17} />} num={String(newCount)} lbl="New design requests" tone={newCount ? "clay" : undefined} />
        <Kpi icon={<IconBox size={17} />} num={String(orders.filter((o) => ["placed", "customization_review", "in_production"].includes(o.status)).length)} lbl="In production" />
        <Kpi icon={<IconRupee size={17} />} num={formatINR(earnings)} lbl="Earnings (85% share)" />
        <Kpi icon={<IconChart size={17} />} num={`${artisan.rating} ★`} lbl={`${artisan.reviews} reviews`} />
      </section>

      <div className="ka-dash">
        <nav className="ka-side" aria-label="Workspace sections">
          <SideLink active href="#requests"><IconSparkle size={16} /> Design requests</SideLink>
          <SideLink href="#orders"><IconBox size={16} /> Orders</SideLink>
          <SideLink href="#catalogue"><IconGrid size={16} /> My products</SideLink>
          <SideLink href="#uploads"><IconUpload size={16} /> Add a product</SideLink>
        </nav>

        <div className="stack" style={{ gap: "var(--sp-6)" }}>
          {/* REQUESTS */}
          <section id="requests" aria-labelledby="req-h">
            <h2 id="req-h" style={{ fontSize: "1.2rem" }}>Incoming customisation briefs</h2>
            <p className="text-small text-muted">Review feasibility, request changes, or approve. Customers wait on you here.</p>
            {requests == null ? (
              <div className="stack">{[0, 1].map((i) => <div key={i} className="skeleton" style={{ height: 110 }} role="status" aria-label="Loading requests" />)}</div>
            ) : requests.length === 0 ? (
              <EmptyState title="No open briefs" body="When a customer commissions a customised piece it lands here within seconds." />
            ) : (
              <div className="stack">
                {requests.map((r) => (
                  <article key={r.id} className="card card--pad stack" style={{ gap: "var(--sp-3)" }}>
                    <div className="row row--between" style={{ flexWrap: "wrap", gap: 8 }}>
                      <strong style={{ color: "var(--ka-charcoal)" }}>{r.product} <span className="text-muted" style={{ fontWeight: 400 }}>· {r.orderRef}</span></strong>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-small" style={{ margin: 0 }}>{r.summary}</p>
                    <p className="text-small text-muted" style={{ margin: 0 }}>From {r.customer} · received {new Date(r.receivedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}{r.uploadedRef ? ` · reference attached (${r.uploadedRef})` : ""}</p>
                    {r.feasibilityNote && <p className="text-small row" style={{ gap: 6, margin: 0, color: "var(--ka-indigo)" }}><IconChat size={14} /> {r.feasibilityNote}</p>}
                    {(r.status === "new" || r.status === "revision_requested") && (
                      <div className="row row--wrap" style={{ gap: "var(--sp-2)" }}>
                        <button className="btn btn--primary btn--sm" onClick={() => act(r.id, { status: "approved", feasibilityNote: "Confirmed at listed price; starting after customer approval." }, `Approved ${r.id} — customer notified.`)}>
                          <IconCheck size={14} /> Feasible — approve
                        </button>
                        <button className="btn btn--outline btn--sm" onClick={() => act(r.id, { status: "revision_requested", feasibilityNote: "Could you move the initials 1 cm up? Border sits too close." }, `Revision requested on ${r.id}.`)}>
                          <IconRefresh size={14} /> Request revision
                        </button>
                        <button className="btn btn--ghost btn--sm" style={{ color: "var(--ka-error)" }} onClick={() => { pendingDecline.current = r.id; confirmRef.current?.showModal(); }}>
                          <IconClose size={14} /> Decline
                        </button>
                      </div>
                    )}
                    {r.status === "feasibility_ok" && (
                      <p className="text-small" style={{ margin: 0 }}>Awaiting customer sign-off on your note.</p>
                    )}
                    {r.status === "approved" && (
                      <p className="text-small row" style={{ gap: 6, margin: 0, color: "var(--ka-success)" }}><IconCheck size={14} /> Approved — add to your production board below.</p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* ORDERS */}
          <section id="orders" aria-labelledby="ord-h">
            <h2 id="ord-h" style={{ fontSize: "1.2rem" }}>Production board</h2>
            {orders.length === 0 ? <p className="text-muted text-small">No live orders right now.</p> : (
              <div className="table-wrap">
                <table className="table">
                  <caption className="sr-only">Orders containing your products</caption>
                  <thead><tr><th>Order</th><th>Customer</th><th>Your items</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {orders.map((o) => {
                      const mine = o.lines.filter((l) => PRODUCTS.find((p) => p.id === l.productId)?.artisanId === artisan.id);
                      return (
                        <tr key={o.id}>
                          <td><strong>{o.id}</strong></td>
                          <td>{o.userEmail.split("@")[0]}</td>
                          <td>{mine.map((l) => `${PRODUCTS.find((p) => p.id === l.productId)?.name} ×${l.qty}`).join(", ")}</td>
                          <td><StatusBadge status={o.status} /></td>
                          <td>
                            {["placed", "customization_review"].includes(o.status) ? (
                              <button className="btn btn--secondary btn--sm" onClick={async () => {
                                await api.advanceOrder(o.id, "Craft started at the bench.");
                                toast("success", `${o.id} moved to in production.`);
                                load();
                              }}>Start production</button>
                            ) : o.status === "in_production" ? (
                              <button className="btn btn--outline btn--sm" onClick={async () => {
                                await api.advanceOrder(o.id, "Packed with authenticity card; handed to courier.");
                                toast("success", `${o.id} marked shipped.`);
                                load();
                              }}>Mark shipped</button>
                            ) : <span className="text-muted text-small">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* MY PRODUCTS */}
          <section id="catalogue" aria-labelledby="cat-h">
            <h2 id="cat-h" style={{ fontSize: "1.2rem" }}>My catalogue ({myProducts.length})</h2>
            <div className="table-wrap">
              <table className="table">
                <caption className="sr-only">Your listed products</caption>
                <thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Customisable</th><th>Actions</th></tr></thead>
                <tbody>
                  {myProducts.map((p) => (
                    <tr key={p.id}>
                      <td className="row" style={{ gap: 10 }}>
                        <img src={p.images[0]} alt="" width={40} height={40} style={{ width: 40, height: 40, borderRadius: 6, objectFit: "cover" }} />
                        <Link to={`/product/${p.slug}`}>{p.name}</Link>
                      </td>
                      <td className="mono-num">{formatINR(p.price)}</td>
                      <td>{p.stock}</td>
                      <td>{p.customizable ? <span className="badge badge--indigo">Yes · {p.customization.length} options</span> : <span className="badge badge--neutral">No</span>}</td>
                      <td><Link className="btn btn--ghost btn--sm" to={`/product/${p.slug}`}><IconEye size={14} /> View listing</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ADD PRODUCT GUIDANCE */}
          <section id="uploads" className="card card--pad" aria-labelledby="up-h">
            <h2 id="up-h" style={{ fontSize: "1.1rem", marginTop: 0 }}>Add a new product</h2>
            <ol className="stack" style={{ gap: 10, paddingLeft: 20, margin: 0, fontSize: "0.92rem" }}>
              <li><strong>Photograph on plain cloth</strong> — daylight, no filters. We auto-crop to the square grid customers browse.</li>
              <li><strong>State materials & dimensions honestly</strong> — listings get approved faster when measurements match the photo scale.</li>
              <li><strong>Choose which customisations you can truly deliver</strong> — colourways, sizes, initials. You can change these anytime.</li>
              <li><strong>Set lead time you can keep</strong> — late flags affect featured placement.</li>
            </ol>
            <p className="text-small text-muted" style={{ margin: "var(--sp-4) 0 var(--sp-3)" }}>
              Product creation writes to the platform database in the production build; this demo lists the guided checklist only.
            </p>
            <Link to="/help" className="btn btn--outline btn--sm"><IconArrowRight size={14} /> Talk to a craft manager</Link>
          </section>
        </div>
      </div>

      <ConfirmDialog openRef={confirmRef} title="Decline this brief?"
        body="The customer is refunded fully and told why. Declines are visible to the platform team for quality tracking."
        confirmLabel="Decline request" danger
        onConfirm={() => {
          if (pendingDecline.current) act(pendingDecline.current, { status: "declined", feasibilityNote: "Not feasible with current kiln schedule." }, "Request declined — customer refunded.");
        }} />
    </main>
  );
}

function Kpi({ icon, num, lbl, tone }: { icon: React.ReactNode; num: string; lbl: string; tone?: "clay" }) {
  return (
    <div className="card ka-kpi">
      <span className="row" style={{ color: tone === "clay" ? "var(--ka-clay)" : "var(--ka-muted)", marginBottom: 6 }}>{icon}</span>
      <div className="num mono-num">{num}</div>
      <div className="lbl">{lbl}</div>
    </div>
  );
}
function SideLink({ href, children, active }: { href: string; children: React.ReactNode; active?: boolean }) {
  return <a href={href} className={active ? "ka-navlink--active" : ""}>{children}</a>;
}
