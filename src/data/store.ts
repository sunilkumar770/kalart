/**
 * KALART data layer.
 *
 * This module is the single source of truth for app data in this build.
 * It ships clearly-identified SEED DATA (development/demo stand-in for the
 * future REST API) and exposes an async, promise-based store API so pages
 * never touch localStorage directly and can later be swapped to real HTTP
 * calls without touching UI code.
 */

// ---------------------------------------------------------------- types
export type Role = "customer" | "artisan" | "admin";

export interface Category {
  slug: string;
  name: string;
  blurb: string;
  image: string;
}

export interface Artisan {
  id: string;
  name: string;
  craft: string;
  location: string;
  since: number;
  rating: number;
  reviews: number;
  verified: boolean;
  story: string;
  image: string;
  specialties: string[];
}

export type CustomizationKind = "text" | "color" | "size" | "motif" | "material";

export interface CustomizationOption {
  kind: CustomizationKind;
  label: string;
  choices?: string[];
  freeText?: boolean;
  maxLength?: number;
  priceDelta?: number; // flat INR add-on
  note?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  artisanId: string;
  price: number;
  compareAt?: number;
  images: string[];
  description: string;
  materials: string;
  dimensions: string;
  care: string;
  leadTimeDays: [number, number];
  stock: number;
  customizable: boolean;
  customization: CustomizationOption[];
  tags: string[];
  rating: number;
  reviewCount: number;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  date: string;
  body: string;
}

export interface User {
  email: string;
  name: string;
  role: Role;
  artisanId?: string;
}

export interface CartLine {
  productId: string;
  qty: number;
  options: Record<string, string>;
  unitPrice: number;
}

export type OrderStatus =
  | "placed"
  | "customization_review"
  | "in_production"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderEvent {
  status: OrderStatus;
  date: string;
  note: string;
}

export interface Order {
  id: string;
  userEmail: string;
  lines: CartLine[];
  total: number;
  status: OrderStatus;
  placedAt: string;
  eta: string;
  address: string;
  timeline: OrderEvent[];
  customNote?: string;
}

export type RequestStatus = "new" | "feasibility_ok" | "revision_requested" | "approved" | "declined";

export interface DesignRequest {
  id: string;
  orderRef: string;
  product: string;
  customer: string;
  artisanId: string;
  summary: string;
  options: Record<string, string>;
  uploadedRef?: string;
  status: RequestStatus;
  receivedAt: string;
  feasibilityNote?: string;
}

export type PreviewState =
  | "idle"
  | "generating"
  | "ready"
  | "failed"
  | "in_review"
  | "revision"
  | "approved";

// ---------------------------------------------------------------- seed data
export const CATEGORIES: Category[] = [
  { slug: "textiles", name: "Handloom Textiles", blurb: "Ikat, kora cotton and natural-dye weaves from family looms.", image: "/img/cat-textiles.jpg" },
  { slug: "block-print", name: "Block Print", blurb: "Hand-carved teak stamps, layered dye by dye.", image: "/img/cat-block-print.jpg" },
  { slug: "pottery", name: "Pottery & Terracotta", blurb: "Wheel-thrown, wood-fired, glazed with mineral colour.", image: "/img/cat-pottery.jpg" },
  { slug: "jewelry", name: "Handmade Jewellery", blurb: "Filigree, beads and lost-wax casting by master karigars.", image: "/img/cat-jewelry.jpg" },
  { slug: "footwear", name: "Leather & Jutti", blurb: "Vegetable-tanned hides, hand-stitched in Agra and Jaipur.", image: "/img/cat-footwear.jpg" },
  { slug: "home-decor", name: "Home Décor", blurb: "Carved wood, brass and wall art for considered interiors.", image: "/img/cat-home-decor.jpg" },
  { slug: "paintings", name: "Folk Paintings", blurb: "Pashua, madhubani and mural traditions on natural canvas.", image: "/img/cat-paintings.jpg" },
  { slug: "toys", name: "Wooden Toys", blurb: "Lac-turned Channapatna toys, non-toxic vegetable dyes.", image: "/img/cat-toys.jpg" },
  { slug: "baskets", name: "Baskets & Storage", blurb: "Sustainably harvested cane, palm and bamboo.", image: "/img/cat-baskets.jpg" },
  { slug: "lamps", name: "Brass Lamps & Lighting", blurb: "Temple lamps and pendant work, sand-cast and hand-polished.", image: "/img/cat-lamps.jpg" },
];

