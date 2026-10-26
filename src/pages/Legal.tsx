import { Link, useParams } from "react-router-dom";
import { IconArrowRight, IconRefresh, IconSearch, IconShield, IconTruck } from "../components/icons";

const LEGAL: Record<string, { title: string; intro: string; sections: [string, string][] }> = {
  shipping: {
    title: "Shipping & delivery",
    intro: "Handmade work is made after you order it, so every listing shows an honest production window plus transit time.",
    sections: [
      ["Production time", "Listed per product (typically 4–22 days). Customised pieces begin only after the artisan's feasibility note is approved by you."],
      ["Transit", "3–5 working days across India via insured partners; metro cities often faster. You receive tracking at handover."],
      ["Charges", "Free above ₹2,000. Below that, a flat ₹99 covers packing in recycled materials and insurance."],
      ["Remote areas", "Some NE/JSR pin codes add 2–4 days; we flag this at checkout before payment."],
    ],
  },
  returns: {
    title: "Returns & refunds",
    intro: "Standard pieces can be returned within 14 days of delivery in unused condition — we arrange pickup and refund to the original method within 5 working days.",
    sections: [
      ["Customised work", "Made-to-brief pieces can't be resold, so returns are accepted only when the item differs materially from your approved preview or arrives damaged. Photograph within 48 hours of delivery."],
      ["Damage in transit", "Full refund or free remake, your choice. Insurance covers 100% of order value."],
      ["Refund timing", "UPI/card refunds initiate immediately on approval; bank posting takes 3–7 days."],
    ],
  },
  privacy: {
    title: "Privacy policy",
    intro: "We collect the minimum needed to make and deliver your order, and we never sell it.",
    sections: [
      ["What we store", "Name, contact, address, order history. Artisans see only what's needed to produce and ship your piece."],
      ["Reference images", "Uploads for customisation are shared with the assigned artisan and deleted 90 days after delivery unless you ask otherwise."],
      ["This demo build", "Data lives in your browser's local storage only; nothing leaves your device. Clearing site data erases everything."],
      ["Your rights", "Export or delete your account any time from Account settings or by writing to privacy@kalart.in."],
    ],
  },
  terms: {
    title: "Terms of use",
    intro: "Buying handmade means buying from a person, not a factory. A few ground rules keep that relationship fair.",
    sections: [
      ["Previews", "AI-assisted previews are visualisations, not guarantees. Final work is handmade; small variations in colour and line are characteristic of craft, not defects."],
      ["Approvals", "Once you approve a design version and the artisan starts production, option changes require their consent and may adjust price and timeline."],
      ["Pricing", "Artisans set their own prices. Platform commission is 15%, disclosed on artisan invoices."],
      ["Liability", "We mediate disputes between customers and workshops and act as courier insurer; our liability is capped at order value."],
    ],
  },
};

export default function Legal() {
  const { doc = "shipping" } = useParams();
  const page = LEGAL[doc];
  if (!page) {
    return (
      <main id="main" className="container section">
        <h1>Policy not found</h1>
        <Link className="btn btn--primary" to="/legal/shipping">See shipping policy <IconArrowRight size={15} /></Link>
      </main>
    );
  }
  return (
    <main id="main" className="container section--tight">
      <nav className="ka-crumbs" aria-label="Breadcrumb"><Link to="/">Home</Link> / <span aria-current="page">{page.title}</span></nav>
      <div style={{ maxWidth: "68ch", marginBlock: "var(--sp-4)" }}>
        <p className="eyebrow">KALART policies · updated 1 Oct 2026</p>
        <h1>{page.title}</h1>
        <p className="lede">{page.intro}</p>
        {page.sections.map(([h, b]) => (
          <section key={h} style={{ marginTop: "var(--sp-5)" }}>
            <h2 style={{ fontSize: "1.05rem" }}>{h}</h2>
            <p style={{ margin: 0 }} className="text-muted">{b}</p>
          </section>
        ))}
      </div>
      <hr className="divider" />
      <div className="row row--wrap" style={{ gap: "var(--sp-3)" }}>
        {Object.entries(LEGAL).map(([k, v]) => k !== doc && (
          <Link key={k} to={`/legal/${k}`} className="btn btn--outline btn--sm">{v.title}</Link>
        ))}
        <Link to="/help" className="btn btn--ghost btn--sm">Questions? Contact us</Link>
      </div>
    </main>
  );
}

export function NotFound() {
  return (
    <main id="main" className="container section text-center">
      <div className="stack" style={{ alignItems: "center", paddingBlock: "var(--sp-7)" }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "5rem", color: "var(--ka-clay)", lineHeight: 1 }}>404</span>
        <h1>This thread ran out.</h1>
        <p className="text-muted" style={{ maxWidth: "46ch" }}>The page you asked for isn't in our catalogue — but the loom keeps turning. Try one of these instead:</p>
        <div className="row row--wrap" style={{ justifyContent: "center", gap: "var(--sp-3)", marginTop: "var(--sp-3)" }}>
          <Link to="/shop" className="btn btn--primary"><IconSearch size={15} /> Browse the shop</Link>
          <Link to="/customize" className="btn btn--outline"><IconRefresh size={15} /> Start a custom piece</Link>
          <Link to="/artisans" className="btn btn--ghost">Meet the artisans</Link>
        </div>
      </div>
    </main>
  );
}
