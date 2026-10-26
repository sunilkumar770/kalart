import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, formatINR, PRODUCTS } from "../data/store";
import { useApp } from "../context/AppContext";
import { Field } from "../components/ui";
import { IconArrowRight, IconCheck, IconShield } from "../components/icons";

export default function Checkout() {
  const { cart, user, setUser, toast } = useApp();
  const nav = useNavigate();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [addr, setAddr] = useState("");
  const [note, setNote] = useState("");
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);
  const [payMode, setPayMode] = useState<"upi" | "card">("upi");

  const subtotal = cart.reduce((s, l) => s + l.unitPrice * l.qty, 0);
  const shipping = subtotal >= 2000 || subtotal === 0 ? 0 : 99;
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <main id="main" className="container section">
        <p>There's nothing to check out yet.</p>
        <Link className="btn btn--primary" to="/shop">Browse the collection <IconArrowRight size={15} /></Link>
      </main>
    );
  }

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "We need a name for the delivery card.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = "Enter a valid email — order updates go there.";
    if (!/^[6-9]\d{9}$/.test(phone.replace(/\s/g, ""))) e.phone = "Enter a valid 10-digit Indian mobile number.";
    if (addr.trim().length < 12) e.addr = "Please include house/flat, street and PIN code.";
    setErrs(e);
    return !Object.keys(e).length;
  };

  const place = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) { toast("error", "Please correct the highlighted fields."); return; }
    setPlacing(true);
    try {
      // Continue as current user or create guest customer session so orders are retrievable.
      let u = user;
      if (!u) {
        u = { email: email.trim(), name: name.trim(), role: "customer" };
        sessionStorage.setItem("kalart-session", JSON.stringify(u));
        setUser(u);
      }
      const order = await api.placeOrder({ userEmail: u.email, address: addr, customNote: note || undefined });
      toast("success", `Order ${order.id} confirmed.`);
      nav(`/orders/${order.id}?new=1`);
    } catch (err: any) {
      toast("error", err.message ?? "Something went wrong placing your order.");
    } finally { setPlacing(false); }
  };

  return (
    <main id="main" className="container section--tight">
      <nav className="ka-crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link> / <Link to="/cart">Bag</Link> / <span aria-current="page">Checkout</span>
      </nav>
      <h1 style={{ marginBottom: "var(--sp-5)" }}>Checkout</h1>
      <form onSubmit={place} className="ka-checkout-grid" noValidate>
        <div className="stack" style={{ gap: "var(--sp-5)" }}>
          {!user && (
            <section className="card card--pad stack" aria-labelledby="contact-h">
              <h2 id="contact-h" style={{ fontSize: "1.05rem", margin: 0 }}>Contact &amp; account</h2>
              <p className="text-small text-muted" style={{ margin: 0 }}>
                Already have an account? <Link to="/login?next=/checkout">Sign in</Link> to see past orders — or continue below as a guest.
              </p>
            </section>
          )}

          <section className="card card--pad" aria-labelledby="ship-h">
            <h2 id="ship-h" style={{ fontSize: "1.05rem", marginTop: 0 }}>Delivery details</h2>
            <div className="grid grid-p2" style={{ gap: "0 var(--sp-4)" }}>
              <Field label="Full name" htmlFor="ck-name" required error={errs.name}>
                <input id="ck-name" className="input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errs.name} />
              </Field>
              <Field label="Email" htmlFor="ck-email" required error={errs.email}>
                <input id="ck-email" type="email" className="input" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errs.email} />
              </Field>
              <Field label="Mobile" htmlFor="ck-phone" required hint="For courier calls on delivery day." error={errs.phone}>
                <input id="ck-phone" type="tel" className="input" autoComplete="tel" inputMode="numeric" placeholder="98XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={!!errs.phone} />
              </Field>
              <Field label="PIN-ready address" htmlFor="ck-addr" required error={errs.addr}>
                <textarea id="ck-addr" className="textarea" autoComplete="street-address" rows={3}
                  placeholder="Flat / house no., street, city, state, PIN" value={addr} onChange={(e) => setAddr(e.target.value)} aria-invalid={!!errs.addr} />
              </Field>
            </div>
            <Field label="Note for the artisan (optional)" htmlFor="ck-note" hint="Anything the maker should know — gift wrap, colour nuances, deadlines.">
              <textarea id="ck-note" className="textarea" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>
          </section>

          <section className="card card--pad stack" aria-labelledby="pay-h">
            <h2 id="pay-h" style={{ fontSize: "1.05rem", margin: 0 }}>Payment</h2>
            <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="sr-only">Payment method</legend>
              <div className="row row--wrap" style={{ gap: 8 }}>
                <label className="ka-choice"><input type="radio" name="pay" checked={payMode === "upi"} onChange={() => setPayMode("upi")} /><span>UPI / netbanking</span></label>
                <label className="ka-choice"><input type="radio" name="pay" checked={payMode === "card"} onChange={() => setPayMode("card")} /><span>Card</span></label>
              </div>
            </fieldset>
            <p className="text-small text-muted row" style={{ gap: 8, margin: 0 }}>
              <IconShield size={15} /> This build does not connect to a live payment gateway. Pressing “Place order” records the order
              with status <em>Placed</em> and simulates a successful authorisation — clearly marked so it is never mistaken for real money movement.
            </p>
          </section>
        </div>

        <aside className="ka-buybox card card--pad stack" aria-label="Order summary">
          <h2 style={{ fontSize: "1.05rem", margin: 0 }}>Your order</h2>
          <ul className="stack" style={{ listStyle: "none", margin: 0, padding: 0, gap: 10 }}>
            {cart.map((l) => {
              const p = PRODUCTS.find((x) => x.id === l.productId);
              const pName = p ? p.name : "Handmade Piece";
              const pImg = p && p.images && p.images[0] ? p.images[0] : "/img/hero-main.jpg";
              return (
                <li key={l.productId + JSON.stringify(l.options)} className="row" style={{ gap: 10, alignItems: "flex-start" }}>
                  <img src={pImg} alt="" width={44} height={44} style={{ width: 44, height: 44, borderRadius: 6, objectFit: "cover", flex: "none" }} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, color: "var(--ka-charcoal)" }}>{pName} × {l.qty}</span>
                    {Object.entries(l.options).map(([k, v]) => <span key={k} className="text-small text-muted" style={{ display: "block", fontSize: "0.76rem" }}>{k}: {v}</span>)}
                  </span>
                  <span className="mono-num text-small">{formatINR(l.unitPrice * l.qty)}</span>
                </li>
              );
            })}
          </ul>
          <hr className="divider" style={{ margin: 0 }} />
          <div className="row row--between text-small"><span>Subtotal</span><strong className="mono-num">{formatINR(subtotal)}</strong></div>
          <div className="row row--between text-small"><span>Shipping</span><strong className="mono-num">{shipping === 0 ? "Free" : formatINR(shipping)}</strong></div>
          <div className="row row--between" style={{ fontSize: "1.05rem" }}><strong>Total</strong><strong className="mono-num" style={{ color: "var(--ka-charcoal)" }}>{formatINR(total)}</strong></div>
          <button className="btn btn--primary btn--block" type="submit" disabled={placing}>
            {placing ? "Confirming…" : <><IconCheck size={16} /> Place order · {formatINR(total)}</>}
          </button>
          <Link to="/cart" className="btn btn--ghost btn--sm">Back to bag</Link>
        </aside>
      </form>
    </main>
  );
}