export const ARTISANS: Artisan[] = [
  { id: "a-ravi", name: "Ravi Mistry", craft: "Ikat Weaver", location: "Samalkot, Andhra Pradesh", since: 1994, rating: 4.9, reviews: 212, verified: true, image: "/img/artisan-ravi.jpg", specialties: ["Pochampally ikat", "Kora cotton", "Natural dyes"], story: "Third-generation ikat weaver. Ravi ties every warp thread by hand before dyeing — the reason each shawl carries its own slight, human irregularity." },
  { id: "a-meera", name: "Meera Joshi", craft: "Pashua Artist", location: "Raghurajpur, Odisha", since: 2003, rating: 4.8, reviews: 146, verified: true, image: "/img/artisan-meera.jpg", specialties: ["Pattachitra", "Natural pigments", "Folk narrative"], story: "Meera grinds her own colours from stone, turmeric and indigo. Her panels follow traditional iconography rules passed down in her village atelier." },
  { id: "a-arjun", name: "Arjun Prajapati", craft: "Terracotta Potter", location: "Jaipur, Rajasthan", since: 1998, rating: 4.9, reviews: 178, verified: true, image: "/img/artisan-arjun.jpg", specialties: ["Wheel throwing", "Wood firing", "Mineral glaze"], story: "Learned at his father's wheel in Jaipur's pottery quarter. Arjun signs and dates the foot of every vessel that leaves the kiln." },
  { id: "a-lakshmi", name: "Lakshmi Devi", craft: "Block Printer", location: "Bagru, Rajasthan", since: 2000, rating: 4.7, reviews: 203, verified: true, image: "/img/artisan-lakshmi.jpg", specialties: ["Reactive dyes", "Madder red", "Hand carving"], story: "Lakshmi carves her own teak blocks and prints on tables padded with her own wool blankets — twelve passes for a full bed set." },
  { id: "a-farhan", name: "Farhan Ansari", craft: "Metal Jeweller", location: "Varanasi, Uttar Pradesh", since: 1996, rating: 4.8, reviews: 121, verified: true, image: "/img/artisan-farhan.jpg", specialties: ["Filigree (tarakashi)", "Kundan setting", "Silver"], story: "Farhan draws silver wire finer than sewing thread and bends it into filigree lace without solder visible to the eye." },
  { id: "a-divya", name: "Divya Reddy", craft: "Textile Designer", location: "Pochampally, Telangana", since: 2008, rating: 4.7, reviews: 96, verified: true, image: "/img/artisan-divya.jpg", specialties: ["Contemporary ikat", "Colour study", "Home textiles"], story: "Trained in NIFT Hyderabad, Divya returns to her hometown looms to translate ikat geometry for contemporary interiors." },
  { id: "a-shankar", name: "Shankar Naik", craft: "Toy Turner", location: "Channapatna, Karnataka", since: 1990, rating: 4.9, reviews: 264, verified: true, image: "/img/artisan-shankar.jpg", specialties: ["Lac turning", "Ivory wood", "Vegetable dye"], story: "Shankar's toys are turned on a hand-pulled lathe and coloured only with vegetable dyes certified safe for children." },
  { id: "a-zoya", name: "Zoya Bhat", craft: "Embroiderer", location: "Kutch, Gujarat", since: 2005, rating: 4.8, reviews: 88, verified: false, image: "/img/artisan-zoya.jpg", specialties: ["Kutchi embroidery", "Mirror work", "Wool"], story: "Zoya leads a self-help group of 24 women embroiderers; every bag and cushion carries a region-specific stitch pattern." },
];

const baseCustom: CustomizationOption[] = [];

