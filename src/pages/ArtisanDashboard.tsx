import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  SHOWCASE_PRODUCTS,
  SHOWCASE_ARTISANS,
  INITIAL_DESIGN_QUEUE,
  DesignRequest,
  calcShowcasePrice,
  cfgSummary,
} from "../data/showcaseData";
import { ProductSVG, AvatarSVG } from "../components/CraftSVG";

export default function ArtisanDashboard() {
  const { toast } = useApp();
  const artisan = SHOWCASE_ARTISANS[0]; // Meera Kapoor

  const [queue, setQueue] = useState<DesignRequest[]>(() => {
    try {
      const stored = localStorage.getItem("kalart_custom_designs");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch {}
    return INITIAL_DESIGN_QUEUE;
  });

  const [listingsStatus, setListingsStatus] = useState<Record<string, boolean>>({
    p1: true,
    p6: true,
  });

  const [activeOrders, setActiveOrders] = useState([
    { id: "KA-2412", item: "Terra Organic Vase · Terracotta · Waves", patron: "Arthur Pendelton", payout: "$76.00", status: "In production" },
    { id: "KA-2398", item: "Hearth Candle Set · Cream · Dots · 'HOME'", patron: "Elena Rostova", payout: "$55.00", status: "Glaze Firing" },
    { id: "KA-2385", item: "Terra Organic Vase · Sand · Large", patron: "Kenji Sato", payout: "$96.00", status: "Quality Check" },
  ]);

  const pendingDesigns = queue.filter((d) => !d.approved && !d.rejected);

  const handleDecision = (id: string, approved: boolean) => {
    const item = queue.find((d) => d.id === id);
    if (!item) return;

    const p = SHOWCASE_PRODUCTS.find((x) => x.id === item.pid) || SHOWCASE_PRODUCTS[0];

    const updated = queue.map((d) =>
      d.id === id ? { ...d, approved, rejected: !approved } : d
    );
    setQueue(updated);
    try {
      localStorage.setItem("kalart_custom_designs", JSON.stringify(updated));
    } catch {}

    if (approved) {
      const newOrder = {
        id: "KA-" + Math.floor(2300 + Math.random() * 600),
        item: `${p.name} · ${cfgSummary(p, item.cfg)}`,
        patron: item.customer,
        payout: `$${calcShowcasePrice(p, item.cfg).toFixed(2)}`,
        status: "In production",
      };
      setActiveOrders((prev) => [newOrder, ...prev]);
      toast("success", `Approved custom design for ${item.customer} — moved to workshop queue`);
    } else {
      toast("info", `Declined design request — customer notified and fully refunded`);
    }
  };

  const toggleListing = (pid: string) => {
    setListingsStatus((prev) => {
      const next = !prev[pid];
      toast(next ? "success" : "info", next ? "Listing is now live on KALART" : "Listing paused");
      return { ...prev, [pid]: next };
    });
  };

  const myProducts = SHOWCASE_PRODUCTS.filter((p) => p.artisanId === artisan.id);

  return (
    <main id="main" className="artisan-dash" style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 24px 70px" }}>
      {/* HEADER BANNER */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 68, height: 68, borderRadius: "50%", overflow: "hidden", border: "2px solid var(--terra)" }}>
            <AvatarSVG avatar={artisan.av} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontSize: "clamp(24px, 3.2vw, 32px)", margin: 0 }}>{artisan.name}'s Studio</h1>
              <span className="vpill" style={{ fontSize: 11 }}>✓ Verified Master Potter</span>
            </div>
            <p style={{ color: "var(--ink-soft)", margin: "4px 0 0", fontSize: 13.5 }}>
              {artisan.craft} Studio · {artisan.loc} · 0% Platform Commission Account
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link to="/customize" className="btn btn-ghost btn-sm">
            ✨ Open Customizer
          </Link>
          <Link to="/" className="btn btn-primary btn-sm">
            Browse Storefront
          </Link>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="dgrid">
        <div className="stat-card">
          <small>Custom Designs Awaiting Approval</small>
          <b style={{ color: "var(--terra)" }}>{pendingDesigns.length}</b>
          <div className="trend">Requires review within 24h</div>
        </div>
        <div className="stat-card">
          <small>Total Master Sales</small>
          <b>{artisan.sales} pcs</b>
          <div className="trend">Across 18 patron countries</div>
        </div>
        <div className="stat-card">
          <small>Artisan Share / Commission</small>
          <b style={{ color: "var(--sage)" }}>100% / 0%</b>
          <div className="trend">You keep every dollar</div>
        </div>
        <div className="stat-card">
          <small>Patron Satisfaction Rating</small>
          <b>★ {artisan.rating}</b>
          <div className="trend">128 verified reviews</div>
        </div>
      </div>

      {/* SECTION 1: CUSTOM DESIGNS QUEUE */}
      <section style={{ marginTop: 36 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: 22, margin: 0 }}>
            Incoming Bespoke Requests ({pendingDesigns.length})
          </h2>
          <span style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
            Patrons pay upfront into direct escrow · Work begins upon your approval
          </span>
        </div>

        <div className="design-queue">
          {pendingDesigns.length === 0 ? (
            <div className="empty-state" style={{ padding: "40px 20px", textAlign: "center", background: "#fff", borderRadius: "var(--radius)", border: "1px dashed var(--line)" }}>
              <p style={{ fontSize: 28, margin: 0 }}>✓</p>
              <h3 style={{ fontFamily: "Fraunces, serif", fontSize: 18, marginTop: 8 }}>
                All custom briefs approved!
              </h3>
              <p style={{ color: "var(--ink-soft)", fontSize: 13.5, margin: "4px 0 0" }}>
                New orders placed via the AI Customizer will appear here in real time.
              </p>
            </div>
          ) : (
            pendingDesigns.map((d) => {
              const p = SHOWCASE_PRODUCTS.find((x) => x.id === d.pid) || SHOWCASE_PRODUCTS[0];
              const price = calcShowcasePrice(p, d.cfg);

              return (
                <div key={d.id} className="design-card">
                  <div className="dc-prev">
                    <ProductSVG
                      type={p.svg}
                      cfg={{
                        color: p.colors[d.cfg.colorIdx]?.h || "#C05F3C",
                        pattern: d.cfg.pattern,
                        text: d.cfg.text,
                      }}
                    />
                  </div>

                  <div className="dc-info">
                    <b>{p.name}</b>
                    <p style={{ color: "var(--ink-soft)", fontSize: 13.5, margin: "2px 0 4px" }}>
                      Configuration: <b>{cfgSummary(p, d.cfg)}</b>
                    </p>
                    <p style={{ color: "var(--terra)", fontSize: 13, margin: "2px 0" }}>
                      Patron: <b>{d.customer}</b> · Submitted {d.date} · “{d.note}”
                    </p>
                    <p style={{ fontSize: 13, margin: "4px 0 0" }}>
                      Payout to you: <b>${price.toFixed(2)}</b> (0% platform commission)
                    </p>
                  </div>

                  <div className="dc-actions">
                    <button
                      className="btn-ok"
                      onClick={() => handleDecision(d.id, true)}
                    >
                      ✓ Approve &amp; start
                    </button>
                    <button
                      className="btn-no"
                      onClick={() => handleDecision(d.id, false)}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* SECTION 2: WORKSHOP CATALOG LISTINGS */}
      <section style={{ marginTop: 44 }}>
        <h2 style={{ fontSize: 22, marginBottom: 14 }}>My Active Workshop Listings</h2>
        <div style={{ background: "#fff", borderRadius: "var(--radius)", border: "1px solid var(--line)", overflow: "hidden", boxShadow: "var(--shadow)" }}>
          <table className="ptable" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "rgba(250,245,238,0.7)", borderBottom: "1px solid var(--line)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-soft)" }}>
                <th style={{ padding: "12px 18px" }}>Craft Piece</th>
                <th style={{ padding: "12px 18px" }}>Discipline</th>
                <th style={{ padding: "12px 18px" }}>Base Price</th>
                <th style={{ padding: "12px 18px" }}>Lead Time</th>
                <th style={{ padding: "12px 18px" }}>Listing State</th>
              </tr>
            </thead>
            <tbody>
              {myProducts.map((p) => {
                const isLive = listingsStatus[p.id] !== false;
                return (
                  <tr key={p.id} style={{ borderBottom: "1px solid var(--line)", fontSize: 13.5 }}>
                    <td style={{ padding: "12px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 44, height: 44, background: "#F4E9D8", borderRadius: 10, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <ProductSVG type={p.svg} cfg={{ color: p.colors[0]?.h || "#C05F3C", pattern: "none", text: "" }} />
                      </div>
                      <b>{p.name}</b>
                    </td>
                    <td style={{ padding: "12px 18px", color: "var(--ink-soft)" }}>{p.cat}</td>
                    <td style={{ padding: "12px 18px", fontWeight: 600 }}>from ${p.base}</td>
                    <td style={{ padding: "12px 18px", color: "var(--ink-soft)" }}>{p.lead}</td>
                    <td style={{ padding: "12px 18px" }}>
                      <button
                        className={`toggle ${isLive ? "on" : ""}`}
                        onClick={() => toggleListing(p.id)}
                        aria-label="Toggle listing status"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 3: WORKSHOP PRODUCTION ORDERS */}
      <section style={{ marginTop: 44 }}>
        <h2 style={{ fontSize: 22, marginBottom: 14 }}>Active Production Orders</h2>
        <div style={{ background: "#fff", borderRadius: "var(--radius)", border: "1px solid var(--line)", overflow: "hidden", boxShadow: "var(--shadow)" }}>
          <table className="ptable" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "rgba(250,245,238,0.7)", borderBottom: "1px solid var(--line)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-soft)" }}>
                <th style={{ padding: "12px 18px" }}>Order ID</th>
                <th style={{ padding: "12px 18px" }}>Item &amp; Specifications</th>
                <th style={{ padding: "12px 18px" }}>Patron</th>
                <th style={{ padding: "12px 18px" }}>Artisan Payout</th>
                <th style={{ padding: "12px 18px" }}>Production Phase</th>
              </tr>
            </thead>
            <tbody>
              {activeOrders.map((o) => (
                <tr key={o.id} style={{ borderBottom: "1px solid var(--line)", fontSize: 13.5 }}>
                  <td style={{ padding: "12px 18px", fontFamily: "monospace", fontWeight: 600 }}>{o.id}</td>
                  <td style={{ padding: "12px 18px" }}><b>{o.item}</b></td>
                  <td style={{ padding: "12px 18px", color: "var(--ink-soft)" }}>{o.patron}</td>
                  <td style={{ padding: "12px 18px", fontWeight: 700, color: "var(--terra)" }}>{o.payout}</td>
                  <td style={{ padding: "12px 18px" }}>
                    <span className="status st-wait">{o.status}</span>
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
