import { Link } from "react-router-dom";
import { CATEGORIES } from "../data/store";
import { IconShield, IconTruck, IconRefresh, IconChat } from "./icons";

export default function Footer() {
  return (
    <footer className="ka-footer">
      <div className="container">
        <div className="ka-trust">
          <span><IconShield size={18} /> Verified artisans, signed work</span>
          <span><IconTruck size={18} /> Ships across India in 7–16 days</span>
          <span><IconRefresh size={18} /> 14-day returns on standard pieces</span>
          <span><IconChat size={18} /> Talk to the maker before you buy</span>
        </div>
        <hr style={{ border: 0, borderTop: "1px solid rgba(243,236,223,.14)", margin: "var(--sp-6) 0" }} />
        <div className="ka-footer__grid">
          <div>
            <h4>KALART</h4>
            <p className="text-small" style={{ maxWidth: "34ch" }}>
              A premium marketplace pairing traditional Indian karigars with customers who want authentic,
              customisable handmade work — priced honestly, made slowly.
            </p>
          </div>
          <nav aria-label="Shop by craft">
            <h4>Shop</h4>
            <ul>
              {CATEGORIES.slice(0, 6).map((c) => (
                <li key={c.slug}><Link to={`/shop?category=${c.slug}`}>{c.name}</Link></li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Company links">
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">Our story</Link></li>
              <li><Link to="/artisans">Meet the artisans</Link></li>
              <li><Link to="/customize">Customisation studio</Link></li>
              <li><Link to="/sell">Become an artisan partner</Link></li>
              <li><Link to="/help">Help &amp; contact</Link></li>
            </ul>
          </nav>
          <nav aria-label="Legal links">
            <h4>Policies</h4>
            <ul>
              <li><Link to="/legal/shipping">Shipping &amp; delivery</Link></li>
              <li><Link to="/legal/returns">Returns &amp; refunds</Link></li>
              <li><Link to="/legal/privacy">Privacy</Link></li>
              <li><Link to="/legal/terms">Terms of use</Link></li>
            </ul>
          </nav>
        </div>
        <div className="ka-footer__bottom">
          <span>© 2026 Kalart Crafts Pvt. Ltd. · Bengaluru · GSTIN 29AABCK1234D1Z5</span>
          <span>Made with hand-set type and honest light.</span>
        </div>
      </div>
    </footer>
  );
}
