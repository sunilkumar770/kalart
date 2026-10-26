import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, ARTISANS, PRODUCTS, formatINR, type DesignRequest, type Order } from "../data/store";
import { useApp } from "../context/AppContext";
import { EmptyState, StatusBadge } from "../components/ui";
import { IconCheck, IconClose, IconShield, IconChart, IconBox, IconRupee, IconSparkle, IconAlert } from "../components/icons";

type Tab = "overview" | "verification" | "requests" | "orders" | "moderation";

export default function AdminDashboard() {
  const { user, toast } = useApp();
  const [tab, setTab] = useState<Tab>("overview");
  const [requests, setRequests] = useState<DesignRequest[] | null>(null);
  const [orders, setOrders] = useState<Order[]>(null as any);
  const [approvedArtisans, setApprovedArtisans] = useState<string[]>(() => ARTISANS.filter((a) => a.verified).map((a) => a.id));

  const load = () => {
    api.allRequests().then(setRequests);
    api.listOrders().then(setOrders);
  };
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const gmv = useMemo(() => (orders ?? []).filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0), [orders]);
  const pendingVerification = ARTISANS.filter((a) => !approvedArtisans.includes(a.id));

  if (user?.role !== "admin") {
    return (
      <main id="main" className="container section">
        <EmptyState title="Admin console — restricted"
          body="Sign in with admin@kalart.in / demo1234 to review artisan verification, custom-order health and moderation queues."
          action={{ label: "Sign in as admin", to: "/login?next=/admin" }} />
      </main>
    );
  }

  const TABS: Array<[Tab, string]> = [
    ["overview", "Overview"], ["verification", "Verification"], ["requests", "Custom orders"], ["orders", "Refunds & disputes"], ["moderation", "Listings"],
  ];

  return (
    <main id="main" className="container section--tight">
      <div style={{ marginBlock: "var(--sp-4)" }}>
        <p className="eyebrow" style={{ marginBottom: 2 }}>Operations</p>
        <h1 style={{ margin: 0 }}>Platform console</h1>
      </div>

      <div className="ka-chipbar" role="tablist" aria-label="Admin sections" style={{ marginBottom: "var(--sp-5)" }}>
        {TABS.map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={"ka-chip" + (tab === k ? " ka-chip--on" : "")}>{l}</button>
        ))}
      </div>

      {tab === "overview" && (
        <section className="stack" aria-label="Platform metrics" style={{ gap: "var(--sp-5)" }}>
          <div className="ka-kpis">
            <Kpi icon={<IconRupee size={17} />} num={formatINR(gmv)} lbl="Gross merchandise value" />
            <Kpi icon={<IconBox size={17} />} num={String((orders ?? []).length)} lbl="Orders (all statuses)" />
            <Kpi icon={<IconSparkle size={17} />} num={String((requests ?? []).filter((r) => r.status === "new").length)} lbl="Open custom briefs" />
            <Kpi icon={<IconShield size={17} />} num={`${approvedArtisans.length}/${ARTISANS.length}`} lbl="Verified artisans" />
          </div>
          <div className="card card--pad">
            <h2 style={{ fontSize: "1.05rem", marginTop: 0 }}>Operational notes</h2>
            <ul className="stack" style={{ margin: 0, paddingLeft: 18, gap: 8, fontSize: "0.92rem" }}>
              <li>{pendingVerification.length} artisan application(s) awaiting authenticity evidence review.</li>
              <li>{(requests ?? []).filter((r) => r.status === "revision_requested").length} custom order(s) stuck in revision loops — SLA is 48 h.</li>
              <li>Audit trail: every approval below records the acting admin and timestamp in production builds.</li>
            </ul>
          </div>
        </section>
      )}

      {tab === "verification" && (
        <section aria-labelledby="ver-h">
          <h2 id="ver-h" style={{ fontSize: "1.2rem" }}>Artisan verification queue</h2>
          <div className="table-wrap">
            <table className="table">
              <caption className="sr-only">Artisan accounts and verification state</caption>
              <thead><tr><th>Artisan</th><th>Craft & location</th><th>Evidence</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {ARTISANS.map((a) => {
                  const verified = approvedArtisans.includes(a.id);
                  return (
                    <tr key={a.id}>
                      <td className="row" style={{ gap: 10 }}>
                        <img src={a.image} alt="" width={36} height={36} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
                        <Link to={`/artisan/${a.id}`}>{a.name}</Link>
                      </td>
                      <td>{a.craft} · {a.location.split(",")[1]?.trim() ?? a.location}</td>
                      <td className="text-small text-muted">{verified ? "Workshop photos + GI tag cross-check" : "2 photos uploaded, unreviewed"}</td>
                      <td>{verified ? <span className="badge badge--success"><IconCheck size={12} /> Verified</span> : <span className="badge badge--warning"><IconAlert size={12} /> Pending</span>}</td>
                      <td>
                        {verified ? (
                          <button className="btn btn--ghost btn--sm" style={{ color: "var(--ka-error)" }}
                            onClick={() => { setApprovedArtisans((s) => s.filter((x) => x !== a.id)); toast("info", `${a.name} unverified — listing visibility reduced.`); }}>
                            Revoke
                          </button>
                        ) : (
                          <button className="btn btn--primary btn--sm"
                            onClick={() => { setApprovedArtisans((s) => [...s, a.id]); toast("success", `${a.name} verified.`); }}>
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "requests" && (
        <section aria-labelledby="req-h">
          <h2 id="req-h" style={{ fontSize: "1.2rem" }}>Custom-order monitoring</h2>
          {requests == null ? <div className="skeleton" style={{ height: 200 }} role="status" aria-label="Loading" /> : (
            <div className="table-wrap">
              <table className="table">
                <caption className="sr-only">All design requests across artisans</caption>
                <thead><tr><th>Request</th><th>Customer / Artisan</th><th>Brief</th><th>Age</th><th>Status</th></tr></thead>
                <tbody>
                  {requests.map((r) => {
                    const a = ARTISANS.find((x) => x.id === r.artisanId);
                    const age = Math.round((Date.now() - new Date(r.receivedAt).getTime()) / 864e5);
                    return (
                      <tr key={r.id}>
                        <td><strong>{r.id}</strong><br /><span className="text-small text-muted">{r.orderRef}</span></td>
                        <td className="text-small">{r.customer}<br />{a?.name}</td>
                        <td className="text-small" style={{ maxWidth: 280 }}>{r.summary}</td>
                        <td>{age} d {age > 2 && r.status === "new" ? <span className="badge badge--error">SLA breach</span> : ""}</td>
                        <td><StatusBadge status={r.status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {tab === "orders" && (
        <section aria-labelledby="ord-h">
          <h2 id="ord-h" style={{ fontSize: "1.2rem" }}>Orders, refunds & complaints</h2>
          <div className="table-wrap">
            <table className="table">
              <caption className="sr-only">All platform orders</caption>
              <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {(orders ?? []).map((o) => (
                  <tr key={o.id}>
                    <td><Link to={`/orders/${o.id}`}>{o.id}</Link></td>
                    <td className="text-small">{o.userEmail}</td>
                    <td className="mono-num">{formatINR(o.total)}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td className="row" style={{ gap: 6 }}>
                      {o.status === "delivered" && <button className="btn btn--ghost btn--sm" onClick={() => toast("info", `Refund of ${formatINR(o.total)} queued for ${o.id}.`)}>Refund</button>}
                      {!["cancelled", "delivered"].includes(o.status) && (
                        <button className="btn btn--ghost btn--sm" onClick={() => toast("success", `Support ticket opened for ${o.id}.`)}>Open complaint</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "moderation" && (
        <section aria-labelledby="mod-h">
          <h2 id="mod-h" style={{ fontSize: "1.2rem" }}>Listing moderation</h2>
          <p className="text-small text-muted">Authenticity spot-checks on live catalogue. Flagged listings drop out of search until resolved.</p>
          <div className="table-wrap">
            <table className="table">
              <caption className="sr-only">Product listings</caption>
              <thead><tr><th>Product</th><th>Artisan</th><th>Category</th><th>Stock</th><th>Actions</th></tr></thead>
              <tbody>
                {PRODUCTS.slice(0, 12).map((p) => (
                  <ModerationRow key={p.id} pid={p.id} name={p.name} slug={p.slug} artisan={ARTISANS.find((a) => a.id === p.artisanId)?.name ?? "—"} cat={p.categorySlug} stock={p.stock} toast={toast} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}

function ModerationRow({ pid, name, slug, artisan, cat, stock, toast }: any) {
  const [flagged, setFlagged] = useState(false);
  return (
    <tr style={flagged ? { background: "var(--ka-warning-soft)" } : undefined}>
      <td><Link to={`/product/${slug}`}>{name}</Link></td>
      <td className="text-small">{artisan}</td>
      <td className="text-small" style={{ textTransform: "capitalize" }}>{cat.replace("-", " ")}</td>
      <td>{stock}</td>
      <td className="row" style={{ gap: 6 }}>
        {flagged ? (
          <button className="btn btn--outline btn--sm" onClick={() => { setFlagged(false); toast("success", `${name} cleared and restored to search.`); }}>Clear flag</button>
        ) : (
          <button className="btn btn--ghost btn--sm" style={{ color: "var(--ka-error)" }} onClick={() => { setFlagged(true); toast("info", `${name} flagged for authenticity review.`); }}>Flag</button>
        )}
      </td>
    </tr>
  );
}

function Kpi({ icon, num, lbl }: { icon: React.ReactNode; num: string; lbl: string }) {
  return (
    <div className="card ka-kpi">
      <span className="row" style={{ color: "var(--ka-muted)", marginBottom: 6 }}>{icon}</span>
      <div className="num mono-num">{num}</div>
      <div className="lbl">{lbl}</div>
    </div>
  );
}
