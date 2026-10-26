import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
  IconClose,
} from "../components/icons";

export default function ArtisanDashboard() {
  const { user, toast } = useApp();
  const artisan = ARTISANS.find((a) => a.id === user?.artisanId) ?? ARTISANS[0];

  const [requests, setRequests] = useState<DesignRequest[] | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const load = () => {
    api.listRequests(artisan.id).then(setRequests);
    api.listOrders().then((os) =>
      setOrders(
        os.filter((o) =>
          o.lines.some((l) => PRODUCTS.find((p) => p.id === l.productId)?.artisanId === artisan.id)
        )
      )
    );
  };

  useEffect(load, [artisan.id]);

  const act = async (id: string, patch: Partial<DesignRequest>, msg: string) => {
    await api.updateRequest(id, patch);
    setRequests((rs) => (rs ? rs.map((r) => (r.id === id ? { ...r, ...patch } : r)) : rs));
    toast("success", msg);
  };

  const newCount = requests?.filter((r) => r.status === "new").length ?? 0;
  const myProducts = useMemo(
    () => PRODUCTS.filter((p) => p.artisanId === artisan.id),
    [artisan.id]
  );

  return (
    <main id="main" className="container section--tight">
      <div
        className="row row--between row--wrap"
        style={{ gap: "var(--sp-3)", marginBlock: "var(--sp-4)" }}
      >
        <div className="row" style={{ gap: 14 }}>
          <img
            src={artisan.image}
            alt=""
            width={60}
            height={60}
            style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover" }}
          />
          <div>
            <p className="eyebrow" style={{ marginBottom: 2 }}>
              Artisan Workspace
            </p>
            <h1 style={{ margin: 0, fontSize: "1.45rem" }}>{artisan.name}'s Studio</h1>
            <p className="text-muted text-small" style={{ margin: "4px 0 0" }}>
              {artisan.craft} · {artisan.location}
              {artisan.verified ? " · Verified partner" : " · Verification pending"}
            </p>
          </div>
        </div>
        <Link to="/sell" className="btn btn--outline btn--sm">
          Workshop profile &amp; policies
        </Link>
      </div>

      {/* KPI METRICS */}
      <section className="ka-kpis" aria-label="Key metrics" style={{ marginBottom: "var(--sp-5)" }}>
        <div className="card ka-kpi">
          <div className="row" style={{ gap: 8, color: "var(--ka-clay)", marginBottom: 4 }}>
            <IconSparkle size={18} />
            <span className="lbl">New Briefs</span>
          </div>
          <div className="num">{newCount}</div>
        </div>
        <div className="card ka-kpi">
          <div className="row" style={{ gap: 8, color: "var(--ka-indigo)", marginBottom: 4 }}>
            <IconBox size={18} />
            <span className="lbl">In Production</span>
          </div>
          <div className="num">
            {orders.filter((o) => ["placed", "customization_review", "in_production"].includes(o.status)).length}
          </div>
        </div>
        <div className="card ka-kpi">
          <div className="row" style={{ gap: 8, color: "var(--ka-success)", marginBottom: 4 }}>
            <IconRupee size={18} />
            <span className="lbl">Fair Trade Share</span>
          </div>
          <div className="num">0% cut</div>
        </div>
        <div className="card ka-kpi">
          <div className="row" style={{ gap: 8, color: "var(--ka-gold)", marginBottom: 4 }}>
            <IconChart size={18} />
            <span className="lbl">Rating</span>
          </div>
          <div className="num">{artisan.rating} ★</div>
        </div>
      </section>

      {/* SECTION 1: INCOMING CUSTOM BRIEFS */}
      <section style={{ marginBottom: "var(--sp-6)" }}>
        <h2 style={{ fontSize: "1.18rem", marginBottom: "var(--sp-4)" }}>
          Incoming Custom Requests ({requests?.length || 0})
        </h2>
        {!requests || requests.length === 0 ? (
          <div className="card card--pad text-center" style={{ color: "var(--ka-muted)" }}>
            <p style={{ margin: 0 }}>No pending design briefs for your workshop.</p>
          </div>
        ) : (
          <div className="stack" style={{ gap: "var(--sp-4)" }}>
            {requests.map((r) => (
              <div key={r.id} className="card card--pad">
                <div
                  className="row row--between row--wrap"
                  style={{ gap: 8, marginBottom: 8 }}
                >
                  <div>
                    <strong style={{ fontSize: "1.05rem" }}>{r.product}</strong>
                    <span className="text-small text-muted" style={{ display: "block" }}>
                      Patron: <strong>{r.customer}</strong> · Order Ref: {r.orderRef} · Received {r.receivedAt}
                    </span>
                  </div>
                  <StatusBadge status={r.status} />
                </div>

                <div
                  className="card card--pad"
                  style={{ background: "var(--ka-ivory)", margin: "8px 0 12px" }}
                >
                  <strong style={{ fontSize: "0.85rem", display: "block", marginBottom: 2 }}>
                    Requested options:
                  </strong>
                  <p className="text-small" style={{ margin: 0 }}>
                    {r.summary}
                  </p>
                </div>

                {r.status === "new" && (
                  <div className="row" style={{ gap: 8, marginTop: 12 }}>
                    <button
                      type="button"
                      className="btn btn--primary btn--sm"
                      onClick={() =>
                        act(r.id, { status: "feasibility_ok" }, "Design approved for production")
                      }
                    >
                      <IconCheck size={14} /> Approve &amp; begin
                    </button>
                    <button
                      type="button"
                      className="btn btn--outline btn--sm"
                      onClick={() =>
                        act(r.id, { status: "revision_requested" }, "Requested revision from patron")
                      }
                    >
                      Request tweak
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() =>
                        act(r.id, { status: "declined" }, "Declined custom request")
                      }
                    >
                      <IconClose size={14} /> Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: WORKSHOP CATALOG */}
      <section style={{ marginBottom: "var(--sp-6)" }}>
        <h2 style={{ fontSize: "1.18rem", marginBottom: "var(--sp-4)" }}>
          Active Workshop Listings ({myProducts.length})
        </h2>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Piece</th>
                <th>Category</th>
                <th>Price</th>
                <th>Lead time</th>
                <th>Customisable</th>
              </tr>
            </thead>
            <tbody>
              {myProducts.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link
                      to={`/product/${p.slug}`}
                      className="row"
                      style={{ gap: 10, textDecoration: "none", color: "inherit" }}
                    >
                      <img
                        src={p.images[0]}
                        alt=""
                        width={40}
                        height={40}
                        style={{ width: 40, height: 40, borderRadius: 6, objectFit: "cover" }}
                      />
                      <strong>{p.name}</strong>
                    </Link>
                  </td>
                  <td>{p.categorySlug}</td>
                  <td>
                    <strong>{formatINR(p.price)}</strong>
                  </td>
                  <td>
                    {p.leadTimeDays[0]}–{p.leadTimeDays[1]} days
                  </td>
                  <td>
                    {p.customizable ? (
                      <span className="badge badge--indigo">Customisable</span>
                    ) : (
                      <span className="badge badge--neutral">Standard</span>
                    )}
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
