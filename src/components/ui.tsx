import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Artisan, Product } from "../data/store";
import { formatINR } from "../data/store";
import { useApp } from "../context/AppContext";
import { IconHeart, IconStar, IconCheck, IconSearch, IconArrowRight, IconUpload, IconAlert, IconInfo, IconClose } from "./icons";

// ---------------------------------------------------------------- Price
export function Price({ value, compareAt, size = "md" }: { value: number; compareAt?: number; size?: "sm" | "md" | "lg" }) {
  const s = size === "lg" ? 1.4 : size === "sm" ? 0.95 : 1.12;
  return (
    <span className="row" style={{ gap: 8 }}>
      <strong style={{ fontSize: s, color: "var(--ka-charcoal)", fontWeight: 650 }} className="mono-num">
        {formatINR(value)}
      </strong>
      {compareAt && compareAt > value ? (
        <s style={{ color: "var(--ka-faint)", fontSize: s * 0.78 }} className="mono-num">{formatINR(compareAt)}</s>
      ) : null}
    </span>
  );
}

// ---------------------------------------------------------------- Rating
export function Rating({ value, count }: { value: number; count?: number }) {
  return (
    <span className="row" style={{ gap: 6 }} aria-label={`Rated ${value.toFixed(1)} out of 5${count != null ? ` from ${count} reviews` : ""}`}>
      <span aria-hidden style={{ color: "var(--ka-gold)", display: "flex" }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <IconStar key={i} size={14} filled={i <= Math.round(value)} strokeWidth={1.2} />
        ))}
      </span>
      <span className="text-small mono-num" style={{ color: "var(--ka-muted)" }}>
        {value.toFixed(1)}{count != null ? ` (${count})` : ""}
      </span>
    </span>
  );
}

// ---------------------------------------------------------------- Status badge
const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  placed: { label: "Placed", cls: "badge--info" },
  customization_review: { label: "Design review", cls: "badge--warning" },
  in_production: { label: "In production", cls: "badge--indigo" },
  shipped: { label: "Shipped", cls: "badge--clay" },
  delivered: { label: "Delivered", cls: "badge--success" },
  cancelled: { label: "Cancelled", cls: "badge--error" },
  new: { label: "New request", cls: "badge--info" },
  feasibility_ok: { label: "Feasible", cls: "badge--indigo" },
  revision_requested: { label: "Revision requested", cls: "badge--warning" },
  approved: { label: "Approved", cls: "badge--success" },
  declined: { label: "Declined", cls: "badge--error" },
};
export function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? { label: status, cls: "badge--neutral" };
  return <span className={`badge ${s.cls}`}><span className="dot" aria-hidden />{s.label}</span>;
}

