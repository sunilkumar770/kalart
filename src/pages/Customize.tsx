import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  PRODUCTS,
  ARTISANS,
  formatINR,
  type Product,
} from "../data/store";
import {
  IconCheck,
  IconShield,
  IconSparkle,
  IconTruck,
  IconArrowRight,
} from "../components/icons";
import { ProductSVG } from "../components/CraftSVG";

const GEN_STEPS = [
  ["Consulting workshop specifications…", "Reviewing cluster craft traditions"],
  ["Composing bespoke variation…", "Harmonising motif, natural dye & scale"],
  ["Simulating weave & glaze texture…", "Preparing visual feasibility preview"],
  ["Preview ready", "Bespoke preview generated for artisan review"],
];

export default function Customize() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart, setCartOpen, toast } = useApp();

  const customisables = useMemo(
    () => PRODUCTS.filter((p) => p.customizable && p.customization && p.customization.length > 0),
    []
  );

  const productParam = params.get("product") || params.get("id");

  const [product, setProduct] = useState<Product>(() => {
    if (productParam) {
      const match = PRODUCTS.find((p) => p.slug === productParam || p.id === productParam);
      if (match) return match;
    }
    return customisables[0] || PRODUCTS[0];
  });

  // Selected options state
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string>>({});
  const [textInputs, setTextInputs] = useState<Record<string, string>>({});
  const [previewMode, setPreviewMode] = useState<"photo" | "vector">("photo");
  const [isGenerating, setIsGenerating] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const genInterval = useRef<number | undefined>(undefined);

  // Sync when param changes
  useEffect(() => {
    if (productParam) {
      const target = PRODUCTS.find((p) => p.slug === productParam || p.id === productParam);
      if (target) {
        setProduct(target);
        // initialize default choices
        const defaults: Record<string, string> = {};
        target.customization?.forEach((opt) => {
          if (opt.choices && opt.choices.length > 0) {
            defaults[opt.label] = opt.choices[0];
          }
        });
        setSelectedChoices(defaults);
        setTextInputs({});
      }
    }
  }, [productParam]);

  // Initialize options for initial product
  useEffect(() => {
    const defaults: Record<string, string> = {};
    product.customization?.forEach((opt) => {
      if (opt.choices && opt.choices.length > 0) {
        defaults[opt.label] = opt.choices[0];
      }
    });
    setSelectedChoices(defaults);
    setTextInputs({});
  }, [product]);

  const artisan = useMemo(
    () => ARTISANS.find((a) => a.id === product.artisanId),
    [product.artisanId]
  );

  // Calculate dynamic price in INR
  const totalPrice = useMemo(() => {
    let sum = product.price;
    if (!product.customization) return sum;

    product.customization.forEach((opt) => {
      if (opt.choices && opt.priceDelta) {
        const choice = selectedChoices[opt.label];
        if (choice && choice !== opt.choices[0]) {
          sum += opt.priceDelta;
        }
      }
      if (opt.freeText && opt.priceDelta && textInputs[opt.label]?.trim()) {
        sum += opt.priceDelta;
      }
    });
    return sum;
  }, [product, selectedChoices, textInputs]);

  const handleGenerate = () => {
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
        setPreviewMode("vector");
        toast("success", "Visual feasibility preview generated");
      }
    }, 600);
  };

  useEffect(() => {
    return () => clearInterval(genInterval.current);
  }, []);

  const handleAddToCart = (proceedToCheckout: boolean) => {
    const combinedOptions: Record<string, string> = { ...selectedChoices };
    Object.entries(textInputs).forEach(([k, v]) => {
      if (v.trim()) combinedOptions[k] = v.trim();
    });

    addToCart({
      productId: product.id,
      qty: 1,
      options: combinedOptions,
      unitPrice: totalPrice,
    });

    if (proceedToCheckout) {
      navigate("/checkout");
    } else {
      setCartOpen(true);
      toast("success", `Added custom ${product.name} to your bag`);
    }
  };

  return (
    <main id="main" className="container section--tight">
      {/* BREADCRUMB */}
      <nav className="ka-crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> /{" "}
        <span aria-current="page">Customisation studio</span>
      </nav>

      {/* PIECE PICKER */}
      <div style={{ marginBottom: "var(--sp-5)" }}>
        <p className="eyebrow" style={{ marginBottom: 6 }}>
          Select Base Craft
        </p>
        <div className="chips">
          {customisables.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`chip ${product.id === p.id ? "active" : ""}`}
              onClick={() => {
                navigate(`/customize?product=${p.slug}`);
              }}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="detail">
        {/* ================= LEFT: PREVIEW STAGE ================= */}
        <div className="gallery">
          <div className={`stage ${isGenerating ? "gen" : ""}`}>
            <span
              className="badge badge--neutral"
              style={{ position: "absolute", top: 12, left: 12, zIndex: 5 }}
            >
              <IconCheck size={12} /> Workshop Feasibility Preview
            </span>

            {/* SCANLINE */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background:
                  "linear-gradient(180deg, transparent, rgba(168,80,58,0.1) 50%, transparent)",
                height: "20%",
                animation: "ka-scan 3s linear infinite",
              }}
            />

            {/* GENERATING OVERLAY */}
            <div className="gen-overlay">
              <div className="spinner" />
              <p style={{ fontWeight: 600, fontSize: "1rem", margin: "14px 0 2px" }}>
                {GEN_STEPS[stepIndex][0]}
              </p>
              <small className="text-muted" style={{ fontSize: "0.85rem" }}>
                {GEN_STEPS[stepIndex][1]}
              </small>
            </div>

            {/* ARTWORK DISPLAY */}
            {previewMode === "photo" ? (
              <img
                src={product.images[0]}
                alt={`${product.name} craft reference`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <div
                style={{
                  width: "82%",
                  height: "82%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ProductSVG
                  type="vase"
                  cfg={{
                    color: "var(--ka-clay)",
                    pattern: selectedChoices["Pattern"]?.toLowerCase() || "none",
                    text: Object.values(textInputs)[0] || "",
                  }}
                />
              </div>
            )}
          </div>

          {/* TOGGLE PREVIEW DISPLAY */}
          <div className="row row--between" style={{ marginTop: 12 }}>
            <span className="text-small text-muted">
              Reference view: <strong>{previewMode === "photo" ? "Workshop photograph" : "Simulated vector render"}</strong>
            </span>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setPreviewMode((m) => (m === "photo" ? "vector" : "photo"))}
            >
              Switch to {previewMode === "photo" ? "Vector simulation" : "Photograph"}
            </button>
          </div>
        </div>

        {/* ================= RIGHT: SPECIFICATION CONTROLS ================= */}
        <div className="popt">
          <div>
            <p className="eyebrow" style={{ marginBottom: 4 }}>
              Handmade to Order
            </p>
            <h1 style={{ fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)", margin: "0 0 8px" }}>
              {product.name}
            </h1>
            {artisan && (
              <p className="text-small text-muted" style={{ margin: 0 }}>
                Crafted by <strong>{artisan.name}</strong> ({artisan.location}) ·{" "}
                {artisan.verified && (
                  <span style={{ color: "var(--ka-success)", fontWeight: 600 }}>
                    Verified Partner
                  </span>
                )}
              </p>
            )}
          </div>

          <div className="row" style={{ gap: 12 }}>
            <strong style={{ fontSize: "1.5rem", color: "var(--ka-charcoal)" }}>
              {formatINR(totalPrice)}
            </strong>
            <span className="badge badge--clay">Fair trade partner pricing</span>
          </div>

          <p className="text-small text-muted" style={{ margin: 0 }}>
            {product.description}
          </p>

          <hr className="divider" style={{ margin: "var(--sp-2) 0" }} />

          {/* DYNAMIC CUSTOMIZATION OPTIONS FROM STORE */}
          {product.customization && product.customization.length > 0 ? (
            product.customization.map((opt) => (
              <div key={opt.label} className="field">
                <span className="ka-option-label" id={`opt-${opt.label}`}>
                  {opt.label}{" "}
                  {opt.priceDelta && opt.priceDelta > 0 && (
                    <small className="text-muted">(+{formatINR(opt.priceDelta)})</small>
                  )}
                </span>

                {opt.choices && (
                  <div
                    className="row row--wrap"
                    style={{ gap: 8 }}
                    role="radiogroup"
                    aria-labelledby={`opt-${opt.label}`}
                  >
                    {opt.choices.map((ch) => {
                      const checked = selectedChoices[opt.label] === ch;
                      return (
                        <label key={ch} className="ka-choice">
                          <input
                            type="radio"
                            name={opt.label}
                            value={ch}
                            checked={checked}
                            onChange={() =>
                              setSelectedChoices((prev) => ({ ...prev, [opt.label]: ch }))
                            }
                          />
                          <span>{ch}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {opt.freeText && (
                  <div>
                    <input
                      type="text"
                      className="input"
                      maxLength={opt.maxLength || 24}
                      placeholder={opt.note || "Enter custom inscription or initials…"}
                      value={textInputs[opt.label] || ""}
                      onChange={(e) =>
                        setTextInputs((prev) => ({ ...prev, [opt.label]: e.target.value }))
                      }
                      aria-labelledby={`opt-${opt.label}`}
                    />
                    {opt.maxLength && (
                      <span
                        className="text-small text-muted"
                        style={{ display: "block", marginTop: 4, textAlign: "right" }}
                      >
                        {(textInputs[opt.label] || "").length} / {opt.maxLength} characters
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-small text-muted">
              This piece is handcrafted in standard workshop editions.
            </p>
          )}

          {/* GENERATE SIMULATION BUTTON */}
          <div
            className="card card--pad"
            style={{
              background: "var(--ka-stone)",
              borderColor: "var(--ka-line-strong)",
              marginTop: "var(--sp-3)",
            }}
          >
            <div className="row" style={{ gap: 10, marginBottom: 8 }}>
              <IconSparkle size={18} />
              <strong style={{ fontSize: "0.95rem" }}>Bespoke Visual Feasibility</strong>
            </div>
            <p className="text-small text-muted" style={{ margin: "0 0 12px" }}>
              Simulates chosen variations against craft guidelines before handoff to the karigar.
            </p>
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              disabled={isGenerating}
              onClick={handleGenerate}
            >
              <IconSparkle size={15} />{" "}
              {isGenerating ? "Simulating variations…" : "Generate visual preview"}
            </button>
          </div>

          {/* ACTIONS */}
          <div className="row" style={{ gap: "var(--sp-3)", marginTop: "var(--sp-4)" }}>
            <button
              type="button"
              className="btn btn--outline"
              style={{ flex: 1 }}
              onClick={() => handleAddToCart(false)}
            >
              Add to bag · {formatINR(totalPrice)}
            </button>
            <button
              type="button"
              className="btn btn--primary"
              style={{ flex: 1 }}
              onClick={() => handleAddToCart(true)}
            >
              Buy now <IconArrowRight size={16} />
            </button>
          </div>

          <div
            className="row"
            style={{
              gap: 8,
              fontSize: "0.82rem",
              color: "var(--ka-muted)",
              marginTop: "var(--sp-2)",
            }}
          >
            <IconShield size={16} />
            <span>
              Ships with signed provenance card · 100% inspected by KALART before dispatch
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
