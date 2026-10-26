import { useEffect, useMemo, useState } from "react";
import {
  api,
  ARTISANS,
  PRODUCTS,
  formatINR,
  type DesignRequest,
  type Order,
} from "../data/store";
import { useApp } from "../context/AppContext";
import { StatusBadge } from "../components/ui";
import {
  IconBox,
  IconChart,
  IconRupee,
  IconSparkle,
  IconShield,
  IconCheck,
} from "../components/icons";

export default function AdminDashboard() {
  const { toast } = useApp();
  const [requests, setRequests] = useState<DesignRequest[] | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [approvedArtisans, setApprovedArtisans] = useState<string[]>(() =>
    ARTISANS.filter((a) => a.verified).map((a) => a.id)
  );

  useEffect(() => {
    api.allRequests().then(setRequests);
    api.listOrders().then(setOrders);
  }, []);

  const gmv = useMemo(
    () => orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0),
    [orders]
  );

  const pendingVerification = ARTISANS.filter((a) => !approvedArtisans.includes(a.id));

  const verifyArtisan = (id: string) => {
    setApprovedArtisans((prev) => [...prev, id]);
    const artisan = ARTISANS.find((a) => a.id === id);
    toast("success", `${artisan?.name || "Artisan"} is now verified on KALART`);
  };

  return (
    <main id="main" className="container section--tight">
      <div style={{ marginBlock: "var(--sp-4)" }}>
        <p className="eyebrow" style={{ marginBottom: 2 }}>
          Platform Operations
        </p>
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Admin Console</h1>
        <p className="text-muted text-small" style={{ margin: "4px 0 0" }}>
          Cluster verification, custom order health, and fair-trade integrity.
        </p>
      </div>

      {/* KPI METRICS */}
      <section className="ka-kpis" aria-label="Platform metrics" style={{ marginBottom: "var(--sp-5)" }}>
        <div className="card ka-kpi">
          <div className="row" style={{ gap: 8, color: "var(--ka-clay)", marginBottom: 4 }}>
            <IconRupee size={18} />
            <span className="lbl">Gross Merchandise Value</span>
          </div>
          <div className="num">{formatINR(gmv)}</div>
        </div>
        <div className="card ka-kpi">
          <div className="row" style={{ gap: 8, color: "var(--ka-indigo)", marginBottom: 4 }}>
            <IconBox size={18} />
            <span className="lbl">Total Orders</span>
          </div>
          <div className="num">{orders.length}</div>
        </div>
        <div className="card ka-kpi">
          <div className="row" style={{ gap: 8, color: "var(--ka-warning)", marginBottom: 4 }}>
            <IconSparkle size={18} />
            <span className="lbl">Open Custom Briefs</span>
          </div>
          <div className="num">{(requests || []).filter((r) => r.status === "new").length}</div>
        </div>
        <div className="card ka-kpi">
          <div className="row" style={{ gap: 8, color: "var(--ka-success)", marginBottom: 4 }}>
            <IconShield size={18} />
            <span className="lbl">Verified Workshops</span>
          </div>
          <div className="num">
            {approvedArtisans.length} / {ARTISANS.length}
          </div>
        </div>
      </section>

      {/* VERIFICATION QUEUE */}
      <section style={{ marginBottom: "var(--sp-6)" }}>
        <h2 style={{ fontSize: "1.18rem", marginBottom: "var(--sp-4)" }}>
          Workshop Verification Review ({pendingVerification.length})
        </h2>
        {pendingVerification.length === 0 ? (
          <div className="card card--pad text-center" style={{ color: "var(--ka-muted)" }}>
            <p style={{ margin: 0 }}>All partner workshops currently verified.</p>
          </div>
        ) : (
          <div className="stack" style={{ gap: "var(--sp-4)" }}>
            {pendingVerification.map((a) => (
              <div key={a.id} className="card card--pad row row--between row--wrap" style={{ gap: 16 }}>
                <div className="row" style={{ gap: 14 }}>
                  <img
                    src={a.image}
                    alt=""
                    width={52}
                    height={52}
                    style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover" }}
                  />
                  <div>
                    <strong style={{ fontSize: "1rem" }}>{a.name}</strong>
                    <p className="text-small text-muted" style={{ margin: "2px 0 0" }}>
                      {a.craft} · {a.location} · practicing since {a.since}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  onClick={() => verifyArtisan(a.id)}
                >
                  <IconCheck size={14} /> Verify partner
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* RECENT ORDERS TABLE */}
      <section style={{ marginBottom: "var(--sp-6)" }}>
        <h2 style={{ fontSize: "1.18rem", marginBottom: "var(--sp-4)" }}>
          Recent Platform Orders
        </h2>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Patron</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((o) => (
                <tr key={o.id}>
                  <td>
                    <code>{o.id}</code>
                  </td>
                  <td>{o.userEmail}</td>
                  <td>{o.lines.reduce((s, l) => s + l.qty, 0)} items</td>
                  <td>
                    <strong>{formatINR(o.total)}</strong>
                  </td>
                  <td>
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
