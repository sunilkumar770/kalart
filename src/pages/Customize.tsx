import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  SHOWCASE_PRODUCTS,
  getArtisanById,
  calcShowcasePrice,
  cfgSummary,
  ShowcaseProduct,
  DesignRequestConfig,
} from "../data/showcaseData";
import { ProductSVG, AvatarSVG, SealSVG } from "../components/CraftSVG";

const GEN_STEPS = [
  ["Analyzing artisan style…", "Studying Jaipur terracotta heritage"],
  ["Composing your design…", "Balancing pigment, motif & organic form"],
  ["Rendering photoreal mockup…", "Simulating natural glaze kiln firing"],
  ["Mockup ready ✓", "Harmonized bespoke edition created"],
];

export default function Customize() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart, setCartOpen, setCheckoutOpen, toast } = useApp();

  const productIdParam = params.get("product") || params.get("id") || "p1";
  const [product, setProduct] = useState<ShowcaseProduct>(() => {
    return (
      SHOWCASE_PRODUCTS.find((p) => p.id === productIdParam || p.svg === productIdParam) ||
      SHOWCASE_PRODUCTS[0]
    );
  });

  const [cfg, setCfg] = useState<DesignRequestConfig>({
    colorIdx: 0,
    pattern: "none",
    sizeIdx: 0,
    text: "",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const genInterval = useRef<number | undefined>(undefined);

  // Sync if URL param changes
  useEffect(() => {
    const target = SHOWCASE_PRODUCTS.find(
      (p) => p.id === productIdParam || p.svg === productIdParam
    );
    if (target) {
      setProduct(target);
      setCfg({ colorIdx: 0, pattern: "none", sizeIdx: 0, text: "" });
    }
  }, [productIdParam]);

  const artisan = getArtisanById(product.artisanId);
  const currentPrice = calcShowcasePrice(product, cfg);

  const handleGenerateMockup = () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setStepIndex(0);

    let current = 0;
    genInterval.current = window.setInterval(() => {
      current++;
      if (current < GEN_STEPS.length) {
        setStepIndex(current);
      } else {
        clearInterval(genInterval.current);
        setIsGenerating(false);

        // AI suggestion: Pick a complementary color and pattern
        const randomColor = (cfg.colorIdx + 1) % product.colors.length;
        const availablePatterns = product.patterns.filter((p) => p !== "none");
        const randomPattern =
          availablePatterns.length > 0
            ? availablePatterns[Math.floor(Math.random() * availablePatterns.length)]
            : "none";

        setCfg((prev) => ({
          ...prev,
          colorIdx: randomColor,
          pattern: randomPattern,
        }));
        toast("success", "AI generated a harmonized design mockup ✨");
      }
    }, 600);
  };

  useEffect(() => {
    return () => clearInterval(genInterval.current);
  }, []);

  const handleAddToBasket = (proceedToCheckout: boolean) => {
    addToCart({
      productId: product.id,
      qty: 1,
      options: {
        Color: product.colors[cfg.colorIdx]?.n || "Default",
        Pattern: cfg.pattern !== "none" ? cfg.pattern : "Plain",
        Size: product.sizes[cfg.sizeIdx]?.l || "Standard",
        Engraving: cfg.text.trim(),
      },
      unitPrice: currentPrice,
    });

    if (proceedToCheckout) {
      setCheckoutOpen(true);
    } else {
      setCartOpen(true);
      toast("success", `Added bespoke ${product.name} to your basket`);
    }
  };

  return (
    <main id="main" className="kalart-customizer" style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 60px" }}>
      {/* CRAFT PICKER CHIPS */}
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: "0.14em" }}>
          Craft Base:
        </span>
        {SHOWCASE_PRODUCTS.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setProduct(p);
              setCfg({ colorIdx: 0, pattern: "none", sizeIdx: 0, text: "" });
            }}
            className={`chip ${product.id === p.id ? "active" : ""}`}
            style={{ fontSize: 13 }}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="detail">
        {/* ================= LEFT: LIVE INTERACTIVE STAGE ================= */}
        <div className="gallery">
          <div className={`stage ${isGenerating ? "gen" : ""}`} style={{ position: "relative" }}>
            <span className="vbadge">✓ Verified artisan design</span>

            <div className="scanline" />

            {/* GENERATIVE AI SPINNER OVERLAY */}
            <div className="gen-overlay">
              <div className="spinner" />
              <p style={{ fontWeight: 600, fontSize: 15, margin: "14px 0 2px" }}>
                {GEN_STEPS[stepIndex][0]}
              </p>
              <small style={{ color: "var(--ink-soft)", fontSize: 13 }}>
                {GEN_STEPS[stepIndex][1]}
              </small>
            </div>

            {/* PROCEDURAL VECTOR ARTWORK */}
            <div style={{ width: "100%", height: 380, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ProductSVG
                type={product.svg}
                cfg={{
                  color: product.colors[cfg.colorIdx]?.h || "#C05F3C",
                  pattern: cfg.pattern,
                  text: cfg.text,
                }}
              />
            </div>
          </div>

          {/* PALETTE THUMBNAILS */}
          <div className="thumbs" style={{ marginTop: 14 }}>
            {product.colors.slice(0, 4).map((c, i) => (
              <div
                key={c.n}
                className={`tn ${i === cfg.colorIdx ? "active" : ""}`}
                onClick={() => setCfg((prev) => ({ ...prev, colorIdx: i }))}
                title={c.n}
              >
                <ProductSVG type={product.svg} cfg={{ color: c.h, pattern: "none", text: "" }} />
              </div>
            ))}
          </div>
        </div>

        {/* ================= RIGHT: CONFIGURATION CONTROLS ================= */}
        <div className="popt">
          <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--ink-soft)", fontWeight: 700 }}>
            {product.cat}
          </span>
          <h1 style={{ fontSize: "clamp(28px, 3.6vw, 40px)", margin: "6px 0 10px" }}>{product.name}</h1>

          {/* ARTISAN ATTRIBUTION */}
          {artisan && (
            <div className="pd-by">
              <div className="av">
                <AvatarSVG avatar={artisan.av} />
              </div>
              <div>
                <b>{artisan.name}</b>
                <span>
                  {artisan.craft} · {artisan.loc} ·{" "}
                  <span style={{ color: "var(--sage)", fontWeight: 700 }}>✓ Verified maker</span>
                </span>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, color: "var(--ochre)", fontWeight: 700 }}>
                ★ {product.rating} <span style={{ color: "var(--ink-soft)", fontWeight: 400 }}>({product.reviews})</span>
              </div>
            </div>
          )}

          <p style={{ color: "var(--ink-soft)", fontSize: 14, margin: "14px 0 12px", lineHeight: 1.6 }}>
            {product.desc}
          </p>

          <div className="pd-price" style={{ margin: "14px 0 4px" }}>
            ${currentPrice.toFixed(2)} <small>artisan receives 100%</small>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 20 }}>
            ⏱ Handcrafted to order in {product.lead} · worldwide insured carbon-neutral delivery
          </div>

          {/* COLOR SWATCHES */}
          <div className="opt-block">
            <div className="lbl">
              Color <b>{product.colors[cfg.colorIdx]?.n}</b>
            </div>
            <div className="swatches">
              {product.colors.map((c, i) => (
                <button
                  key={c.n}
                  className={`sw ${i === cfg.colorIdx ? "active" : ""}`}
                  style={{ background: c.h }}
                  title={c.n}
                  onClick={() => setCfg((prev) => ({ ...prev, colorIdx: i }))}
                  aria-label={c.n}
                />
              ))}
            </div>
          </div>

          {/* PATTERN SELECTOR */}
          <div className="opt-block">
            <div className="lbl">
              Hand-applied Pattern <b>+$8 · applied by artisan</b>
            </div>
            <div className="pbtns">
              {product.patterns.map((pt) => (
                <button
                  key={pt}
                  className={`pbtn ${cfg.pattern === pt ? "active" : ""}`}
                  onClick={() => setCfg((prev) => ({ ...prev, pattern: pt }))}
                >
                  {pt === "none" ? "Plain" : pt.charAt(0).toUpperCase() + pt.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* SIZE SELECTOR */}
          <div className="opt-block">
            <div className="lbl">Dimensions &amp; Scale</div>
            <div className="sbtns">
              {product.sizes.map((s, i) => (
                <button
                  key={s.l}
                  className={`sbtn ${cfg.sizeIdx === i ? "active" : ""}`}
                  onClick={() => setCfg((prev) => ({ ...prev, sizeIdx: i }))}
                >
                  {s.l}
                  {s.add > 0 ? ` +$${s.add}` : ""}
                </button>
              ))}
            </div>
          </div>

          {/* PERSONAL ENGRAVING INPUT */}
          {product.engrave && (
            <div className="opt-block">
              <div className="lbl">
                Personal Engraving <b>+$5 · hand-carved or etched</b>
              </div>
              <input
                className="engrave-in"
                maxLength={18}
                placeholder="e.g. your name, anniversary date, mantra…"
                value={cfg.text}
                onChange={(e) => setCfg((prev) => ({ ...prev, text: e.target.value }))}
              />
            </div>
          )}

          {/* AI CUSTOMIZER BAR */}
          <div className="ai-bar">
            <div className="spark">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l2.1 5.9L20 10l-5.9 2.1L12 18l-2.1-5.9L4 10l5.9-2.1L12 2z" />
                <path d="M19 16l.9 2.4L22.5 19l-2.6.9L19 22l-.9-2.1-2.6-.9 2.6-.6L19 16z" />
              </svg>
            </div>
            <div>
              <b>KALART Generative AI Studio</b>
              <small>
                Simulates natural craft glaze and textile drape in the maker's signature style — sent for artisan approval upon order.
              </small>
            </div>
            <button
              className="ai-gen-btn"
              disabled={isGenerating}
              onClick={handleGenerateMockup}
            >
              {isGenerating ? "Generating…" : "✨ Generate mockup"}
            </button>
          </div>

          {/* BUY & BASKET BUTTONS */}
          <div className="buyrow">
            <button className="btn btn-ghost" onClick={() => handleAddToBasket(false)}>
              Add to basket · ${currentPrice.toFixed(2)}
            </button>
            <button className="btn btn-primary" onClick={() => handleAddToBasket(true)}>
              Buy now →
            </button>
          </div>

          {/* CERTIFICATE NOTE */}
          <div className="cert-note">
            <div style={{ flexShrink: 0 }}>
              <SealSVG />
            </div>
            <span>
              This bespoke commission ships with an authenticated <b>Certificate of Authenticity</b> (physical signed provenance seal + unique tracking ID), recorded on your order.
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
