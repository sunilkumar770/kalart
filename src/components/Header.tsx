import { useEffect, useRef, useState } from "react";
import { Form, Link, NavLink, useNavigate } from "react-router-dom";
import { api, CATEGORIES } from "../data/store";
import { useApp } from "../context/AppContext";
import { IconBag, IconHeart, IconMenu, IconClose, IconSearch, IconUser, IconChevronDown } from "./icons";

const NAV = [
  { to: "/shop", label: "Shop" },
  { to: "/crafts", label: "Crafts" },
  { to: "/artisans", label: "Artisans" },
  { to: "/customize", label: "Customise" },
  { to: "/about", label: "Our story" },
];

export default function Header() {
  const { user, cartCount, favorites, setUser } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [craftsOpen, setCraftsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const craftsRef = useRef<HTMLLIElement>(null);
  const acctRef = useRef<HTMLLIElement>(null);
  const nav = useNavigate();

  // close menus on outside click + Escape
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (craftsRef.current && !craftsRef.current.contains(e.target as Node)) setCraftsOpen(false);
      if (acctRef.current && !acctRef.current.contains(e.target as Node)) setAccountOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setCraftsOpen(false); setAccountOpen(false); setMobileOpen(false); }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, []);

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    "ka-navlink" + (isActive ? " ka-navlink--active" : "");

  return (
    <header className="ka-header">
      <div className="ka-announce" role="note">
        Free shipping over ₹2,000 · Every piece ships with its artisan's story card
      </div>
      <div className="container ka-header__inner">
        <button className="ka-iconbtn ka-mobile-only" aria-label="Open menu" aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}>
          {mobileOpen ? <IconClose size={22} /> : <IconMenu size={22} />}
        </button>

        <Link to="/" className="ka-logo" aria-label="KALART — home">
          <LogoMark />
          <span>KALART</span>
        </Link>

        <nav aria-label="Primary" className={"ka-nav" + (mobileOpen ? " ka-nav--open" : "")}>
          <ul>
            {NAV.slice(0, 1).map((n) => (
              <li key={n.to}><NavLink to={n.to} className={linkCls} onClick={() => setMobileOpen(false)}>{n.label}</NavLink></li>
            ))}
            <li ref={craftsRef} className="ka-has-menu">
              <button className="ka-navlink ka-menubtn" aria-expanded={craftsOpen} aria-haspopup="true"
                onClick={() => setCraftsOpen((v) => !v)}>
                Crafts <IconChevronDown size={14} />
              </button>
              {craftsOpen && (
                <div className="ka-mega" onMouseLeave={() => setCraftsOpen(false)}>
                  <ul className="ka-mega__list" role="menu">
                    {CATEGORIES.map((c) => (
                      <li key={c.slug} role="none">
                        <Link role="menuitem" to={`/shop?category=${c.slug}`} onClick={() => { setCraftsOpen(false); setMobileOpen(false); }}>
                          <img src={c.image} alt="" width={40} height={40} loading="lazy" style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }} />
                          <span>
                            <strong>{c.name}</strong>
                            <small className="text-muted" style={{ display: "block", fontSize: "0.78rem", lineHeight: 1.35 }}>{c.blurb}</small>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="ka-mega__aside">
                    <p className="eyebrow" style={{ marginBottom: 6 }}>Not sure where to start?</p>
                    <p className="text-small text-muted" style={{ margin: "0 0 12px" }}>Browse the bestsellers our customers reorder most.</p>
                    <Link className="btn btn--outline btn--sm" to="/shop?sort=rating" onClick={() => setCraftsOpen(false)}>Top-rated pieces</Link>
                  </div>
                </div>
              )}
            </li>
            {NAV.slice(2).map((n) => (
              <li key={n.to}><NavLink to={n.to} className={linkCls} onClick={() => setMobileOpen(false)}>{n.label}</NavLink></li>
            ))}
          </ul>
        </nav>

        <div className="ka-actions">
          <Form role="search" action="/shop" method="get" className="ka-search" onSubmit={(e) => {
            const q = (new FormData(e.currentTarget).get("q") as string | null)?.trim();
            e.preventDefault();
            nav(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
            setMobileOpen(false);
          }}>
            <IconSearch size={18} />
            <input type="search" name="q" placeholder="Search shawls, jutti, ikat…" aria-label="Search products" />
          </Form>

          <Link to="/favorites" className="ka-iconbtn" aria-label={`Favourites (${favorites.length})`}>
            <IconHeart size={20} />
            {favorites.length > 0 && <span className="ka-count">{favorites.length}</span>}
          </Link>

          <Link to="/cart" className="ka-iconbtn" aria-label={`Cart (${cartCount} items)`}>
            <IconBag size={20} />
            {cartCount > 0 && <span className="ka-count ka-count--clay">{cartCount}</span>}
          </Link>

          <div ref={acctRef} className="ka-has-menu ka-acct">
            <button className="ka-iconbtn" aria-expanded={accountOpen} aria-haspopup="true"
              aria-label={user ? `Account menu for ${user.name}` : "Sign in"}
              onClick={() => setAccountOpen((v) => !v)}>
              <IconUser size={20} />
            </button>
            {accountOpen && (
              <div className="ka-dropdown">
                {user ? (
                  <>
                    <p className="text-small" style={{ margin: "4px 14px 8px" }}>
                      Signed in as <strong>{user.name}</strong><br />
                      <span className="badge badge--neutral" style={{ marginTop: 4 }}>{roleLabel(user.role)}</span>
                    </p>
                    <hr className="divider" style={{ margin: "6px 0" }} />
                    {(user.role === "customer" || !user.role) && <Link to="/account/orders" onClick={() => setAccountOpen(false)}>My orders</Link>}
                    {user.role === "artisan" && <Link to="/artisan" onClick={() => setAccountOpen(false)}>Artisan workspace</Link>}
                    {user.role === "admin" && <Link to="/admin" onClick={() => setAccountOpen(false)}>Admin console</Link>}
                    <Link to="/favorites" onClick={() => setAccountOpen(false)}>Favourites</Link>
                    <button className="ka-dd-btn" onClick={() => { api.logout(); setUser(null); setAccountOpen(false); nav("/"); }}>Sign out</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setAccountOpen(false)}>Sign in</Link>
                    <Link to="/signup" onClick={() => setAccountOpen(false)}>Create account</Link>
                    <hr className="divider" style={{ margin: "6px 0" }} />
                    <Link to="/sell" onClick={() => setAccountOpen(false)}>Sell your craft</Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* mobile search sits below when menu open */}
      {mobileOpen && (
        <div className="container ka-mobile-search">
          <Form role="search" action="/shop" method="get" className="ka-search ka-search--full" onSubmit={(e) => {
            const q = (new FormData(e.currentTarget).get("q") as string | null)?.trim();
            e.preventDefault();
            nav(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
            setMobileOpen(false);
          }}>
            <IconSearch size={18} />
            <input type="search" name="q" placeholder="Search handmade crafts…" aria-label="Search products" />
          </Form>
        </div>
      )}
    </header>
  );
}

function roleLabel(r: string) {
  return r === "admin" ? "Administrator" : r === "artisan" ? "Artisan partner" : "Customer";
}

function LogoMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden focusable="false">
      <rect x="1" y="1" width="30" height="30" rx="8" fill="#2b2620" />
      <path d="M8 24V8m0 8 8-8m-8 8 8 8" stroke="#f3ecdf" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <circle cx="23" cy="10.5" r="2.6" fill="#a8503a" />
    </svg>
  );
}
