import { ArtisanAvatar } from "../components/CraftSVG";

export interface ColorOption {
  n: string;
  h: string;
}

export interface SizeOption {
  l: string;
  add: number;
}

export interface ShowcaseProduct {
  id: string;
  svg: "vase" | "blanket" | "earrings" | "bowl" | "bag" | "candle" | string;
  name: string;
  artisanId: string;
  cat: string;
  base: number;
  rating: number;
  reviews: number;
  lead: string;
  desc: string;
  colors: ColorOption[];
  patterns: string[];
  sizes: SizeOption[];
  engrave: boolean;
}

export interface ShowcaseArtisan {
  id: string;
  name: string;
  craft: string;
  loc: string;
  verified: boolean;
  rating: number;
  sales: number;
  bio: string;
  av: ArtisanAvatar;
}

export interface DesignRequestConfig {
  colorIdx: number;
  pattern: string;
  sizeIdx: number;
  text: string;
}

export interface DesignRequest {
  id: string;
  pid: string;
  cfg: DesignRequestConfig;
  customer: string;
  date: string;
  note: string;
  approved?: boolean;
  rejected?: boolean;
}

export const SHOWCASE_ARTISANS: ShowcaseArtisan[] = [
  {
    id: "a1",
    name: "Meera Kapoor",
    craft: "Ceramics",
    loc: "Jaipur, India",
    verified: true,
    rating: 4.9,
    sales: 1240,
    bio: "Third-generation potter working with local terracotta clay and ash glazes.",
    av: { bg: "#F3DFC9", skin: "#C68863", hair: "#2B1B12", shirt: "#7C8A6E", style: "bun" },
  },
  {
    id: "a2",
    name: "Tomás Rivera",
    craft: "Textiles",
    loc: "Oaxaca, Mexico",
    verified: true,
    rating: 4.8,
    sales: 860,
    bio: "Backstrap-loom weaver using natural indigo and cochineal dyes.",
    av: { bg: "#E3E7EE", skin: "#B57B52", hair: "#1F1611", shirt: "#3E4A61", style: "short" },
  },
  {
    id: "a3",
    name: "Aiko Tanaka",
    craft: "Jewelry",
    loc: "Kyoto, Japan",
    verified: true,
    rating: 5.0,
    sales: 2110,
    bio: "Metalsmith blending traditional mokumegane with modern minimal forms.",
    av: { bg: "#F6E2E0", skin: "#E8C3A0", hair: "#221A16", shirt: "#C05F3C", style: "long" },
  },
  {
    id: "a4",
    name: "Kwame Mensah",
    craft: "Woodwork",
    loc: "Accra, Ghana",
    verified: true,
    rating: 4.9,
    sales: 640,
    bio: "Carves sustainably sourced walnut and sese wood into functional sculpture.",
    av: { bg: "#E9EEDF", skin: "#7A4A2B", hair: "#14100C", shirt: "#D9A441", style: "short" },
  },
  {
    id: "a5",
    name: "Sofia Marchetti",
    craft: "Leather",
    loc: "Florence, Italy",
    verified: true,
    rating: 4.7,
    sales: 930,
    bio: "Vegetable-tanned leather goods, hand-stitched in the Tuscan tradition.",
    av: { bg: "#F0E4D2", skin: "#D9A87C", hair: "#5A3825", shirt: "#9A4A2D", style: "long" },
  },
  {
    id: "q1",
    name: "Sarah Miller",
    craft: "Leather",
    loc: "Bristol, UK",
    verified: false,
    rating: 0,
    sales: 0,
    bio: "Applicant — 8 years saddlery experience, portfolio of 24 pieces.",
    av: { bg: "#EDE6F0", skin: "#E5B993", hair: "#8A5A2B", shirt: "#6B5D8F", style: "long" },
  },
  {
    id: "q2",
    name: "Kofi Asare",
    craft: "Beadwork",
    loc: "Kumasi, Ghana",
    verified: false,
    rating: 0,
    sales: 0,
    bio: "Applicant — recycled glass bead maker, family workshop since 1988.",
    av: { bg: "#E4EEE9", skin: "#6F4526", hair: "#100C08", shirt: "#3F7A5E", style: "short" },
  },
];

