import { Link } from "react-router-dom";
import { CATEGORIES } from "../data/store";
import {
  IconChevronDown,
  IconShield,
  IconTruck,
  IconRefresh,
  IconCheck,
} from "./icons";

export default function Footer() {
  return (
    <footer className="ka-footer">
      <div className="container">
        {/* Singular truthful craft trust bar */}
        <div className="ka-trust">
          <span><IconShield size={18} /> Verified artisans, signed work</span>
          <span><IconTruck size={18} /> Ships across India in 7–16 days</span>
          <span><IconRefresh size={18} /> 14-day returns on standard pieces</span>
          <span><IconCheck size={18} /> 0% commission on partner workshops</span>
        </div>

        <hr style={{ border: 0, borderTop: "1px solid rgba(243,236,223,.14)", margin: "var(--sp-6) 0" }} />

        <div className="ka-footer__editorial">
          <h3 className="ka-footer__brand" style={{ color: "#f3ecdf", margin: "0 0 6px" }}>KALART</h3>
          <p className="text-small" style={{ maxWidth: "42ch", color: "#cfc6b6", margin: 0 }}>
            A quiet marketplace pairing traditional Indian master karigars with customers who value
            authentic, customisable handmade work — priced honestly, made slowly.
          </p>
        </div>

        <div className="ka-footer__sections">
          {/* Section 1: Shop */}
          <details className="ka-footer-accordion" open>
            <summary className="ka-footer-accordion__summary">
              <span>Shop by craft</span>
              <IconChevronDown size={16} className="ka-footer-accordion__icon" />
            </summary>
            <ul className="ka-footer-accordion__list">
              {CATEGORIES.slice(0, 6).map((c) => (
                <li key={c.slug}>
                  <Link to={`/shop?category=${c.slug}`}>{c.name}</Link>
                </li>
              ))}
            </ul>
          </details>

          {/* Section 2: Company */}
          <details className="ka-footer-accordion">
            <summary className="ka-footer-accordion__summary">
              <span>Company</span>
              <IconChevronDown size={16} className="ka-footer-accordion__icon" />
            </summary>
            <ul className="ka-footer-accordion__list">
              <li><Link to="/about">Our story</Link></li>
              <li><Link to="/artisans">Meet the artisans</Link></li>
              <li><Link to="/customize">Customisation studio</Link></li>
              <li><Link to="/sell">Become an artisan partner</Link></li>
              <li><Link to="/help">Help &amp; contact</Link></li>
            </ul>
          </details>

          {/* Section 3: Policies */}
          <details className="ka-footer-accordion">
            <summary className="ka-footer-accordion__summary">
              <span>Policies</span>
              <IconChevronDown size={16} className="ka-footer-accordion__icon" />
            </summary>
            <ul className="ka-footer-accordion__list">
              <li><Link to="/legal/shipping">Shipping &amp; delivery</Link></li>
              <li><Link to="/legal/returns">Returns &amp; refunds</Link></li>
              <li><Link to="/legal/privacy">Privacy</Link></li>
              <li><Link to="/legal/terms">Terms of use</Link></li>
            </ul>
          </details>
        </div>

        <div className="ka-footer__bottom">
          <span>© 2026 KALART · Bengaluru, India · Handcrafted heritage directly from master artisans</span>
          <span className="badge badge--neutral" style={{ background: "rgba(255,255,255,0.08)", color: "#e9e1d0", border: 0 }}>
            Prototype development build · Direct artisan commerce
          </span>
        </div>
      </div>
    </footer>
  );
}