// ---------------------------------------------------------------- Skeletons & states
export function ProductCardSkeleton() {
  return (
    <div className="card" style={{ overflow: "hidden" }} aria-hidden>
      <div className="skeleton" style={{ aspectRatio: "1 / 1", borderRadius: 0 }} />
      <div style={{ padding: 16, display: "grid", gap: 10 }}>
        <div className="skeleton" style={{ height: 14, width: "70%" }} />
        <div className="skeleton" style={{ height: 12, width: "45%" }} />
        <div className="skeleton" style={{ height: 16, width: "30%" }} />
      </div>
    </div>
  );
}
export function GridSkeleton({ n = 8 }: { n?: number }) {
  return (
    <div className="grid grid-p4" role="status" aria-label="Loading products">
      {Array.from({ length: n }).map((_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  );
}

export function EmptyState({ title, body, action }: {
  title: string; body: string; action?: { label: string; to?: string; onClick?: () => void };
}) {
  return (
    <div className="stack" style={{ alignItems: "center", textAlign: "center", padding: "var(--sp-8) var(--sp-4)" }}>
      <span style={{ color: "var(--ka-faint)" }}><IconSearch size={34} /></span>
      <h3 style={{ marginBottom: 4 }}>{title}</h3>
      <p className="text-muted" style={{ maxWidth: "46ch", margin: 0 }}>{body}</p>
      {action && (
        action.to ? (
          <Link className="btn btn--primary" to={action.to}>{action.label} <IconArrowRight size={16} /></Link>
        ) : (
          <button className="btn btn--primary" onClick={action.onClick}>{action.label}</button>
        )
      )}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="stack" style={{ alignItems: "center", textAlign: "center", padding: "var(--sp-7) var(--sp-4)" }} role="alert">
      <span style={{ color: "var(--ka-error)" }}><IconAlert size={30} /></span>
      <h3 style={{ marginBottom: 4 }}>Something went wrong</h3>
      <p className="text-muted" style={{ maxWidth: "46ch", margin: 0 }}>{message}</p>
      {onRetry && <button className="btn btn--outline" onClick={onRetry}><IconArrowRight size={15} style={{ transform: "rotate(180deg)" }} /> Try again</button>}
    </div>
  );
}

// ---------------------------------------------------------------- Favorite button
export function FavoriteButton({ productId, floating = false }: { productId: string; floating?: boolean }) {
  const { favorites, toggleFavorite, toast } = useApp();
  const active = favorites.includes(productId);
  return (
    <button
      className="btn btn--sm"
      aria-pressed={active}
      aria-label={active ? "Remove from favourites" : "Save to favourites"}
      onClick={(e) => {
        e.preventDefault(); e.stopPropagation();
        toggleFavorite(productId);
        toast("success", active ? "Removed from favourites" : "Saved to favourites");
      }}
      style={floating ? {
        position: "absolute", top: 10, right: 10, width: 38, height: 38, padding: 0,
        borderRadius: "50%", background: "rgba(255,255,255,0.92)", border: "1px solid var(--ka-line)",
        color: active ? "var(--ka-clay)" : "var(--ka-muted)", boxShadow: "var(--sh-sm)",
      } : { borderColor: active ? "var(--ka-clay)" : "var(--ka-line-strong)", color: active ? "var(--ka-clay)" : undefined }}
    >
      <IconHeart size={17} fill={active ? "currentColor" : "none"} />
    </button>
  );
}

// ---------------------------------------------------------------- Product card
export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="card ka-product-card" style={{ position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <Link to={`/product/${product.slug}`} aria-label={product.name} style={{ textDecoration: "none", color: "inherit" }}>
        <div style={{ aspectRatio: "1/1", overflow: "hidden", background: "var(--ka-stone)" }}>
          <img src={product.images[0]} alt={`${product.name} — handmade by KALART artisan`}
            width={600} height={600} loading="lazy" decoding="async"
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform var(--t-med)" }} />
        </div>
      </Link>
      <FavoriteButton productId={product.id} floating />
      {product.tags.includes("bestseller") && (
        <span className="badge badge--clay" style={{ position: "absolute", top: 10, left: 10 }}>Bestseller</span>
      )}
      <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        <Link to={`/product/${product.slug}`} style={{ textDecoration: "none" }}>
          <h3 style={{ fontSize: "1.02rem", margin: 0, lineHeight: 1.3 }}>{product.name}</h3>
        </Link>
        <Rating value={product.rating} count={product.reviewCount} />
        <p className="text-small text-muted" style={{ margin: 0 }}>{product.materials}</p>
        <div style={{ marginTop: "auto", paddingTop: 8 }} className="row row--between">
          <Price value={product.price} compareAt={product.compareAt} size="sm" />
          {product.customizable && <span className="badge badge--indigo"><IconCheck size={12} /> Customisable</span>}
        </div>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------- Artisan card
export function ArtisanCard({ artisan }: { artisan: Artisan }) {
  return (
    <article className="card" style={{ overflow: "hidden" }}>
      <Link to={`/artisan/${artisan.id}`} style={{ textDecoration: "none", color: "inherit" }}>
        <div style={{ aspectRatio: "4/3", overflow: "hidden", background: "var(--ka-stone)" }}>
          <img src={artisan.image} alt={`Portrait of ${artisan.name}, ${artisan.craft.toLowerCase()} in ${artisan.location}`}
            width={800} height={600} loading="lazy" decoding="async"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 28%" }} />
        </div>
        <div style={{ padding: "14px 16px 16px" }}>
          <div className="row row--between" style={{ gap: 8 }}>
            <h3 style={{ fontSize: "1.05rem", margin: 0 }}>{artisan.name}</h3>
            {artisan.verified && <span className="badge badge--success"><IconShieldMini /> Verified</span>}
          </div>
          <p className="text-small text-muted" style={{ margin: "4px 0 8px" }}>
            {artisan.craft} · {artisan.location}
          </p>
          <Rating value={artisan.rating} count={artisan.reviews} />
        </div>
      </Link>
    </article>
  );
}
function IconShieldMini() { return <IconCheck size={12} />; }

// ---------------------------------------------------------------- Category tile
export function CategoryTile({ slug, name, image, blurb }: { slug: string; name: string; image: string; blurb: string }) {
  return (
    <Link to={`/shop?category=${slug}`} className="ka-cat-tile" style={{ textDecoration: "none", color: "inherit" }}>
      <span style={{ display: "block", borderRadius: "50%", overflow: "hidden", aspectRatio: "1/1", border: "1px solid var(--ka-line)", background: "var(--ka-stone)" }}>
        <img src={image} alt="" width={240} height={240} loading="lazy" decoding="async"
          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </span>
      <span style={{ display: "block", marginTop: 12, fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--ka-charcoal)", fontSize: "0.98rem" }}>{name}</span>
      <span className="text-small text-muted" style={{ display: "block" }}>{blurb}</span>
    </Link>
  );
}

// ---------------------------------------------------------------- Gallery
export function Gallery({ images, name }: { images: string[]; name: string }) {
  const [i, setI] = useState(0);
  const prev = () => setI((v) => (v - 1 + images.length) % images.length);
  const next = () => setI((v) => (v + 1) % images.length);
  return (
    <div>
      <div style={{ position: "relative", aspectRatio: "1/1", borderRadius: "var(--r-lg)", overflow: "hidden", background: "var(--ka-stone)", border: "1px solid var(--ka-line)" }}>
        <img key={i} src={images[i]} alt={`${name} — view ${i + 1} of ${images.length}`}
          width={900} height={900} fetchpriority={i === 0 ? "high" : undefined} decoding="async"
          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        {images.length > 1 && (
          <>
            <GalleryNav label="Previous image" onClick={prev} side="left" />
            <GalleryNav label="Next image" onClick={next} side="right" />
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="row" style={{ marginTop: 12, gap: 10 }}>
          {images.map((src, idx) => (
            <button key={src} onClick={() => setI(idx)} aria-label={`Show image ${idx + 1}`}
              aria-current={idx === i}
              style={{
                width: 64, height: 64, padding: 0, borderRadius: "var(--r-md)", overflow: "hidden",
                border: idx === i ? "2px solid var(--ka-indigo)" : "1px solid var(--ka-line)",
                background: "none",
              }}>
              <img src={src} alt="" width={64} height={64} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
function GalleryNav({ label, onClick, side }: { label: string; onClick: () => void; side: "left" | "right" }) {
  return (
    <button onClick={onClick} aria-label={label}
      style={{
        position: "absolute", top: "50%", transform: "translateY(-50%)", [side]: 10,
        width: 40, height: 40, borderRadius: "50%", border: "1px solid var(--ka-line)",
        background: "rgba(255,255,255,0.9)", color: "var(--ka-charcoal)", display: "grid", placeItems: "center",
      }}>
      {side === "left" ? <IconArrowRight size={16} style={{ transform: "rotate(180deg)" }} /> : <IconArrowRight size={16} />}
    </button>
  );
}

// ---------------------------------------------------------------- Field wrapper
export function Field({ label, htmlFor, hint, error, required, children }: {
  label: string; htmlFor: string; hint?: string; error?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="field">
      <label htmlFor={htmlFor}>
        {label}{required && <span aria-hidden style={{ color: "var(--ka-clay)" }}> *</span>}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      {hint && <span className="hint" id={htmlFor + "-hint"}>{hint}</span>}
      {children}
      {error && <span className="field-error" id={htmlFor + "-error"} role="alert"><IconAlert size={14} />{error}</span>}
    </div>
  );
}

// ---------------------------------------------------------------- Confirm dialog
export function ConfirmDialog({ openRef, title, body, confirmLabel, danger, onConfirm }: {
  openRef: React.RefObject<HTMLDialogElement | null>;
  title: string; body: string; confirmLabel: string; danger?: boolean; onConfirm: () => void;
}) {
  return (
    <dialog ref={openRef} className="ka-dialog" aria-labelledby="cd-title">
      <div className="ka-dialog__head"><h3 id="cd-title" style={{ margin: 0 }}>{title}</h3></div>
      <div className="ka-dialog__body"><p style={{ margin: 0 }} className="text-muted">{body}</p></div>
      <div className="ka-dialog__foot">
        <button className="btn btn--ghost" onClick={() => openRef.current?.close()}>Keep it</button>
        <button className={"btn " + (danger ? "btn--primary" : "btn--secondary")} style={danger ? { background: "var(--ka-error)" } : undefined}
          onClick={() => { onConfirm(); openRef.current?.close(); }}>{confirmLabel}</button>
      </div>
    </dialog>
  );
}

// ---------------------------------------------------------------- File dropzone (reference upload)
export function UploadBox({ onUploaded }: { onUploaded: (fileName: string) => void }) {
  const [name, setName] = useState<string | null>(null);
  const nav = useNavigate();
  return (
    <div className="card card--pad" style={{ borderStyle: "dashed", borderColor: "var(--ka-line-strong)", background: "var(--ka-ivory)" }}>
      <input
        id="ref-upload" type="file" accept="image/*" className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) { setName(f.name); onUploaded(f.name); }
        }}
      />
      <label htmlFor="ref-upload" className="row" style={{ gap: 12, cursor: "pointer" }}>
        <span style={{ width: 44, height: 44, borderRadius: "var(--r-md)", background: "var(--ka-indigo-soft)", color: "var(--ka-indigo)", display: "grid", placeItems: "center", flex: "none" }}>
          <IconUpload size={20} />
        </span>
        <span>
          <strong style={{ color: "var(--ka-charcoal)" }}>{name ? "Reference attached" : "Attach a reference image"}</strong>
          <span className="text-small text-muted" style={{ display: "block" }}>
            {name ?? "A sketch, swatch or photo helps the artisan match your intent."}
          </span>
        </span>
      </label>
      {name && (
        <span className="badge badge--success" style={{ marginTop: 10 }}><IconCheck size={12} /> Uploaded: {name}</span>
      )}
    </div>
  );
}
