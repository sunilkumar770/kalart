import React from "react";
import { useApp } from "../context/AppContext";
import { SHOWCASE_PRODUCTS } from "../data/showcaseData";
import { ProductSVG } from "./CraftSVG";

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, setQty, setCheckoutOpen, toast } = useApp();

  if (!cartOpen) return null;

  const subtotal = cart.reduce((s, c) => s + c.unitPrice * c.qty, 0);

  const handleCheckout = () => {
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  return (
    <>
      <div className="backdrop show" onClick={() => setCartOpen(false)} />
      <aside className="cart-drawer open" aria-label="Shopping Basket">
        <div className="drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>🛍</span>
            <h3 style={{ margin: 0, fontFamily: "Fraunces, serif", fontSize: 20 }}>
              Your Basket ({cart.reduce((s, c) => s + c.qty, 0)})
            </h3>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            style={{
              background: "none",
              border: "none",
              fontSize: 22,
              cursor: "pointer",
              color: "var(--ink-soft)",
            }}
            aria-label="Close cart"
          >
            ×
          </button>
        </div>

        <div className="drawer-body">
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 16px", color: "var(--ink-soft)" }}>
              <p style={{ fontSize: 40, margin: "0 0 12px" }}>🧺</p>
              <h4 style={{ fontFamily: "Fraunces, serif", fontSize: 18, margin: "0 0 6px" }}>
                Your basket is empty
              </h4>
              <p style={{ fontSize: 13.5 }}>Explore our verified master artisans and create a bespoke piece.</p>
            </div>
          ) : (
            cart.map((line, idx) => {
              const p = SHOWCASE_PRODUCTS.find((x) => x.id === line.productId) || SHOWCASE_PRODUCTS[0];
              const optList = Object.entries(line.options || {}).map(([k, v]) => `${k}: ${v}`);
              const colorHex = line.options?.["Color"] || p.colors[0]?.h || "#C05F3C";
              const pattern = (line.options?.["Pattern"] || "none").toLowerCase();
              const text = line.options?.["Engraving"] || line.options?.["Text"] || "";

              return (
                <div key={idx} className="cline">
                  <div className="cprev">
                    <ProductSVG type={p.svg} cfg={{ color: colorHex, pattern, text }} />
                  </div>
                  <div className="cinfo">
                    <b>{p.name}</b>
                    <p>{optList.length ? optList.join(" · ") : "Standard artisanal edition"}</p>
                    <div className="qty-ctrl">
                      <button onClick={() => setQty(idx, line.qty - 1)} aria-label="Decrease quantity">
                        –
                      </button>
                      <span>{line.qty}</span>
                      <button onClick={() => setQty(idx, line.qty + 1)} aria-label="Increase quantity">
                        +
                      </button>
                    </div>
                  </div>
                  <div>
                    <div className="cprice">${(line.unitPrice * line.qty).toFixed(2)}</div>
                    <button
                      className="rm"
                      onClick={() => {
                        setQty(idx, 0);
                        toast("info", "Item removed from basket");
                      }}
                    >
                      remove
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
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ color: "var(--sage)", fontWeight: 600 }}>
                <span>Platform commission</span>
                <span>$0.00 (0%)</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, paddingTop: 8, borderTop: "1px dashed var(--line)" }}>
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="commission-note" style={{ margin: "12px 0 14px", fontSize: 12.5 }}>
              🌿 100% of this total goes directly to the master makers. No platform markups.
            </div>

            <button
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={handleCheckout}
            >
              Checkout · ${subtotal.toFixed(2)} →
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
