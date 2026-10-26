import { describe, it, expect } from "vitest";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import { AppProvider } from "./context/AppContext";
import { renderProductSVGString, renderAvatarSVGString, type ArtisanAvatar } from "./components/CraftSVG";

describe("App Root Component & Redesigned Frontend", () => {
  it("renders without crashing on home route with artisanal hero, trust bar, and catalog", () => {
    const html = ReactDOMServer.renderToString(
      <MemoryRouter initialEntries={["/"]}>
        <AppProvider>
          <App />
        </AppProvider>
      </MemoryRouter>
    );

    expect(html).toContain("KALART");
    expect(html).toContain("Craft with a signature. Made for you, by them.");
    expect(html).toContain("0% commission on partner workshops");
    expect(html).toContain("Verified artisans, signed work");
    expect(html).toContain("Ships across India in 7–16 days");
    expect(html).toContain("14-day returns on standard pieces");
  });

  it("renders customizer studio route looking up product by slug with INR pricing", () => {
    const html = ReactDOMServer.renderToString(
      <MemoryRouter initialEntries={["/customize?product=p-ikat-shawl"]}>
        <AppProvider>
          <App />
        </AppProvider>
      </MemoryRouter>
    );

    expect(html).toContain("KALART");
    expect(html).toContain("Handmade to Order");
    expect(html).toContain("Pochampally Ikat Shawl");
    expect(html).toContain("Crafted by");
    expect(html).toContain("₹");
    expect(html).toContain("Ships with signed provenance card");
  });

  it("protects /artisan route with RequireRole guard for unauthenticated users", () => {
    const html = ReactDOMServer.renderToString(
      <MemoryRouter initialEntries={["/artisan"]}>
        <AppProvider>
          <App />
        </AppProvider>
      </MemoryRouter>
    );

    expect(html).toContain("Artisan Workspace Access");
    expect(html).toContain("verified artisan partners");
    expect(html).toContain("Demo credentials available");
    expect(html).toContain("Ravi Mistry");
  });

  it("protects /admin route with RequireRole guard for unauthenticated users", () => {
    const html = ReactDOMServer.renderToString(
      <MemoryRouter initialEntries={["/admin"]}>
        <AppProvider>
          <App />
        </AppProvider>
      </MemoryRouter>
    );

    expect(html).toContain("Platform Console Access");
    expect(html).toContain("platform administrators");
    expect(html).toContain("Demo credentials available");
    expect(html).toContain("Platform Admin");
  });

  it("generates procedural SVG vector artwork with responsive inline dimensions", () => {
    const svgStr = renderProductSVGString("vase", {
      color: "#C05F3C",
      pattern: "waves",
      text: "KALART",
    });

    expect(svgStr).toContain("<svg");
    expect(svgStr).toContain("viewBox=\"0 0 400 400\"");
    expect(svgStr).toContain("style=\"width:100%;height:auto;max-height:100%;display:block\"");
    expect(svgStr).toContain("KALART");
  });

  it("generates procedural illustrated artisan avatars correctly", () => {
    const sampleAvatar: ArtisanAvatar = {
      bg: "#F2D8C9",
      skin: "#B8734A",
      hair: "#1C140E",
      shirt: "#8A3324",
      style: "bun",
    };

    const avatarStr = renderAvatarSVGString(sampleAvatar);

    expect(avatarStr).toContain("<svg");
    expect(avatarStr).toContain("viewBox=\"0 0 140 140\"");
    expect(avatarStr).toContain(sampleAvatar.skin);
  });

  it("ensures no raw emoji in the header branding and cart badge renders cleanly", () => {
    const html = ReactDOMServer.renderToString(
      <MemoryRouter initialEntries={["/"]}>
        <AppProvider>
          <App />
        </AppProvider>
      </MemoryRouter>
    );

    // Assert that header does not contain raw emoji icons
    expect(html).not.toContain("🛍");
    expect(html).not.toContain("🧺");
    expect(html).not.toContain("🌿");
    expect(html).not.toContain("🎉");
  });
});
