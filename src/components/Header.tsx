import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { KalartLogoSVG } from "./CraftSVG";

export default function Header() {
  const { cartCount, setCartOpen, toast } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const isCustomer =
    location.pathname === "/" ||
    location.pathname.startsWith("/shop") ||
    location.pathname.startsWith("/product") ||
    location.pathname.startsWith("/customize") ||
    location.pathname.startsWith("/artisans") ||
    location.pathname.startsWith("/crafts") ||
    location.pathname.startsWith("/gallery");

  const isArtisan = location.pathname.startsWith("/artisan");
  const isAdmin = location.pathname.startsWith("/admin");

  const handleModeSwitch = (mode: "customer" | "artisan" | "admin") => {
    if (mode === "customer") {
      navigate("/");
    } else if (mode === "artisan") {
      navigate("/artisan");
      toast("info", "Artisan Studio — review incoming custom designs");
    } else if (mode === "admin") {
      navigate("/admin");
      toast("info", "Admin console — verification & trust");
    }
  };

  const scrollToSection = (id: string) => {
    if (location.pathname !== "/") {
      navigate("/#" + id);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="ka-site-header" style={{ position: "sticky", top: 0, zIndex: 90, background: "rgba(250,245,238,0.95)", backdropFilter: "blur(14px)", borderBottom: "1px solid var(--line)" }}>
      {/* ANNOUNCEMENT BANNER */}
      <div className="ka-announce" role="note" style={{ background: "var(--ink)", color: "var(--cream)", padding: "7px 16px", fontSize: 12.5, textAlign: "center", letterSpacing: "0.03em" }}>
        🌿 0% Platform Commission · 100% Direct to Makers · Free shipping over ₹2,000 · Every piece ships with signed Certificate of Authenticity
      </div>

      <div className="hwrap" style={{ maxWidth: 1200, margin: "0 auto", padding: "12px 24px", display: "flex", alignItems: "center", gap: 20 }}>
        {/* LOGO */}
        <Link to="/" className="logo" style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: 10 }}>
          <KalartLogoSVG size={36} />
          <span>
            <b style={{ fontFamily: "Fraunces, serif", fontSize: 22, letterSpacing: "0.12em", fontWeight: 700, display: "block", color: "var(--ink)" }}>
              KALART
            </b>
            <small style={{ display: "block", fontSize: 9, letterSpacing: "0.26em", color: "var(--ink-soft)", textTransform: "uppercase", marginTop: -2 }}>
              Handmade · Custom · Verified
            </small>
          </span>
        </Link>

        {/* PRIMARY NAV */}
        <nav className="mainnav" style={{ display: "flex", gap: 20, marginLeft: 8 }}>
          <button
            onClick={() => scrollToSection("discover")}
            style={{ background: "none", border: "none", color: "var(--ink-soft)", fontSize: 14, fontWeight: 500, cursor: "pointer", padding: "4px 0" }}
          >
            Discover
          </button>
          <button
            onClick={() => scrollToSection("artisans")}
            style={{ background: "none", border: "none", color: "var(--ink-soft)", fontSize: 14, fontWeight: 500, cursor: "pointer", padding: "4px 0" }}
          >
            Artisans
          </button>
          <button
            onClick={() => scrollToSection("how")}
            style={{ background: "none", border: "none", color: "var(--ink-soft)", fontSize: 14, fontWeight: 500, cursor: "pointer", padding: "4px 0" }}
          >
            How it works
          </button>
          <Link
            to="/customize"
            style={{ color: "var(--terra)", textDecoration: "none", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}
          >
            <span>✨</span> Customizer
          </Link>
        </nav>

        <div style={{ flex: 1 }} />

        {/* TRI-ROLE SWITCHER */}
        <div className="seg" role="tablist" aria-label="Role Switcher">
          <button
            className={isCustomer ? "active" : ""}
            onClick={() => handleModeSwitch("customer")}
            aria-selected={isCustomer}
          >
            🛍 Customer
          </button>
          <button
            className={isArtisan ? "active" : ""}
            onClick={() => handleModeSwitch("artisan")}
            aria-selected={isArtisan}
          >
            🧵 Artisan
          </button>
          <button
            className={isAdmin ? "active" : ""}
            onClick={() => handleModeSwitch("admin")}
            aria-selected={isAdmin}
          >
            🛡 Admin
          </button>
        </div>

        {/* BASKET DRAWER TRIGGER */}
        <button
          className="cartbtn"
          onClick={() => setCartOpen(true)}
          aria-label={`Shopping cart with ${cartCount} items`}
        >
          <svg fill="none" strokeWidth="1.8" viewBox="0 0 24 24" width="20" height="20" stroke="var(--ink)">
            <path d="M6 7h12l-1.2 12.2a2 2 0 01-2 1.8H9.2a2 2 0 01-2-1.8L6 7z" />
            <path d="M9 10V6a3 3 0 016 0v4" />
          </svg>
          <span className={`cartcount ${cartCount > 0 ? "show" : ""}`}>
            {cartCount}
          </span>
        </button>
      </div>
    </header>
  );
}