export const PRODUCTS: Product[] = [
  {
    id: "p-ikat-shawl", slug: "pochampally-ikat-shawl", name: "Pochampally Ikat Shawl",
    categorySlug: "textiles", artisanId: "a-ravi", price: 4200, compareAt: 4900,
    images: ["/img/p-ikat-shawl.jpg", "/img/cat-textiles.jpg", "/img/story-workshop.jpg"],
    description: "A feathered-edge ikat shawl in kora cotton. The warp is tie-dyed before weaving, so the geometry blurs softly — a signature no print can imitate.",
    materials: "100% kora cotton, natural alum-mordant dyes", dimensions: "210 × 110 cm · 480 g",
    care: "Dry clean first wash; thereafter gentle hand wash in cold water.",
    leadTimeDays: [7, 10], stock: 6, customizable: true,
    customization: [
      { kind: "color", label: "Colourway", choices: ["Indigo night", "Terracotta earth", "Charcoal stone"], priceDelta: 0 },
      { kind: "size", label: "Size", choices: ["Standard 210×110", "Long 230×110 (+₹400)"], priceDelta: 400 },
      { kind: "text", label: "Woven initials (optional)", freeText: true, maxLength: 3, note: "Up to 3 letters woven into the border pallu.", priceDelta: 350 },
    ],
    tags: ["bestseller", "handloom", "gift"], rating: 4.9, reviewCount: 84,
  },
  {
    id: "p-durable-mat", slug: "durable-handwoven-floor-mat", name: "Durable Handwoven Floor Mat",
    categorySlug: "textiles", artisanId: "a-divya", price: 2600,
    images: ["/img/p-durable-mat.jpg", "/img/story-bedding.jpg"],
    description: "Tightly packed cotton floor weave that shrugs off daily use. Reversible, with a chevron selvedge.",
    materials: "Recycled cotton + jute warp", dimensions: "180 × 90 cm",
    care: "Machine wash cold, line dry.", leadTimeDays: [5, 8], stock: 14, customizable: true,
    customization: [
      { kind: "color", label: "Palette", choices: ["Forest", "Stone grey", "Clay"], priceDelta: 0 },
      { kind: "size", label: "Size", choices: ["180×90", "240×90 (+₹700)", "Round 120 dia (+₹500)"] },
    ],
    tags: ["home"], rating: 4.6, reviewCount: 31,
  },
  {
    id: "p-soft-throw", slug: "soft-throw-blanket", name: "Soft Throw Blanket",
    categorySlug: "textiles", artisanId: "a-ravi", price: 3400,
    images: ["/img/p-soft-throw.jpg", "/img/story-bedding.jpg"],
    description: "Brushed-megh cotton throw with a chevron band woven in three tonal shades of madder.",
    materials: "Megh cotton, madder root dye", dimensions: "230 × 130 cm · 700 g",
    care: "Hand wash separately in cold water.", leadTimeDays: [8, 12], stock: 4, customizable: false,
    customization: baseCustom, tags: ["cozy"], rating: 4.8, reviewCount: 57,
  },
  {
    id: "p-table-runner", slug: "bagru-block-print-runner", name: "Bagru Block-Print Table Runner",
    categorySlug: "block-print", artisanId: "a-lakshmi", price: 1250,
    images: ["/img/p-table-runner.jpg", "/img/story-table.jpg", "/img/p-placemats.jpg"],
    description: "Six sequential block passes in rust and indigo on unbleached mulmul. The slight ink variation is the fingerprint of the hand.",
    materials: "Unbleached mulmul cotton, reactive dyes", dimensions: "180 × 38 cm",
    care: "Machine wash cold, shade dry, warm iron.", leadTimeDays: [4, 7], stock: 20, customizable: true,
    customization: [
      { kind: "motif", label: "Border motif", choices: ["Paisley vine", "Floral lattice", "Geometric dots"] },
      { kind: "text", label: "Monogram stencil", freeText: true, maxLength: 2, note: "Two initials block-printed on one corner.", priceDelta: 200 },
    ],
    tags: ["bestseller", "tableware"], rating: 4.7, reviewCount: 66,
  },
  {
    id: "p-bed-sheet", slug: "handblock-bed-set", name: "Handblock Cotton Bed Set",
    categorySlug: "block-print", artisanId: "a-lakshmi", price: 3950, compareAt: 4600,
    images: ["/img/p-bed-sheet.jpg", "/img/story-bedding.jpg"],
    description: "Double bedsheet with two pillow covers, printed in ochre marigold on ivory. Breathable 144 TC cotton.",
    materials: "144 TC cotton, AZO-free dyes", dimensions: "King 228 × 244 cm + 2 covers",
    care: "First wash alone in salt water; machine wash cold thereafter.", leadTimeDays: [6, 9], stock: 9, customizable: true,
    customization: [
      { kind: "color", label: "Colourway", choices: ["Marigold ochre", "Indigo bloom", "Rose madder"] },
      { kind: "size", label: "Bed size", choices: ["Queen", "King (+₹350)"] },
    ],
    tags: ["bedroom", "value"], rating: 4.6, reviewCount: 48,
  },
  {
    id: "p-kurta-fabric", slug: "indigo-block-print-fabric", name: "Indigo Block-Print Fabric (per metre)",
    categorySlug: "block-print", artisanId: "a-lakshmi", price: 640,
    images: ["/img/p-kurta-fabric.jpg", "/img/story-print.jpg"],
    description: "Bottle-green ground with fine indigo jaali print, sold per running metre — cut to your length for kurta or lining projects.",
    materials: "Cotton poplin, natural indigo dip", dimensions: "110 cm width, sold per metre",
    care: "Pre-washed; machine wash cold.", leadTimeDays: [3, 5], stock: 60, customizable: true,
    customization: [{ kind: "size", label: "Cut length", choices: ["2.5 m", "3 m (+₹320)", "4 m (+₹960)"] }],
    tags: ["by-the-metre"], rating: 4.8, reviewCount: 22,
  },
  {
    id: "p-cushion-set", slug: "cushion-cover-set-of-4", name: "Cushion Cover Set of 4",
    categorySlug: "block-print", artisanId: "a-zoya", price: 1800,
    images: ["/img/p-cushion-set.jpg", "/img/story-decor.jpg"],
    description: "Four printed-and-embroidered covers with hidden zips; Kutch mirror-work on two, Bagru print on two.",
    materials: "Cotton canvas, acrylic mirrors", dimensions: "40 × 40 cm",
    care: "Spot clean / gentle hand wash.", leadTimeDays: [7, 10], stock: 12, customizable: true,
    customization: [{ kind: "color", label: "Mix", choices: ["Rust + cream", "Indigo + ecru", "Mixed festive"] }],
    tags: ["gift", "set"], rating: 4.5, reviewCount: 39,
  },
  {
    id: "p-curtain-pair", slug: "handwoven-curtain-pair", name: "Handwoven Curtain Pair",
    categorySlug: "textiles", artisanId: "a-divya", price: 5400,
    images: ["/img/p-curtain-pair.jpg", "/img/story-bedding.jpg"],
    description: "Light-filtering ikat-check curtains, sold as a pair with a brass-eye header.",
    materials: "Cotton-silk blend", dimensions: "2 × 240 × 130 cm",
    care: "Dry clean recommended.", leadTimeDays: [12, 16], stock: 5, customizable: true,
    customization: [
      { kind: "color", label: "Colourway", choices: ["Storm blue", "Warm sand"] },
      { kind: "size", label: "Drop length", choices: ["210 cm", "240 cm", "270 cm (+₹600)"] },
    ],
    tags: ["window"], rating: 4.7, reviewCount: 17,
  },
  {
    id: "p-vase", slug: "jaipur-terracotta-vase", name: "Jaipur Terracotta Vase",
    categorySlug: "pottery", artisanId: "a-arjun", price: 1650,
    images: ["/img/p-vase.jpg", "/img/cat-pottery.jpg"],
    description: "Wheel-thrown amphora with sgraffito bands, low-fired and sealed inside for fresh flowers.",
    materials: "Red clay, food-safe interior seal", dimensions: "H 32 cm · Ø 18 cm",
    care: "Wipe with damp cloth; avoid freezing water inside.", leadTimeDays: [5, 8], stock: 10, customizable: true,
    customization: [
      { kind: "color", label: "Glaze band", choices: ["Natural terracotta", "Ivory slip", "Deep indigo"] },
      { kind: "text", label: "Signed inscription", freeText: true, maxLength: 18, note: "Short text incised near the foot.", priceDelta: 250 },
    ],
    tags: ["bestseller"], rating: 4.9, reviewCount: 54,
  },
  {
    id: "p-water-jug", slug: "glazed-terracotta-water-jug", name: "Glazed Terracotta Water Jug",
    categorySlug: "pottery", artisanId: "a-arjun", price: 1150,
    images: ["/img/p-water-jug.jpg"],
    description: "Cool-clay jug (matka lineage) with a drip-cut lip; naturally chills water through evaporation.",
    materials: "Porous red clay, unglazed exterior", dimensions: "1.5 L · H 24 cm",
    care: "Soak new clay in water 4 h before first use.", leadTimeDays: [4, 6], stock: 16, customizable: false,
    customization: baseCustom, tags: ["kitchen"], rating: 4.6, reviewCount: 41,
  },
  {
    id: "p-tea-set", slug: "clay-tea-set", name: "Hand-thrown Clay Tea Set",
    categorySlug: "pottery", artisanId: "a-arjun", price: 2450, compareAt: 2800,
    images: ["/img/p-tea-set.jpg", "/img/story-table.jpg"],
    description: "Teapot plus four cups in burgundy slip. Each cup is thrown individually — no two sit perfectly alike.",
    materials: "Stoneware clay, matte slip", dimensions: "Pot 800 ml · cups 90 ml",
    care: "No microwave; hand wash after seasoning.", leadTimeDays: [8, 12], stock: 7, customizable: true,
    customization: [{ kind: "color", label: "Slip colour", choices: ["Burgundy", "Ash white", "Tea green"] }],
    tags: ["ceremony", "gift"], rating: 4.8, reviewCount: 29,
  },
  {
    id: "p-necklace", slug: "filigree-gemini-necklace", name: "Filigree & Garnet Necklace",
    categorySlug: "jewelry", artisanId: "a-farhan", price: 6800,
    images: ["/img/p-necklace.jpg", "/img/cat-jewelry.jpg"],
    description: "Sterling-silver filigree lattice set with garnet cabochons, finished with a hand-drawn chain.",
    materials: "925 silver, garnet, gold-wash accent", dimensions: "42 cm + 4 cm extender",
    care: "Store dry in the pouch provided; polish with soft cloth.", leadTimeDays: [10, 14], stock: 3, customizable: true,
    customization: [
      { kind: "material", label: "Finish", choices: ["Oxidised silver", "Bright silver", "Gold wash (+₹1,200)"] },
      { kind: "text", label: "Engraved charm", freeText: true, maxLength: 10, note: "Back of centre pendant.", priceDelta: 400 },
    ],
    tags: ["heirloom"], rating: 4.9, reviewCount: 15,
  },
  {
    id: "p-jhumkas", slug: "kundan-jhumka-earrings", name: "Kundan Jhumka Earrings",
    categorySlug: "jewelry", artisanId: "a-farhan", price: 2900,
    images: ["/img/p-jhumkas.jpg"],
    description: "Classic dome jhumkas with kundan stones and pearl drops, light enough for all-day wear.",
    materials: "Brass base, kundan glass, pearls", dimensions: "5.5 cm drop · 12 g pair",
    care: "Remove before swimming; wipe after wear.", leadTimeDays: [6, 9], stock: 11, customizable: true,
    customization: [{ kind: "color", label: "Stone colour", choices: ["Ruby red", "Emerald", "Pearl white"] }],
    tags: ["festive"], rating: 4.7, reviewCount: 62,
  },
  {
    id: "p-bangles", slug: "silver-thread-bangles", name: "Silver Thread Bangles (pair)",
    categorySlug: "jewelry", artisanId: "a-farhan", price: 3600,
    images: ["/img/p-bangles.jpg"],
    description: "Twisted-thread bangles drawn from a single silver rod — deceptively light, endlessly wearable.",
    materials: "Fine silver 999", dimensions: "2–2.75 in inner dia (specify)",
    care: "Flex gently; store flat.", leadTimeDays: [7, 10], stock: 8, customizable: true,
    customization: [{ kind: "size", label: "Inner diameter", choices: ['2"', '2.25"', '2.5"', '2.75"'] }],
    tags: ["everyday"], rating: 4.8, reviewCount: 24,
  },
  {
    id: "p-jutti-pair", slug: "hand-embroidered-jutti", name: "Hand-Embroidered Jutti (pair)",
    categorySlug: "footwear", artisanId: "a-zoya", price: 2250,
    images: ["/img/p-jutti-pair.jpg", "/img/cat-footwear.jpg"],
    description: "Vegetable-tanned leather jutti with curled toe and phulkari-inspired thread work. Sole stitched, not glued.",
    materials: "Veg-tan leather, cotton thread, rubber sole pad", dimensions: "UK 4–10",
    care: "Condition leather monthly; air-dry away from heat.", leadTimeDays: [9, 13], stock: 13, customizable: true,
    customization: [
      { kind: "size", label: "Size", choices: ["UK 4", "UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10"] },
      { kind: "color", label: "Leather", choices: ["Tan", "Espresso", "Ivory"] },
      { kind: "motif", label: "Thread motif", choices: ["Traditional vine", "Modern geometric"] },
    ],
    tags: ["bestseller"], rating: 4.6, reviewCount: 73,
  },
  {
    id: "p-bag", slug: "embroidered-market-bag", name: "Embroidered Market Bag",
    categorySlug: "footwear", artisanId: "a-zoya", price: 1450,
    images: ["/img/p-bag.jpg"],
    description: "Heavy canvas tote with Kutchi diamond embroidery and a buckle flap. Fits a laptop and a week of vegetables.",
    materials: "18 oz canvas, leather strap", dimensions: "38 × 32 × 12 cm",
    care: "Spot clean; strap conditions like leather.", leadTimeDays: [5, 8], stock: 22, customizable: true,
    customization: [{ kind: "color", label: "Thread palette", choices: ["Desert", "Sea green", "Ink blue"] }],
    tags: ["carry-everything"], rating: 4.7, reviewCount: 35,
  },
  {
    id: "p-wall-piece", slug: "bandhani-wall-hanging", name: "Bandhani Wall Hanging",
    categorySlug: "home-decor", artisanId: "a-divya", price: 3100,
    images: ["/img/p-wall-piece.jpg", "/img/story-decor.jpg"],
    description: "Tied-and-dyed mandala panel on a seasoned mango-wood rod with hand-knotted tassels.",
    materials: "Silk-cotton, natural dyes, mango wood", dimensions: "90 × 110 cm panel",
    care: "Dust with dry cloth; avoid direct sun.", leadTimeDays: [8, 12], stock: 6, customizable: true,
    customization: [{ kind: "color", label: "Ground colour", choices: ["Midnight indigo", "Rust", "Sage"] }],
    tags: ["statement"], rating: 4.8, reviewCount: 19,
  },
  {
    id: "p-showpiece", slug: "carved-wood-elephant", name: "Carved Wood Elephant Showpiece",
    categorySlug: "home-decor", artisanId: "a-shankar", price: 2750,
    images: ["/img/p-showpiece.jpg"],
    description: "Hand-carved Neem wood elephant on a pedestal, burnished and wax-finished — no paint.",
    materials: "Neem wood, beeswax finish", dimensions: "H 26 cm · L 30 cm",
    care: "Re-wax yearly.", leadTimeDays: [10, 14], stock: 4, customizable: false,
    customization: baseCustom, tags: ["sculpture"], rating: 4.9, reviewCount: 12,
  },
  {
    id: "p-placemats", slug: "block-print-placemat-set", name: "Block-Print Placemat Set of 6",
    categorySlug: "block-print", artisanId: "a-lakshmi", price: 1550,
    images: ["/img/p-placemats.jpg", "/img/story-table.jpg"],
    description: "Six reversible placemats hemmed by hand; dot-rangoli print in rust on one face, plain khaki on the other.",
    materials: "Cotton twill", dimensions: "35 × 28 cm each",
    care: "Machine wash cold, tumble low.", leadTimeDays: [4, 7], stock: 18, customizable: false,
    customization: baseCustom, tags: ["set", "value"], rating: 4.5, reviewCount: 44,
  },
  {
    id: "p-diya-set", slug: "brass-diya-set", name: "Brass Diya Set of 5",
    categorySlug: "lamps", artisanId: "a-farhan", price: 1900,
    images: ["/img/p-diya-set.jpg", "/img/cat-lamps.jpg"],
    description: "Sand-cast brass diyas with lotus feet, hammered rims and a lacquer coat that keeps the shine.",
    materials: "Cast brass", dimensions: "Ø 9 cm each",
    care: "Polish with supplied cloth; indoors only.", leadTimeDays: [6, 9], stock: 15, customizable: false,
    customization: baseCustom, tags: ["festive", "gift"], rating: 4.7, reviewCount: 51,
  },
  {
    id: "p-floor-lamp", slug: "kuthu-brass-floor-lamp", name: "Kuthu Brass Floor Lamp",
    categorySlug: "lamps", artisanId: "a-farhan", price: 8900, compareAt: 9800,
    images: ["/img/p-floor-lamp.jpg"],
    description: "Tiered temple-style lamp adapted for bulbs, hand-polished with an unlacquered patina option.",
    materials: "Panchaloha brass", dimensions: "H 152 cm · base Ø 30 cm",
    care: "Dust dry; oil-metal polish twice a year.", leadTimeDays: [16, 22], stock: 2, customizable: true,
    customization: [{ kind: "material", label: "Finish", choices: ["Polished brass", "Antique patina"] }],
    tags: ["heirloom", "large"], rating: 4.9, reviewCount: 8,
  },
  {
    id: "p-lacquer-toys", slug: "channapatna-lacquer-toy-set", name: "Channapatna Lacquer Toy Set",
    categorySlug: "toys", artisanId: "a-shankar", price: 1350,
    images: ["/img/p-lacquer-toys.jpg", "/img/cat-toys.jpg"],
    description: "Seven stacking and spinning toys in vegetable dyes, BIS-certified toy-safe for ages 3+.",
    materials: "Ivory wood, vegetable lacquer", dimensions: "Mixed, gift box 30 × 22 cm",
    care: "Wipe with dry cloth.", leadTimeDays: [4, 6], stock: 25, customizable: false,
    customization: baseCustom, tags: ["kids", "safe", "gift"], rating: 4.9, reviewCount: 92,
  },
  {
    id: "p-elephant-toy", slug: "rolling-wooden-elephant", name: "Rolling Wooden Elephant",
    categorySlug: "toys", artisanId: "a-shankar", price: 850,
    images: ["/img/p-elephant-toy.jpg"],
    description: "Pull-along elephant with a swaying trunk — a Channapatna classic.",
    materials: "Thowreedu wood, vegetable dye", dimensions: "L 18 cm",
    care: "Dry wipe only.", leadTimeDays: [3, 5], stock: 30, customizable: false,
    customization: baseCustom, tags: ["kids"], rating: 4.8, reviewCount: 61,
  },
  {
    id: "p-storage-basket", slug: "cane-storage-basket", name: "Cane Storage Basket",
    categorySlug: "baskets", artisanId: "a-zoya", price: 1750,
    images: ["/img/p-storage-basket.jpg", "/img/cat-baskets.jpg"],
    description: "Coil-woven cane basket with leather-reinforced rim for linens or firewood.",
    materials: "Harvested cane, buffalo-hide trim", dimensions: "Ø 42 × H 38 cm",
    care: "Keep dry; wipe occasionally.", leadTimeDays: [7, 10], stock: 9, customizable: false,
    customization: baseCustom, tags: ["organisation"], rating: 4.6, reviewCount: 26,
  },
  {
    id: "p-market-bag", slug: "palm-leaf-tote", name: "Palm-Leaf Woven Tote",
    categorySlug: "baskets", artisanId: "a-zoya", price: 990,
    images: ["/img/p-market-bag.jpg"],
    description: "Feather-light palm-leaf weave with magnetic closure pocket. Each basket takes a full day on the frame.",
    materials: "Palm leaf, jute binding", dimensions: "36 × 30 cm",
    care: "Air out after wet use.", leadTimeDays: [5, 7], stock: 17, customizable: false,
    customization: baseCustom, tags: ["summer"], rating: 4.4, reviewCount: 18,
  },
  {
    id: "p-pashua-painting", slug: "pashua-folk-painting", name: "Pashua Folk Painting",
    categorySlug: "paintings", artisanId: "a-meera", price: 5200,
    images: ["/img/p-pashua-painting.jpg", "/img/cat-paintings.jpg"],
    description: "Sun-and-fish folk panel painted on handmade paper with mineral colours; signed and dated verso.",
    materials: "Handmade paper, mineral pigment", dimensions: "60 × 45 cm framed",
    care: "Keep out of direct sunlight; dust gently.", leadTimeDays: [14, 20], stock: 3, customizable: true,
    customization: [
      { kind: "motif", label: "Subject", choices: ["Suraya sun & fish", "Lotus pond", "Village scene"] },
      { kind: "text", label: "Dedication line", freeText: true, maxLength: 40, note: "Painted on the back plate.", priceDelta: 300 },
    ],
    tags: ["art", "one-of-a-kind"], rating: 5.0, reviewCount: 11,
  },
  {
    id: "p-mural-canvas", slug: "miniature-mural-canvas", name: "Miniature Mural Canvas",
    categorySlug: "paintings", artisanId: "a-meera", price: 3800,
    images: ["/img/p-mural-canvas.jpg", "/img/story-print.jpg"],
    description: "A miniature-scale mural composition on stretched canvas — temple-procession palette.",
    materials: "Cotton canvas, natural pigments", dimensions: "45 × 45 cm",
    care: "Hang away from humidity.", leadTimeDays: [12, 16], stock: 5, customizable: false,
    customization: baseCustom, tags: ["art"], rating: 4.7, reviewCount: 9,
  },
];

