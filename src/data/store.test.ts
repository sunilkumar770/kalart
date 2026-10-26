import { describe, it, expect } from "vitest";
import { api, CATEGORIES } from "./store";

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
});
