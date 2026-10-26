import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  SHOWCASE_ARTISANS,
  INITIAL_VERIFY_QUEUE,
  getArtisanById,
} from "../data/showcaseData";
import { AvatarSVG } from "../components/CraftSVG";

export default function AdminDashboard() {
  const { toast } = useApp();
  const [verifyQueue, setVerifyQueue] = useState<string[]>(INITIAL_VERIFY_QUEUE);
  const [verifiedList, setVerifiedList] = useState<string[]>(() =>
    SHOWCASE_ARTISANS.filter((a) => a.verified).map((a) => a.id)
  );

  const handleVerify = (id: string, approved: boolean) => {
    const artisan = getArtisanById(id);
    setVerifyQueue((prev) => prev.filter((x) => x !== id));

    if (approved) {
      setVerifiedList((prev) => [...prev, id]);
      toast(
        "success",
        `${artisan?.name || "Artisan"} is now officially verified — authenticity badge granted 🛡`
      );
    } else {
      toast(
        "info",
        `${artisan?.name || "Artisan"}'s application declined — feedback sent by email`
      );
    }
  };

  return (
    <main id="main" className="admin-dash" style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 24px 70px" }}>
      {/* HEADER BANNER */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
        <div>
          <span className="serif" style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--terra)", fontWeight: 700 }}>
            Platform Operations &amp; Trust
          </span>
          <h1 style={{ fontSize: "clamp(24px, 3.2vw, 34px)", margin: "4px 0 0" }}>
            Trust, Safety &amp; Provenance Console
          </h1>
          <p style={{ color: "var(--ink-soft)", margin: "4px 0 0", fontSize: 13.5 }}>
            Verify artisan credentials, monitor certificates of authenticity, and uphold 100% fair trade provenance.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link to="/" className="btn btn-ghost btn-sm">
            View Marketplace
          </Link>
          <Link to="/artisan" className="btn btn-dark btn-sm">
            Artisan Studio
          </Link>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="dgrid">
        <div className="stat-card">
          <small>Verification Queue</small>
          <b style={{ color: "var(--terra)" }}>{verifyQueue.length}</b>
          <div className="trend">Identity &amp; craft vetting</div>
        </div>
        <div className="stat-card">
          <small>Verified Master Artisans</small>
          <b style={{ color: "var(--sage)" }}>{verifiedList.length}</b>
          <div className="trend">Across 9 craft clusters</div>
        </div>
        <div className="stat-card">
          <small>Platform Take Rate</small>
          <b>0.00%</b>
          <div className="trend">100% direct maker revenue</div>
        </div>
        <div className="stat-card">
          <small>Dispute Rate</small>
          <b>0.01%</b>
          <div className="trend">Guaranteed certificate escrow</div>
        </div>
      </div>

      {/* VERIFICATION QUEUE */}
      <section style={{ marginTop: 36 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: 22, margin: 0 }}>
            Artisan Verification Applications ({verifyQueue.length})
          </h2>
          <span style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
            Requires government ID, workshop geostamp, craft video &amp; physical portfolio check
          </span>
        </div>

        <div className="verify-queue">
          {verifyQueue.length === 0 ? (
            <div className="empty-state" style={{ padding: "40px 20px", textAlign: "center", background: "#fff", borderRadius: "var(--radius)", border: "1px dashed var(--line)" }}>
              <p style={{ fontSize: 28, margin: 0 }}>🛡</p>
              <h3 style={{ fontFamily: "Fraunces, serif", fontSize: 18, marginTop: 8 }}>
                Verification queue is clear!
              </h3>
              <p style={{ color: "var(--ink-soft)", fontSize: 13.5, margin: "4px 0 0" }}>
                All artisan onboarding applications have been thoroughly audited and authenticated.
              </p>
            </div>
          ) : (
            verifyQueue.map((id) => {
              const a = getArtisanById(id);
              if (!a) return null;

              return (
                <div key={id} className="verify-card">
                  <div className="av">
                    <AvatarSVG avatar={a.av} />
                  </div>

                  <div className="dc-info">
                    <b>{a.name} — {a.craft}</b>
                    <p style={{ color: "var(--ink-soft)", fontSize: 13.5, margin: "3px 0 6px" }}>
                      {a.loc} · {a.bio}
                    </p>

                    <div className="docs">
                      <span className="doc-tag">🪪 Gov ID Verified</span>
                      <span className="doc-tag">📷 Workshop Photos (12)</span>
                      <span className="doc-tag">🎥 Craft Process Video</span>
                      <span className="doc-tag">🧾 Guild Portfolio (24)</span>
                    </div>
                  </div>

                  <div className="dc-actions">
                    <button
                      className="btn-ok"
                      onClick={() => handleVerify(id, true)}
                    >
                      ✓ Verify artisan
                    </button>
                    <button
                      className="btn-no"
                      onClick={() => handleVerify(id, false)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* PLATFORM AUDIT LOG */}
      <section style={{ marginTop: 44 }}>
        <h2 style={{ fontSize: 22, marginBottom: 14 }}>Certificate Authenticity &amp; Escrow Ledger</h2>
        <div style={{ background: "#fff", borderRadius: "var(--radius)", border: "1px solid var(--line)", overflow: "hidden", boxShadow: "var(--shadow)" }}>
          <table className="ptable" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "rgba(250,245,238,0.7)", borderBottom: "1px solid var(--line)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-soft)" }}>
                <th style={{ padding: "12px 18px" }}>Certificate ID</th>
                <th style={{ padding: "12px 18px" }}>Artisan Partner</th>
                <th style={{ padding: "12px 18px" }}>Patron Destination</th>
                <th style={{ padding: "12px 18px" }}>Payout Escrow</th>
                <th style={{ padding: "12px 18px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid var(--line)", fontSize: 13.5 }}>
                <td style={{ padding: "12px 18px", fontFamily: "monospace", fontWeight: 600 }}>KAL-2412-8821</td>
                <td style={{ padding: "12px 18px" }}>Meera Kapoor (Jaipur)</td>
                <td style={{ padding: "12px 18px", color: "var(--ink-soft)" }}>Edinburgh, UK</td>
                <td style={{ padding: "12px 18px", fontWeight: 700, color: "var(--terra)" }}>$76.00 (100%)</td>
                <td style={{ padding: "12px 18px" }}><span className="vpill">✓ Sealed</span></td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--line)", fontSize: 13.5 }}>
                <td style={{ padding: "12px 18px", fontFamily: "monospace", fontWeight: 600 }}>KAL-2409-1944</td>
                <td style={{ padding: "12px 18px" }}>Tomás Rivera (Oaxaca)</td>
                <td style={{ padding: "12px 18px", color: "var(--ink-soft)" }}>San Francisco, USA</td>
                <td style={{ padding: "12px 18px", fontWeight: 700, color: "var(--terra)" }}>$135.00 (100%)</td>
                <td style={{ padding: "12px 18px" }}><span className="vpill">✓ Sealed</span></td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--line)", fontSize: 13.5 }}>
                <td style={{ padding: "12px 18px", fontFamily: "monospace", fontWeight: 600 }}>KAL-2395-5120</td>
                <td style={{ padding: "12px 18px" }}>Aiko Tanaka (Kyoto)</td>
                <td style={{ padding: "12px 18px", color: "var(--ink-soft)" }}>Geneva, Switzerland</td>
                <td style={{ padding: "12px 18px", fontWeight: 700, color: "var(--terra)" }}>$62.00 (100%)</td>
                <td style={{ padding: "12px 18px" }}><span className="vpill">✓ Sealed</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
