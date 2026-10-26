# KALART Mobile Design System (DESIGN.md)

**Product:** KALART — Master Artisan Marketplace & Custom Craft Studio  
**Target Platform:** Mobile-First Web (390×844 base viewport; fluid scale to tablet/desktop)  
**Target Audience:** Discerning Indian shoppers, 4G mobile connections, one-handed thumb interaction  
**Aesthetic Stance:** Quiet luxury, tactile craft authenticity, editorial restraint  

---

## 1. Negative-First Failure Mode Analysis (Pre-Mortem)

Before crafting tokens or layouts, every failure mode common to Indian mobile commerce on mid-range Android devices was catalogued and systematically engineered out:

| Potential Failure Mode | Root Cause in Conventional Apps | KALART Architectural Safeguard |
|---|---|---|
| **1. Long Scroll Fatigue** | 8+ viewports of unending, repetitive product feeds without visual anchoring. | Hard section ceilings: each section occupies < 1 screen height (max 480px per block). Clear typographic hierarchy with Fraunces serif headings. |
| **2. Slow 4G Image Bottlenecks** | Uncompressed 800KB+ hero photos stalling layout rendering and inducing severe CLS. | **Hero has NO images** — pure typography and high-contrast CTAs. Product cards use lazy-loaded, modern WebP/AVIF formats with explicit width/height aspect-ratio containers. |
| **3. Thumb Reach Gymnastics** | Primary actions (checkout, filter, search, cart) placed in the top app bar (> 700px from bottom). | **Sticky bottom tab bar (56px)** keeps Home, Shop, Bag (with item count), and Account in the natural thumb sweep zone (bottom 1/3 of screen). Primary hero CTAs span full width. |
| **4. Low Contrast & Outdoor Glare** | Subtle greys wash out completely on budget IPS LCD displays under Indian afternoon sunlight. | High contrast ratio: Charcoal (`#2B2620`) on Ivory (`#FAF7F0`) yields **13.8:1** (far exceeding WCAG AA 4.5:1). Secondary hairlines use distinct `#E4DCCE` border. |
| **5. Network Drops & Stalling** | Blank white screens during flaky 3G/4G handoffs. | Discrete inline loading skeleton blocks with exact matching dimensions to prevent layout shifts. Offline-ready error card with immediate "Retry" button. |
| **6. Missing Empty States** | Broken card layouts or missing feedback when bags or search queries return zero items. | Fully designed semantic empty state cards with direct recovery pathways ("Browse collection"). |
| **7. Inflated Trust Claims** | Vague, unsubstantiated badges ("100% Genuine", "Best in India", "Escrow Verified") breeding skepticism. | Strictly verifiable, honest provenance: Maker name, craft cluster town, and state (e.g., "Ravi Mistry · Samalkot, AP"). |
| **8. Tap Target Clashing** | Tightly packed links (< 32px height) causing accidental mis-taps. | Universal **44×44px minimum touch target floor** across all buttons, chips, tabs, accordion summaries, and stepper controls. |
| **9. Horizontal Scroll Trapping** | Full-width carousels capturing vertical scroll gestures and preventing the user from scrolling down. | Carousel items peek 24px into the right viewport margin with CSS `overscroll-behavior-x: contain` and momentum snap padding (`scroll-padding: 16px`). |
| **10. Virtual Keyboard Layout Destruction** | Fixed bottom bars occluding inputs or bouncing when Android soft keyboard pops up. | Bottom tab bar stays in normal document layout or uses `position: sticky; bottom: 0` respecting CSS `env(safe-area-inset-bottom)`. |

---

## 2. Design Tokens

### 2.1 Color Palette
Strictly prohibited: gradients, synthetic neons, pastel washes.

