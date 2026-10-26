import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  SHOWCASE_PRODUCTS,
  SHOWCASE_ARTISANS,
  getArtisanById,
  ShowcaseProduct,
} from "../data/showcaseData";
import { ProductSVG, AvatarSVG } from "../components/CraftSVG";

export default function Home() {
  const { toggleFavorite, favorites, toast } = useApp();
  const [activeCategory, setActiveCategory] = useState("All");
  const navigate = useNavigate();

  const categories = ["All", "Ceramics", "Textiles", "Jewelry", "Woodwork", "Leather"];

  const filteredProducts =
    activeCategory === "All"
      ? SHOWCASE_PRODUCTS
      : SHOWCASE_PRODUCTS.filter((p) => p.cat.toLowerCase() === activeCategory.toLowerCase());

  const verifiedArtisans = SHOWCASE_ARTISANS.filter((a) => a.verified);

  const handleFavoriteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    toggleFavorite(id);
    const isFav = favorites.includes(id);
    toast(isFav ? "info" : "success", isFav ? "Removed from saved pieces" : "Saved to favorites ♥");
  };

  return (
    <main id="main" className="kalart-home">
      {/* ================= HERO SECTION ================= */}
      <section className="hero">
        <div>
          <span className="badge">
            <span className="dot" /> 0% commission — artisans keep every cent
          </span>
          <h1>
            Handmade treasures, <em>designed by you</em>, crafted by verified artisans.
          </h1>
          <p className="lead">
            KALART connects you directly with master artisans. Customize any piece with AI-generated mockups,
            approve the design, and receive it with a signed certificate of authenticity.
          </p>
          <div className="cta-row">
            <a href="#discover" className="btn btn-primary" onClick={(e) => {
              e.preventDefault();
              document.getElementById("discover")?.scrollIntoView({ behavior: "smooth" });
            }}>
              Explore the collection →
            </a>
            <Link to="/customize" className="btn btn-ghost">
              ✨ AI Customizer
            </Link>
            <Link to="/artisan" className="btn btn-dark">
              Artisan Studio
            </Link>
          </div>

          <div className="hero-stats">
            <div>
              <b>100%</b>
              <span>to artisans</span>
            </div>
            <div>
              <b>0%</b>
              <span>platform fee</span>
            </div>
            <div>
              <b>4.9 / 5</b>
              <span>maker rating</span>
            </div>
            <div>
              <b>100%</b>
              <span>verified origin</span>
            </div>
          </div>
        </div>

        {/* HERO ARCH ARTWORK */}
        <div className="hero-art">
          <div className="arch">
            <div className="ring" style={{ width: 440, height: 440, top: -40, left: -40 }} />
            <div className="ring" style={{ width: 320, height: 320, top: 40, left: 30 }} />
            <div className="ring" style={{ width: 180, height: 180, bottom: 20, right: -20 }} />
          </div>

          <div id="heroVase" style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ProductSVG
              type="vase"
              cfg={{ color: "#C05F3C", pattern: "waves", text: "" }}
              style={{ transform: "scale(1.08)" }}
            />
          </div>

          <div className="floating-card">
            <span className="vbadge">✓ Verified maker</span>
            <b>Meera Kapoor</b>
            <span>Jaipur, India · Terracotta</span>
          </div>
        </div>
      </section>

      {/* ================= TRUST BAR ================= */}
      <div className="trust-bar" style={{ maxWidth: 1200, margin: "24px auto 10px", padding: "0 24px" }}>
        <div className="trust-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <div>
            <b>Direct artisan trade</b>
            <p>No middlemen markups</p>
          </div>
        </div>
        <div className="trust-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <div>
            <b>0% platform take</b>
            <p>Artisans receive 100%</p>
          </div>
        </div>
        <div className="trust-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
          </svg>
          <div>
            <b>Provenance &amp; craft</b>
            <p>Each piece handmade</p>
          </div>
        </div>
        <div className="trust-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          <div>
            <b>Certificate included</b>
            <p>Numbered provenance card</p>
          </div>
        </div>
      </div>

      {/* ================= DISCOVER COLLECTION ================= */}
      <section id="discover" style={{ maxWidth: 1200, margin: "40px auto 0", padding: "30px 24px 60px" }}>
        <div className="discover-head">
          <div>
            <span className="serif" style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--terra)", fontWeight: 700 }}>
              Curated Catalog
            </span>
            <h2 style={{ fontSize: "clamp(26px, 3.2vw, 36px)", marginTop: 4 }}>
              Handmade pieces ready for your personal touch
            </h2>
          </div>
          <div className="chips">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`chip ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="pgrid">
          {filteredProducts.map((p) => {
            const artisan = getArtisanById(p.artisanId);
            const isFav = favorites.includes(p.id);

            return (
              <article
                key={p.id}
                className="pcard"
                onClick={() => navigate(`/customize?product=${p.id}`)}
                tabIndex={0}
                role="button"
                aria-label={`Customize ${p.name}`}
              >
                <div className="thumb">
                  <span className="vbadge">✓ Verified artisan</span>
                  <button
                    className={`fav ${isFav ? "on" : ""}`}
                    onClick={(e) => handleFavoriteClick(e, p.id)}
                    aria-label="Save to favorites"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 21C7 16.5 3 13 3 8.9 3 6 5.2 4 7.9 4c1.7 0 3.2.8 4.1 2.2C12.9 4.8 14.4 4 16.1 4 18.8 4 21 6 21 8.9c0 4.1-4 7.6-9 12.1z" />
                    </svg>
                  </button>

                  <ProductSVG
                    type={p.svg}
                    cfg={{ color: p.colors[0]?.h || "#C05F3C", pattern: "none", text: "" }}
                  />
                </div>

                <div className="pinfo">
                  <span className="cat">{p.cat}</span>
                  <h3>{p.name}</h3>
                  <div className="by">
                    by {artisan?.name} · {artisan?.loc}
                  </div>
                  <div className="prow">
                    <div className="price">
                      ${p.base}
                      <small>customizable</small>
                    </div>
                    <div className="rate">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3 6.5 7 .9-5 4.8 1.2 7L12 17.8 5.8 21.2 7 14.2 2 9.4l7-.9L12 2z" />
                      </svg>
                      {p.rating}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how" className="how">
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 40px" }}>
            <span className="serif" style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--terra)", fontWeight: 700 }}>
              The KALART Journey
            </span>
            <h2 style={{ fontSize: "clamp(26px, 3.2vw, 38px)", marginTop: 6 }}>
              A respectful bridge between patrons and master makers
            </h2>
          </div>

          <div className="hsteps">
            <div className="hstep">
              <span className="num">01</span>
              <h3>Choose or Design</h3>
              <p>
                Select from verified artisan collections. Customize colors, patterns, and personal engravings with instant generative AI visual mockups.
              </p>
            </div>
            <div className="hstep">
              <span className="num">02</span>
              <h3>Artisan Sign-Off &amp; Crafting</h3>
              <p>
                Your design is submitted directly to the maker's studio. They verify feasibility, approve the composition, and begin hand-crafting your piece.
              </p>
            </div>
            <div className="hstep">
              <span className="num">03</span>
              <h3>Provenance &amp; Certificate</h3>
              <p>
                Every order arrives with a signed physical Certificate of Authenticity containing a unique archival tracking ID and the master's signature seal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MEET THE MAKERS ================= */}
      <section id="artisans" style={{ maxWidth: 1200, margin: "50px auto 70px", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 30, flexWrap: "wrap", gap: 16 }}>
          <div>
            <span className="serif" style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--terra)", fontWeight: 700 }}>
              Artisan Guild
            </span>
            <h2 style={{ fontSize: "clamp(24px, 3vw, 34px)", marginTop: 4 }}>
              Meet the master makers behind each piece
            </h2>
          </div>
          <Link to="/artisans" className="btn btn-ghost btn-sm">
            View all 38 workshops →
          </Link>
        </div>

        <div className="agrid">
          {verifiedArtisans.map((artisan) => (
            <div
              key={artisan.id}
              className="acard"
              onClick={() => toast("info", `${artisan.name}'s master profile and story`)}
            >
              <div className="av">
                <AvatarSVG avatar={artisan.av} />
              </div>
              <h3>{artisan.name}</h3>
              <div className="craft">{artisan.craft}</div>
              <div className="loc">{artisan.loc} · {artisan.sales} pieces crafted</div>
              <div className="rate" style={{ justifyContent: "center", marginTop: 8 }}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3 6.5 7 .9-5 4.8 1.2 7L12 17.8 5.8 21.2 7 14.2 2 9.4l7-.9L12 2z" />
                </svg>
                {artisan.rating}
              </div>
              <span className="vpill" style={{ marginTop: 12 }}>
                ✓ Verified master
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
