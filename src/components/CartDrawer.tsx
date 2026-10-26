import { useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { PRODUCTS, formatINR } from "../data/store";
import {
  IconBag,
  IconClose,
  IconMinus,
  IconPlus,
  IconTrash,
  IconArrowRight,
  IconShield,
} from "./icons";

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, setQty, toast } = useApp();
  const navigate = useNavigate();
  const drawerRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  // Close on Escape & trap focus
  useEffect(() => {
    if (!cartOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCartOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);

    // Focus the close button when opened
    const t = setTimeout(() => {
      firstFocusableRef.current?.focus();
    }, 50);

    return () => {
      document.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [cartOpen, setCartOpen]);

  if (!cartOpen) return null;

  const subtotal = cart.reduce((s, c) => s + c.unitPrice * c.qty, 0);

  const handleProceedToCheckout = () => {
    setCartOpen(false);
    navigate("/checkout");
  };

  return (
    <>
      <div
        className="backdrop show"
        onClick={() => setCartOpen(false)}
        aria-hidden="true"
      />
      <div
        ref={drawerRef}
        className="cart-drawer open"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
      >
        <div className="drawer-head">
          <div className="row" style={{ gap: 10 }}>
            <IconBag size={20} />
            <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 650 }}>
              Your Bag ({cart.reduce((s, c) => s + c.qty, 0)})
            </h2>
          </div>
          <button
            ref={firstFocusableRef}
            type="button"
            className="ka-iconbtn"
            onClick={() => setCartOpen(false)}
            aria-label="Close bag"
          >
            <IconClose size={20} />
          </button>
        </div>

        <div className="drawer-body">
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 16px", color: "var(--ka-muted)" }}>
              <p className="eyebrow" style={{ marginBottom: 8 }}>
                Bag is empty
              </p>
              <h3 style={{ fontSize: "1.1rem", margin: "0 0 8px", color: "var(--ka-charcoal)" }}>
                No pieces added yet
              </h3>
              <p className="text-small" style={{ marginBottom: 20 }}>
                Explore authentic handmade work from master karigars across India.
              </p>
              <Link
                to="/shop"
                className="btn btn--outline btn--sm"
                onClick={() => setCartOpen(false)}
              >
                Browse collection <IconArrowRight size={14} />
              </Link>
            </div>
          ) : (
            cart.map((line, idx) => {
              const p = PRODUCTS.find((x) => x.id === line.productId) || PRODUCTS[0];
              const optList = Object.entries(line.options || {}).map(
                ([k, v]) => `${k}: ${v}`
              );

              return (
                <div key={idx} className="cline">
                  <div className="cprev">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      width={72}
                      height={72}
                      loading="lazy"
                    />
                  </div>
                  <div className="cinfo">
                    <strong style={{ color: "var(--ka-charcoal)", lineHeight: 1.3 }}>
                      {p.name}
                    </strong>
                    <span className="text-small text-muted" style={{ fontSize: "0.82rem" }}>
                      {optList.length ? optList.join(" · ") : "Standard edition"}
                    </span>
                    <div className="qty-ctrl">
                      <button
                        type="button"
                        onClick={() => setQty(idx, line.qty - 1)}
                        aria-label={`Decrease quantity of ${p.name}`}
                      >
                        <IconMinus size={12} />
                      </button>
                      <span className="mono-num" style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                        {line.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty(idx, line.qty + 1)}
                        aria-label={`Increase quantity of ${p.name}`}
                      >
                        <IconPlus size={12} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <div className="cprice">{formatINR(line.unitPrice * line.qty)}</div>
                    <button
                      type="button"
                      className="btn--ghost"
                      style={{
                        background: "none",
                        border: 0,
                        color: "var(--ka-muted)",
                        fontSize: "0.78rem",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        marginLeft: "auto",
                        marginTop: 6,
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setQty(idx, 0);
                        toast("info", "Item removed from bag");
                      }}
                      aria-label={`Remove ${p.name} from bag`}
                    >
                      <IconTrash size={13} /> Remove
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {cart.length > 0 && (
          <div className="drawer-foot">
            <div className="summary">
              <div>
                <span className="text-muted">Subtotal</span>
                <strong className="mono-num">{formatINR(subtotal)}</strong>
              </div>
              <div>
                <span className="text-muted">Shipping</span>
                <span style={{ color: "var(--ka-success)", fontWeight: 600 }}>
                  {subtotal >= 2000 ? "Free" : "₹150"}
                </span>
              </div>
              <div
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  paddingTop: 8,
                  borderTop: "1px dashed var(--ka-line)",
                  color: "var(--ka-charcoal)",
                }}
              >
                <span>Estimated total</span>
                <span className="mono-num">
                  {formatINR(subtotal >= 2000 ? subtotal : subtotal + 150)}
                </span>
              </div>
            </div>

            <div
              className="row"
              style={{
                margin: "12px 0 14px",
                fontSize: "0.8rem",
                color: "var(--ka-muted)",
                gap: 8,
              }}
            >
              <IconShield size={16} />
              <span>Ships with artisan provenance card · Insured delivery</span>
            </div>

            <button
              type="button"
              className="btn btn--primary btn--block"
              onClick={handleProceedToCheckout}
            >
              Proceed to checkout <IconArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