| Token | Hex Value | Role | WCAG Contrast on #FAF7F0 |
|---|---|---|---|
| `--ka-bg` | `#FAF7F0` | Primary page & canvas background (warm ivory) | Baseline canvas |
| `--ka-surface` | `#FFFFFF` | Card, sheet, and elevated surface background | 1.05:1 vs canvas |
| `--ka-surface-alt` | `#F4EFE6` | Secondary container & chip fill | 1.15:1 vs canvas |
| `--ka-text-main` | `#2B2620` | Headings, primary body, active icons (deep charcoal) | **13.8:1** (AAA) |
| `--ka-text-muted` | `#635B52` | Secondary labels, timestamps, metadata | **5.4:1** (AA) |
| `--ka-terracotta` | `#A8503A` | Primary CTA, active selections, badges (Indian brick) | **4.8:1** (AA Large / AA text) |
| `--ka-terracotta-dark` | `#8C3E2B` | Hover & active pressed state for primary CTA | **6.4:1** (AAA) |
| `--ka-indigo` | `#2E3D63` | Secondary outline CTA, focus rings, artisan tags | **8.6:1** (AAA) |
| `--ka-brass` | `#B08D3E` | Hairlines, borders, subtle craft dividers only | Non-text UI border (3.1:1) |
| `--ka-line` | `#E4DCCE` | Subtle structural borders and card outlines | UI component boundary |
| `--ka-error` | `#A83A3A` | Form validation errors and alert states | **6.1:1** (AA) |
| `--ka-success` | `#2D6A4F` | Order confirmation, in-stock pills, free shipping | **6.2:1** (AA) |

### 2.2 Typography Scale
- **Headings Font:** `Fraunces, Georgia, serif` (Optical size 144, warm serif with high legibility)
- **Body & UI Font:** `Plus Jakarta Sans, system-ui, -apple-system, sans-serif`
- **Minimum Body Size:** 16px (prevents automatic iOS/Android zoom on input focus)
- **Absolute Floor:** 12px (strictly reserved for uppercase micro-badges and tabular timestamps)

```css
--font-serif: "Fraunces", Georgia, serif;
--font-sans: "Plus Jakarta Sans", system-ui, -apple-system, sans-serif;

/* Typographic Scale */
--text-display: clamp(2rem, 1.8rem + 1.6vw, 2.4rem); /* 32px - 38px / 1.15 */
--text-h1: 1.625rem;                                /* 26px / 1.25 */
--text-h2: 1.375rem;                                /* 22px / 1.3 */
--text-h3: 1.125rem;                                /* 18px / 1.35 */
--text-body-lg: 1rem;                               /* 16px / 1.5 (Standard Body) */
--text-body-sm: 0.875rem;                           /* 14px / 1.45 */
--text-caption: 0.8125rem;                          /* 13px / 1.4 */
--text-micro: 0.75rem;                              /* 12px / 1.3 (Absolute Floor) */
```

### 2.3 Spacing Scale
Strict mathematical cadence based on 4px base unit:
- `4px` (`--sp-1`): micro gaps, icon-to-text spacing
- `8px` (`--sp-2`): tight component padding, chip gaps
- `12px` (`--sp-3`): grid gap, input inner padding
- `16px` (`--sp-4`): container edge gutters, card inner padding
- `24px` (`--sp-5`): stack spacing between sub-components
- `32px` (`--sp-6`): section vertical padding
- `48px` (`--sp-7`): major landmark spacing

### 2.4 Corner Radii
- `--r-button`: `8px` (tactile, sturdy, non-pill)
- `--r-card`: `14px` (refined handheld comfort, soft edges without cartoonishness)
- `--r-sheet`: `18px 18px 0 0` (top corners of bottom sheet)

---

## 3. Component States & Specifications

### 3.1 Buttons
- **Touch Target:** Height 48px, minimum width 48px.
- **States:**
  - *Default (Primary):* Background `#A8503A`, text `#FFFFFF`, border none, radius 8px, font-weight 600.
  - *Default (Secondary):* Background `transparent`, border `1.5px solid #2E3D63`, text `#2E3D63`, radius 8px, font-weight 600.
  - *Loading:* Text replaced by centered 18px CSS spinner; button disabled, width preserved.
  - *Disabled:* Background `#E4DCCE`, text `#8A8177`, cursor not-allowed, `aria-disabled="true"`.
  - *Active / Pressed:* Scale `0.98`, background `#8C3E2B`.
  - *Focus-Visible:* 2px solid `#2E3D63` with 2px offset.

### 3.2 Craft Filter Chips
- **Touch Target:** Height 44px, padding 0 16px.
- **States:**
  - *Default:* Background `#FAF7F0`, border `1px solid #E4DCCE`, text `#2B2620`, radius 8px.
  - *Selected:* Background `#2E3D63`, border `1px solid #2E3D63`, text `#FFFFFF`, font-weight 600.
  - *Loading:* Skeleton rectangle `80×36px` with subtle pulse.
  - *Disabled:* Opacity 0.4.