export const REVIEWS: Review[] = [
  { id: "r1", productId: "p-ikat-shawl", author: "Ananya S.", rating: 5, date: "2026-09-12", body: "The blur in the ikat is real and beautiful. Got my initials woven in — preview matched the delivered piece almost exactly." },
  { id: "r2", productId: "p-ikat-shawl", author: "Kabir M.", rating: 5, date: "2026-08-28", body: "Gift for my mother. The artisan answered questions about the dye process directly. Trustworthy experience end to end." },
  { id: "r3", productId: "p-ikat-shawl", author: "Renita D.", rating: 4, date: "2026-07-19", body: "Gorgeous colour. Took ten days but worth waiting; would have liked a tracking update earlier." },
  { id: "r4", productId: "p-table-runner", author: "Joss P.", rating: 5, date: "2026-09-02", body: "Ink variation you can feel. Monogram was subtle and tasteful." },
  { id: "r5", productId: "p-table-runner", author: "Devika R.", rating: 4, date: "2026-06-30", body: "Beautiful; needed one press after shipping. Seller sent a quick video on how to steam it." },
  { id: "r6", productId: "p-vase", author: "Marcus O.", rating: 5, date: "2026-09-21", body: "Heavier and more honest than studio ceramics. His signature on the foot sells the story." },
  { id: "r7", productId: "p-vase", author: "Ira K.", rating: 5, date: "2026-08-11", body: "Ordered with an incised inscription — arrived exactly like the approved preview." },
  { id: "r8", productId: "p-jutti-pair", author: "Sneha T.", rating: 5, date: "2026-09-05", body: "Second pair from this workshop. Breaks in within a week, stitching still perfect on the first pair." },
  { id: "r9", productId: "p-jutti-pair", author: "Peter H.", rating: 4, date: "2026-07-22", body: "Half-size up advice in the listing saved me. Embroidery is denser than photos suggest." },
  { id: "r10", productId: "p-lacquer-toys", author: "Radhika V.", rating: 5, date: "2026-09-30", body: "Colours held after months of enthusiastic toddler abuse. No chips." },
  { id: "r11", productId: "p-pashua-painting", author: "Leo F.", rating: 5, date: "2026-08-16", body: "The revision round let me ask for a slightly warmer sky. Meera explained every pigment choice." },
  { id: "r12", productId: "p-tea-set", author: "Mira B.", rating: 4, date: "2026-06-08", body: "Seasoning took trial; spout drips at full tilt but otherwise flawless." },
];

