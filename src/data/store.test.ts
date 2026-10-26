import { describe, it, expect } from "vitest";
import { api, CATEGORIES, PRODUCTS, formatINR, type Order } from "./store";

describe("KALART Store & Data API", () => {
  it("loads categories with required fields", () => {
    expect(CATEGORIES.length).toBeGreaterThan(0);
    CATEGORIES.forEach((cat) => {
      expect(cat.slug).toBeTruthy();
      expect(cat.name).toBeTruthy();
      expect(cat.blurb).toBeTruthy();
      expect(cat.image).toBeTruthy();
    });
  });

  it("loads artisan catalog with valid profiles", async () => {
    const artisans = await api.listArtisans();
    expect(artisans.length).toBeGreaterThan(0);
    artisans.forEach((artisan) => {
      expect(artisan.id).toBeTruthy();
      expect(artisan.name).toBeTruthy();
      expect(artisan.craft).toBeTruthy();
      expect(artisan.location).toBeTruthy();
      expect(artisan.rating).toBeGreaterThanOrEqual(1);
      expect(artisan.rating).toBeLessThanOrEqual(5);
    });
  });

  it("loads products catalog and supports filtering by category", async () => {
    const products = await api.listProducts();
    expect(products.length).toBeGreaterThan(0);

    const firstProduct = products[0];
    const categorySlug = firstProduct.categorySlug;

    const filtered = await api.listProducts({ category: categorySlug });
    expect(filtered.length).toBeGreaterThan(0);
    filtered.forEach((p) => {
      expect(p.categorySlug).toBe(categorySlug);
    });
  });

  it("retrieves a single product by slug or id", async () => {
    const products = await api.listProducts();
    const sample = products[0];

    const fetched = await api.getProduct(sample.slug);
    expect(fetched).toBeDefined();
    expect(fetched?.id).toBe(sample.id);
    expect(fetched?.price).toBe(sample.price);
  });

  it("returns undefined for non-existent product", async () => {
    const nonExistent = await api.getProduct("non-existent-craft-slug-9999");
    expect(nonExistent).toBeUndefined();
  });

  it("calculates cart shipping correctly based on the ₹2,000 threshold", () => {
    const calcShipping = (subtotal: number) => (subtotal >= 2000 || subtotal === 0 ? 0 : 99);

    expect(calcShipping(1450)).toBe(99);
    expect(calcShipping(2000)).toBe(0);
    expect(calcShipping(3200)).toBe(0);
    expect(calcShipping(0)).toBe(0);
  });

  it("formats INR currency correctly using standard Indian numbering system", () => {
    expect(formatINR(500)).toBe("₹500");
    expect(formatINR(2400)).toBe("₹2,400");
    expect(formatINR(125000)).toBe("₹1,25,000");
  });

  it("supports order placement and stores valid order records", async () => {
    const testItem = PRODUCTS[0];
    await api.addToCart({ productId: testItem.id, qty: 1, options: { "Finish": "Natural" }, unitPrice: testItem.price });

    const order = await api.placeOrder({
      userEmail: "customer@example.com",
      address: "123 Craft Lane, Indiranagar, Bengaluru 560038",
      customNote: "Please include gift wrapping.",
    });

    expect(order.id).toMatch(/^KA-2026-\d+$/);
    expect(order.userEmail).toBe("customer@example.com");
    expect(order.status).toBe("placed");
    expect(order.lines.length).toBe(1);
    expect(order.lines[0].productId).toBe(testItem.id);
    expect(order.address).toContain("Bengaluru");
    expect(order.customNote).toBe("Please include gift wrapping.");

    const myOrders = await api.listOrders("customer@example.com");
    const found = myOrders.find((o: Order) => o.id === order.id);
    expect(found).toBeDefined();
  });
});