export const SHOWCASE_PRODUCTS: ShowcaseProduct[] = [
  {
    id: "p1",
    svg: "vase",
    name: "Terra Organic Vase",
    artisanId: "a1",
    cat: "Ceramics",
    base: 68,
    rating: 4.9,
    reviews: 128,
    lead: "7–10 days",
    desc: "Wheel-thrown terracotta vase with a soft organic silhouette and matte ash glaze. Each piece carries subtle variations — the mark of a human hand.",
    colors: [
      { n: "Terracotta", h: "#C05F3C" },
      { n: "Sand", h: "#D8B98A" },
      { n: "Sage", h: "#7C8A6E" },
      { n: "Charcoal", h: "#4A443E" },
      { n: "Indigo", h: "#3E4A61" },
    ],
    patterns: ["none", "dots", "stripes", "waves"],
    sizes: [
      { l: "S · 18cm", add: 0 },
      { l: "M · 24cm", add: 14 },
      { l: "L · 32cm", add: 28 },
    ],
    engrave: true,
  },
  {
    id: "p2",
    svg: "blanket",
    name: "Indigo Loom Throw",
    artisanId: "a2",
    cat: "Textiles",
    base: 95,
    rating: 4.8,
    reviews: 96,
    lead: "10–14 days",
    desc: "Handwoven on a backstrap loom from naturally dyed wool. Stripes are laid in by hand, so no two throws are identical.",
    colors: [
      { n: "Indigo", h: "#3E4A61" },
      { n: "Ochre", h: "#D9A441" },
      { n: "Moss", h: "#6E7A55" },
      { n: "Rust", h: "#A9532F" },
    ],
    patterns: ["none", "stripes", "waves"],
    sizes: [
      { l: "Throw · 130×180", add: 0 },
      { l: "Large · 160×220", add: 32 },
    ],
    engrave: true,
  },
  {
    id: "p3",
    svg: "earrings",
    name: "Hammered Sun Earrings",
    artisanId: "a3",
    cat: "Jewelry",
    base: 54,
    rating: 5.0,
    reviews: 212,
    lead: "5–7 days",
    desc: "Hand-hammered discs that catch the light with every movement. Hypoallergenic hooks, featherlight wear.",
    colors: [
      { n: "Brass", h: "#C9A227" },
      { n: "Copper", h: "#B06A3B" },
      { n: "Silver", h: "#A8ADB5" },
      { n: "Rose", h: "#C98A72" },
    ],
    patterns: ["none", "dots", "waves"],
    sizes: [
      { l: "28mm", add: 0 },
      { l: "38mm", add: 8 },
    ],
    engrave: false,
  },
  {
    id: "p4",
    svg: "bowl",
    name: "Walnut Grain Bowl",
    artisanId: "a4",
    cat: "Woodwork",
    base: 76,
    rating: 4.9,
    reviews: 74,
    lead: "8–12 days",
    desc: "Carved from a single block of sustainably harvested walnut, finished with food-safe oil that deepens with age.",
    colors: [
      { n: "Walnut", h: "#6B4429" },
      { n: "Honey", h: "#B98A4E" },
      { n: "Ebony", h: "#3A2C22" },
      { n: "Ash", h: "#C8B496" },
    ],
    patterns: ["none", "waves", "stripes"],
    sizes: [
      { l: "Ø 22cm", add: 0 },
      { l: "Ø 28cm", add: 18 },
    ],
    engrave: true,
  },
  {
    id: "p5",
    svg: "bag",
    name: "Tuscan Saddle Bag",
    artisanId: "a5",
    cat: "Leather",
    base: 148,
    rating: 4.7,
    reviews: 41,
    lead: "12–16 days",
    desc: "Full-grain vegetable-tanned leather with brass hardware and unlined suede interior. Develops a rich patina over time.",
    colors: [
      { n: "Cognac", h: "#8D4E2A" },
      { n: "Black", h: "#24201E" },
      { n: "Forest", h: "#3A4F3D" },
      { n: "Natural", h: "#C7A77B" },
    ],
    patterns: ["none", "dots"],
    sizes: [
      { l: "Compact · 20cm", add: 0 },
      { l: "Classic · 26cm", add: 24 },
    ],
    engrave: true,
  },
  {
    id: "p6",
    svg: "candle",
    name: "Hearth Candle Set",
    artisanId: "a1",
    cat: "Ceramics",
    base: 42,
    rating: 4.8,
    reviews: 63,
    lead: "4–6 days",
    desc: "Two hand-poured beeswax pillars in a hand-glazed ceramic vessel, with wild lavender from the artisan's garden.",
    colors: [
      { n: "Cream", h: "#EAD9B8" },
      { n: "Clay", h: "#C05F3C" },
      { n: "Sage", h: "#7C8A6E" },
      { n: "Night", h: "#3E4A61" },
    ],
    patterns: ["none", "dots", "waves"],
    sizes: [
      { l: "Set of 2", add: 0 },
      { l: "Set of 3", add: 16 },
    ],
    engrave: true,
  },
];

export const INITIAL_DESIGN_QUEUE: DesignRequest[] = [
  {
    id: "d1",
    pid: "p2",
    cfg: { colorIdx: 2, pattern: "waves", sizeIdx: 0, text: "" },
    customer: "Léa M.",
    date: "Oct 25",
    note: "Wants waves in moss",
  },
  {
    id: "d2",
    pid: "p3",
    cfg: { colorIdx: 1, pattern: "none", sizeIdx: 1, text: "" },
    customer: "Hana K.",
    date: "Oct 24",
    note: "Gift, larger size",
  },
  {
    id: "d3",
    pid: "p6",
    cfg: { colorIdx: 3, pattern: "dots", sizeIdx: 0, text: "HOME" },
    customer: "Omar B.",
    date: "Oct 23",
    note: 'Label engraving "HOME"',
  },
];

export const INITIAL_VERIFY_QUEUE = ["q1", "q2"];

export function getArtisanById(id: string): ShowcaseArtisan | undefined {
  return SHOWCASE_ARTISANS.find((a) => a.id === id);
}

export function calcShowcasePrice(
  p: ShowcaseProduct,
  cfg: DesignRequestConfig
): number {
  let t = p.base + (p.sizes[cfg.sizeIdx]?.add || 0);
  if (cfg.pattern !== "none") t += 8;
  if (p.engrave && cfg.text.trim()) t += 5;
  return t;
}

export function cfgSummary(
  p: ShowcaseProduct,
  cfg: DesignRequestConfig
): string {
  const colorName = p.colors[cfg.colorIdx]?.n || "Standard";
  const patName =
    cfg.pattern !== "none"
      ? cfg.pattern.charAt(0).toUpperCase() + cfg.pattern.slice(1)
      : null;
  const sizeName = p.sizes[cfg.sizeIdx]?.l || "Standard";
  const engraveText = cfg.text.trim() ? `"${cfg.text.trim()}"` : null;

  return [colorName, patName, sizeName, engraveText]
    .filter(Boolean)
    .join(" · ");
}

export function isCustom(cfg: DesignRequestConfig): boolean {
  return (
    cfg.colorIdx !== 0 ||
    cfg.pattern !== "none" ||
    cfg.sizeIdx !== 0 ||
    cfg.text.trim() !== ""
  );
}