export const DEMO_ACCOUNTS: Array<User & { password: string }> = [
  { email: "priya@example.com", name: "Priya Sharma", role: "customer", password: "demo1234" },
  { email: "ravi@kalart.in", name: "Ravi Mistry", role: "artisan", artisanId: "a-ravi", password: "demo1234" },
  { email: "admin@kalart.in", name: "Platform Admin", role: "admin", password: "demo1234" },
];

const SEED_ORDERS: Order[] = [
  {
    id: "KA-2026-0417", userEmail: "priya@example.com",
    lines: [{ productId: "p-ikat-shawl", qty: 1, options: { "Colourway": "Indigo night", "Woven initials (optional)": "PS" }, unitPrice: 4550 }],
    total: 4550, status: "in_production", placedAt: "2026-10-08", eta: "2026-10-24",
    address: "Flat 12B, Sundar Apartments, Bengaluru 560038",
    timeline: [
      { status: "placed", date: "2026-10-08", note: "Order confirmed." },
      { status: "customization_review", date: "2026-10-09", note: "Preview approved by customer; artisan began dyeing the warp." },
      { status: "in_production", date: "2026-10-12", note: "On the loom. Expected completion 22 Oct." },
    ],
    customNote: "Please keep the pallu initials lower-right as in preview v2.",
  },
  {
    id: "KA-2026-0392", userEmail: "priya@example.com",
    lines: [{ productId: "p-vase", qty: 2, options: { "Glaze band": "Ivory slip" }, unitPrice: 1900 }],
    total: 3800, status: "shipped", placedAt: "2026-09-27", eta: "2026-10-06",
    address: "Flat 12B, Sundar Apartments, Bengaluru 560038",
    timeline: [
      { status: "placed", date: "2026-09-27", note: "Order confirmed." },
      { status: "in_production", date: "2026-09-29", note: "Thrown and trimmed; kiln loaded 1 Oct." },
      { status: "shipped", date: "2026-10-04", note: "Handed to BlueDart · tracking BB90213X." },
    ],
  },
  {
    id: "KA-2026-0355", userEmail: "priya@example.com",
    lines: [{ productId: "p-lacquer-toys", qty: 1, options: {}, unitPrice: 1350 }],
    total: 1350, status: "delivered", placedAt: "2026-08-19", eta: "2026-08-27",
    address: "Flat 12B, Sundar Apartments, Bengaluru 560038",
    timeline: [
      { status: "placed", date: "2026-08-19", note: "Order confirmed." },
      { status: "shipped", date: "2026-08-22", note: "Dispatched from Channapatna." },
      { status: "delivered", date: "2026-08-26", note: "Signed for by recipient." },
    ],
  },
];

