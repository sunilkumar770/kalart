import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { SealSVG } from "./CraftSVG";
import { SHOWCASE_PRODUCTS, getArtisanById, DesignRequest } from "../data/showcaseData";

export default function CheckoutModal() {
  const { checkoutOpen, setCheckoutOpen, cart, clearCart, toast } = useApp();
  const [placedOrder, setPlacedOrder] = useState<{
    orderId: string;
    productName: string;
    artisanName: string;
    artisanLoc: string;
    total: number;
    needsApproval: boolean;
  } | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [card, setCard] = useState("");
  const [exp, setExp] = useState("");
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  if (!checkoutOpen) return null;

  const total = cart.reduce((s, c) => s + c.unitPrice * c.qty, 0);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, boolean> = {
      name: !name.trim(),
      email: !email.trim(),
      address: !address.trim(),
      card: !card.trim(),
      exp: !exp.trim(),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) {
      toast("error", "Please complete all required fields");
      return;
    }

    const orderId = "KA-" + Math.floor(2300 + Math.random() * 600);
    const firstLine = cart[0];
    const p0 =
      SHOWCASE_PRODUCTS.find((p) => p.id === firstLine?.productId) ||
      SHOWCASE_PRODUCTS[0];
    const a0 = getArtisanById(p0.artisanId) || {
      name: "Meera Kapoor",
      loc: "Jaipur, India",
    };

    const needsApproval = cart.some(
      (c) => Object.keys(c.options || {}).length > 0
    );

    // Save custom designs into artisan queue
    try {
      const stored = localStorage.getItem("kalart_custom_designs");
      const list: DesignRequest[] = stored ? JSON.parse(stored) : [];
      cart.forEach((c) => {
        if (Object.keys(c.options || {}).length > 0) {
          list.unshift({
            id: "d" + Date.now() + Math.floor(Math.random() * 100),
            pid: c.productId,
            cfg: {
              colorIdx: 0,
              pattern: (c.options["Pattern"] || "waves").toLowerCase(),
              sizeIdx: 0,
              text: c.options["Text"] || c.options["Engraving"] || "",
            },
            customer: name.trim() || "Guest Patron",
            date: "Today",
            note: "New custom order #" + orderId,
            approved: false,
          });
        }
      });
      localStorage.setItem("kalart_custom_designs", JSON.stringify(list));
    } catch {}

    setPlacedOrder({
      orderId,
      productName: p0.name,
      artisanName: a0.name,
      artisanLoc: a0.loc,
      total,
      needsApproval,
    });
    clearCart();
    toast("success", "Order placed — certificate of authenticity issued 🎉");
  };

  const handleClose = () => {
    setCheckoutOpen(false);
    setPlacedOrder(null);
  };

  return (
    <div className="modal show" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h3 className="serif" style={{ fontSize: 22, margin: 0 }}>
            {placedOrder ? "Order confirmed" : "Direct Checkout"}
          </h3>
          <button
            onClick={handleClose}
            style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "var(--ink-soft)" }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {placedOrder ? (
          <div className="success-anim">
            <div className="check-circle">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fff" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="serif" style={{ fontSize: 22, margin: "14px 0 6px" }}>
              Thank you! Order #{placedOrder.orderId}
            </h3>
            <p style={{ color: "var(--ink-soft)", fontSize: "13.5px", margin: "0 0 16px" }}>
              {placedOrder.needsApproval
                ? "Your custom design was sent directly to the artisan's studio for approval — production starts once approved."
                : "Handmade crafting begins right away."}{" "}
              Total paid: <b>${placedOrder.total.toFixed(2)}</b> · platform commission{" "}
              <b style={{ color: "var(--sage)" }}>$0.00 (100% to artisan)</b>
            </p>

            <div className="cert-card">
              <div className="ct">
                <h4 style={{ fontFamily: "Fraunces, serif", fontSize: 17, marginBottom: 6 }}>
                  Certificate of Authenticity
                </h4>
                <div className="seal">
                  <SealSVG />
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.5, margin: 0 }}>
                  This certifies that <b>{placedOrder.productName}</b> was handmade by{" "}
                  <b>{placedOrder.artisanName}</b> ({placedOrder.artisanLoc})
                  <br />
                  <span style={{ fontSize: 11.5, color: "var(--ink-soft)", marginTop: 4, display: "inline-block" }}>
                    Unique Provenance ID KAL-{placedOrder.orderId}-{Math.floor(1000 + Math.random() * 9000)}
                  </span>
                </p>
              </div>
            </div>

            <button className="btn btn-dark btn-sm" style={{ marginTop: 20 }} onClick={handleClose}>
              Continue browsing
            </button>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder}>
            <div className="f2">
              <div className={`field ${errors.name ? "err" : ""}`}>
                <label>Full name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Amelie Fontaine"
                />
              </div>
              <div className={`field ${errors.email ? "err" : ""}`}>
                <label>Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patron@kalart.in"
                />
              </div>
            </div>

            <div className={`field ${errors.address ? "err" : ""}`}>
              <label>Shipping address</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="12 Heritage Lane, London / Mumbai"
              />
            </div>

            <div className="f2">
              <div className={`field ${errors.card ? "err" : ""}`}>
                <label>Card number</label>
                <input
                  value={card}
                  onChange={(e) => setCard(e.target.value)}
                  placeholder="4242 •••• •••• 4242"
                  maxLength={19}
                />
              </div>
              <div className={`field ${errors.exp ? "err" : ""}`}>
                <label>Expiry / CVC</label>
                <input
                  value={exp}
                  onChange={(e) => setExp(e.target.value)}
                  placeholder="12/28 · 123"
                />
              </div>
            </div>

            <div className="commission-note" style={{ marginTop: 10, fontSize: 13 }}>
              🌿 Order total <b>${total.toFixed(2)}</b> — platform commission $0.00. Artisans receive 100%.
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", marginTop: 14 }}
            >
              Place order · ${total.toFixed(2)}
            </button>
            <p style={{ fontSize: "11.5px", color: "var(--ink-soft)", textAlign: "center", marginTop: 10, marginBottom: 0 }}>
              Direct patron-to-artisan escrow · Handcrafted upon order
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