### 3.3 2-Up Product Card
- **Layout:** 2-column grid (`calc(50% - 6px)`), card radius 14px, white background, border `1px solid #E4DCCE`.
- **Image:** 1:1 square aspect ratio (`aspect-ratio: 1/1`), `object-fit: cover`, lazy-loaded, border-radius `13px 13px 0 0`.
- **States:**
  - *Default:* Renders image, craft title (15px), artisan origin (13px muted), price in ₹ (bold 15px tabular nums), rating (e.g. 4.9 ★).
  - *Loading:* 1:1 image skeleton box + 2 lines of text skeletons.
  - *Empty:* Centered fallback placeholder with text `"Craft piece archived"`.
  - *Out of Stock:* Translucent overlay with badge `"Workshop slots filled"`.

### 3.4 Artisan Profile Card (Horizontal Carousel)
- **Dimensions:** Width 240px, padding 14px, radius 14px, background `#FFFFFF`, border `1px solid #E4DCCE`.
- **States:**
  - *Default:* Artisan portrait (56×56px circle), full name, craft specialty, village/town and state, years practising.
  - *Loading:* Circular skeleton + 2 text lines.

### 3.5 Rating Component
- **Markup:** `<span class="ka-rating" aria-label="Rated 4.9 out of 5 stars from 182 reviews">`
- **Visual:** Solid terracotta star icon (14px) + `"4.9"` (bold 13px) + `"(182)"` (muted 13px).

### 3.6 Price Component
- **Markup:** `<span class="ka-price"><span class="currency">₹</span><span class="value">4,200</span></span>`
- **Features:** Strict Indian Rupee formatting (`Intl.NumberFormat('en-IN')`), tabular numbers.

### 3.7 Form Input Field
- **Touch Target:** Height 48px, padding 0 14px, font size 16px (no iOS auto-zoom).
- **States:**
  - *Default:* Border `1px solid #E4DCCE`, background `#FFFFFF`.
  - *Focus:* Border `2px solid #2E3D63`, outline none.
  - *Error:* Border `1.5px solid #A83A3A`, error message linked via `aria-describedby`.
  - *Disabled:* Background `#F4EFE6`, text `#8A8177`.

### 3.8 Sticky Bottom Tab Bar
- **Dimensions:** Height 56px + `env(safe-area-inset-bottom)`, background `#FAF7F0`, border-top `1px solid #E4DCCE`.
- **Items:** 4 tabs equally spaced: `Home`, `Shop`, `Bag`, `Account`.
- **Touch Targets:** 44×48px per tab button.
- **States:**
  - *Default:* Text 12px, icon 20px, color `#635B52`.
  - *Active:* Color `#A8503A`, font-weight 700, 2px top indicator.
  - *Bag with Items:* Red circular badge (16×16px) displaying item count.

### 3.9 Bottom Sheet
- **Placement:** Anchored to bottom, maximum height `85dvh`, radius `18px 18px 0 0`, background `#FFFFFF`.
- **Backdrop:** Semi-transparent scrim (`rgba(43, 38, 32, 0.6)`), tap to dismiss.
- **Header:** Tactile drag handle (`36×4px` rounded bar), title, accessible close button (44×44px).

### 3.10 Toast Notification
- **Placement:** Floating pill positioned at `bottom: calc(56px + env(safe-area-inset-bottom) + 16px)`.
- **Style:** Background `#2B2620`, text `#FAF7F0`, padding `10px 18px`, radius 8px, font size 14px.
- **Accessibility:** `role="status"`, `aria-live="polite"`.

---

## 4. Forbidden Elements
The following patterns are **strictly prohibited** across all templates and stylesheets:
- ❌ **No Gradients:** Flat, tactile surface colors only.
- ❌ **No Emojis:** Zero pictograms in navigational bars, buttons, toasts, or banners.
- ❌ **No Decorative Background Photos:** Backgrounds remain solid `#FAF7F0` or `#FFFFFF`.
- ❌ **No Floating Chips:** No elements with unanchored negative margins or floating chips over photos.
- ❌ **No Looping Animations:** No infinite spinners, scanlines, floating cards, or marquee bars.
- ❌ **No Alternating Colored Bands:** No jarring zebra-striped sections (e.g., green-to-beige bands).
- ❌ **No Repeated Trust Claims:** Honest, singular statements only.

---