const SEED_REQUESTS: DesignRequest[] = [
  {
    id: "DR-1041", orderRef: "KA-2026-0417", product: "Pochampally Ikat Shawl",
    customer: "Priya Sharma", artisanId: "a-ravi",
    summary: "Indigo-night shawl, long size, initials “PS” woven in the pallu border.",
    options: { "Colourway": "Indigo night", "Size": "Long 230×110 (+₹400)", "Woven initials (optional)": "PS" },
    status: "approved", receivedAt: "2026-10-08",
    feasibilityNote: "Initials feasible at 12 mm height; adds ~2 h to weaving.",
  },
  {
    id: "DR-1046", orderRef: "KA-2026-0428", product: "Jaipur Terracotta Vase",
    customer: "Marcus Oliveira", artisanId: "a-arjun",
    summary: "Inscription “Casa Rivera 2026” incised near the foot; ivory slip band.",
    options: { "Glaze band": "Ivory slip", "Signed inscription": "Casa Rivera 2026" },
    status: "new", receivedAt: "2026-10-20",
  },
  {
    id: "DR-1048", orderRef: "KA-2026-0431", product: "Pashua Folk Painting",
    customer: "Leo Fontaine", artisanId: "a-meera",
    summary: "Suraya sun & fish, warmer sky requested in revision round.",
    options: { "Subject": "Suraya sun & fish", "Dedication line": "For Ana — monsoon 2026" },
    uploadedRef: "reference-sky.jpg", status: "revision_requested", receivedAt: "2026-10-18",
    feasibilityNote: "Warmer sky requires cadmium-free ochre over-dip; +3 days.",
  },
];

// ---------------------------------------------------------------- persistence helpers
const LS_KEY = "kalart-store-v1";

interface PersistShape {
  cart: CartLine[];
  favorites: string[];
  orders: Order[];
  requests: DesignRequest[];
  previews: Record<string, PreviewState>;
}

const defaultState: PersistShape = {
  cart: [],
  favorites: ["p-pashua-painting"],
  orders: SEED_ORDERS,
  requests: SEED_REQUESTS,
  previews: {},
};

function load(): PersistShape {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return structuredClone(defaultState);
    return { ...structuredClone(defaultState), ...JSON.parse(raw) };
  } catch {
    return structuredClone(defaultState);
  }
}
function persist(s: PersistShape) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch { /* private mode */ }
}

let state: PersistShape = typeof window !== "undefined" ? load() : structuredClone(defaultState);
const save = () => persist(state);

// Simulated network latency so loading states are real, not decorative.
const tick = (ms = 220) => new Promise<void>((res) => setTimeout(res, ms));

// ---------------------------------------------------------------- queries
export const api = {
  // --- catalogue
  async listProducts(params?: { q?: string; category?: string; sort?: string; max?: number; min?: number; customOnly?: boolean }): Promise<Product[]> {
    await tick();
    let items = [...PRODUCTS];
    if (params?.q) {
      const q = params.q.toLowerCase();
      items = items.filter((p) =>
        [p.name, p.description, p.tags.join(" "), categoryName(p.categorySlug)].join(" ").toLowerCase().includes(q));
    }
    if (params?.category) items = items.filter((p) => p.categorySlug === params.category);
    if (params?.customOnly) items = items.filter((p) => p.customizable);
    if (params?.min != null) items = items.filter((p) => p.price >= params.min!);
    if (params?.max != null) items = items.filter((p) => p.price <= params.max!);
    switch (params?.sort) {
      case "price-asc": items.sort((a, b) => a.price - b.price); break;
      case "price-desc": items.sort((a, b) => b.price - a.price); break;
      case "rating": items.sort((a, b) => b.rating - a.rating); break;
      default: items.sort((a, b) => b.reviewCount - a.reviewCount);
    }
    return items;
  },
  async getProduct(idOrSlug: string): Promise<Product | undefined> {
    await tick(120);
    return PRODUCTS.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
  },
  async getArtisan(id: string): Promise<Artisan | undefined> {
    await tick(120);
    return ARTISANS.find((a) => a.id === id);
  },
  async listArtisans(): Promise<Artisan[]> { await tick(); return [...ARTISANS]; },
  async reviewsFor(productId: string): Promise<Review[]> {
    await tick(120);
    return REVIEWS.filter((r) => r.productId === productId);
  },

  // --- auth (demo)
  async login(email: string, password: string): Promise<User> {
    await tick(300);
    const acc = DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password);
    if (!acc) throw new Error("We couldn't match that email and password. Try a demo account below.");
    const { password: _pw, ...user } = acc;
    sessionStorage.setItem("kalart-session", JSON.stringify(user));
    return user;
  },
  currentUser(): User | null {
    try {
      const raw = sessionStorage.getItem("kalart-session");
      return raw ? (JSON.parse(raw) as User) : null;
    } catch { return null; }
  },
  logout() { sessionStorage.removeItem("kalart-session"); },

  // --- cart
  cart(): CartLine[] { return state.cart; },
  addToCart(line: CartLine) {
    const key = (l: CartLine) => l.productId + "|" + JSON.stringify(l.options);
    const existing = state.cart.find((l) => key(l) === key(line));
    if (existing) existing.qty += line.qty; else state.cart.push(line);
    save();
  },
  setQty(index: number, qty: number) {
    if (qty <= 0) state.cart.splice(index, 1);
    else if (state.cart[index]) state.cart[index].qty = qty;
    save();
  },
  clearCart() { state.cart = []; save(); },

  // --- favourites
  favorites(): string[] { return state.favorites; },
  toggleFavorite(id: string) {
    state.favorites = state.favorites.includes(id)
      ? state.favorites.filter((f) => f !== id)
      : [...state.favorites, id];
    save();
  },

  // --- orders
  async placeOrder(input: { userEmail: string; address: string; customNote?: string }): Promise<Order> {
    await tick(600);
    if (!state.cart.length) throw new Error("Your cart is empty.");
    if (!input.address.trim()) throw new Error("A delivery address is required.");
    const lines = state.cart.map((l) => ({ ...l }));
    const total = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);
    const id = "KA-2026-" + String(500 + state.orders.length).padStart(4, "0");
    const eta = new Date(Date.now() + 12 * 864e5).toISOString().slice(0, 10);
    const order: Order = {
      id, userEmail: input.userEmail, lines, total, status: "placed",
      placedAt: new Date().toISOString().slice(0, 10), eta, address: input.address,
      timeline: [{ status: "placed", date: new Date().toISOString().slice(0, 10), note: "Order confirmed. Artisan notified." }],
      customNote: input.customNote,
    };
    state.orders.unshift(order);
    // any customized line spawns an artisan design request
    for (const l of lines) {
      if (Object.keys(l.options).length) {
        const p = PRODUCTS.find((x) => x.id === l.productId)!;
        state.requests.unshift({
          id: "DR-" + Math.floor(1100 + Math.random() * 900),
          orderRef: id, product: p.name, customer: input.userEmail.split("@")[0],
          artisanId: p.artisanId, summary: Object.entries(l.options).map(([k, v]) => `${k}: ${v}`).join(" · "),
          options: l.options, status: "new", receivedAt: new Date().toISOString().slice(0, 10),
        });
      }
    }
    state.cart = [];
    save();
    return order;
  },
  async listOrders(email?: string): Promise<Order[]> {
    await tick();
    return email ? state.orders.filter((o) => o.userEmail === email) : [...state.orders];
  },
  async getOrder(id: string): Promise<Order | undefined> {
    await tick(120);
    return state.orders.find((o) => o.id === id);
  },
  async advanceOrder(id: string, note: string): Promise<Order | undefined> {
    await tick(200);
    const o = state.orders.find((x) => x.id === id);
    if (!o) return;
    const flow: OrderStatus[] = ["placed", "customization_review", "in_production", "shipped", "delivered"];
    const next = flow[Math.min(flow.indexOf(o.status) + 1, flow.length - 1)];
    o.status = next;
    o.timeline.push({ status: next, date: new Date().toISOString().slice(0, 10), note });
    save();
    return o;
  },
  async cancelOrder(id: string): Promise<Order | undefined> {
    await tick(200);
    const o = state.orders.find((x) => x.id === id);
    if (!o) return;
    if (["shipped", "delivered"].includes(o.status)) throw new Error("Orders already shipped can't be cancelled here — contact support.");
    o.status = "cancelled";
    o.timeline.push({ status: "cancelled", date: new Date().toISOString().slice(0, 10), note: "Cancelled by customer. Refund initiated." });
    save();
    return o;
  },

  // --- customization previews (simulated generation pipeline)
  previewState(key: string): PreviewState { return state.previews[key] ?? "idle"; },
  setPreviewState(key: string, v: PreviewState) { state.previews[key] = v; save(); },

  // --- artisan workspace
  async listRequests(artisanId: string): Promise<DesignRequest[]> {
    await tick();
    return state.requests.filter((r) => r.artisanId === artisanId);
  },
  async allRequests(): Promise<DesignRequest[]> { await tick(); return [...state.requests]; },
  async updateRequest(id: string, patch: Partial<DesignRequest>): Promise<DesignRequest | undefined> {
    await tick(200);
    const r = state.requests.find((x) => x.id === id);
    if (!r) return;
    Object.assign(r, patch);
    save();
    return r;
  },
};

export function categoryName(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
}

export function formatINR(paise: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(paise);
}
