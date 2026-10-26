import { describe, it, expect } from "vitest";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import { AppProvider } from "./context/AppContext";
import { renderProductSVGString, renderAvatarSVGString } from "./components/CraftSVG";
import { SHOWCASE_PRODUCTS, SHOWCASE_ARTISANS } from "./data/showcaseData";

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
    expect(html).toContain("0% commission — artisans keep every cent");
    expect(html).toContain("Handmade treasures");
    expect(html).toContain("Free shipping over ₹2,000");
    expect(html).toContain("Direct artisan trade");
  });

  it("renders customizer studio route without crashing", () => {
    const html = ReactDOMServer.renderToString(
      <MemoryRouter initialEntries={["/customize"]}>
        <AppProvider>
          <App />
        </AppProvider>
      </MemoryRouter>
    );

    expect(html).toContain("KALART");
    expect(html).toContain("Craft Base:");
    expect(html).toContain("Generate mockup");
    expect(html).toContain("Certificate of Authenticity");
  });

  it("renders artisan studio workspace route without crashing", () => {
    const html = ReactDOMServer.renderToString(
      <MemoryRouter initialEntries={["/artisan"]}>
        <AppProvider>
          <App />
        </AppProvider>
      </MemoryRouter>
    );

    expect(html).toContain("KALART");
    expect(html).toContain("Meera Kapoor");
    expect(html).toContain("Incoming Bespoke Requests");
  });

  it("renders admin trust & safety console route without crashing", () => {
    const html = ReactDOMServer.renderToString(
      <MemoryRouter initialEntries={["/admin"]}>
        <AppProvider>
          <App />
        </AppProvider>
      </MemoryRouter>
    );

    expect(html).toContain("KALART");
    expect(html).toContain("Trust, Safety &amp; Provenance Console");
    expect(html).toContain("Artisan Verification Applications");
  });

  it("generates procedural SVG vector artwork without syntax errors", () => {
    const p = SHOWCASE_PRODUCTS[0];
    const svgStr = renderProductSVGString(p.svg, {
      color: "#C05F3C",
      pattern: "waves",
      text: "HELLO",
    });

    expect(svgStr).toContain("<svg");
    expect(svgStr).toContain("viewBox=\"0 0 400 400\"");
    expect(svgStr).toContain("HELLO");
  });

  it("generates procedural illustrated artisan avatars correctly", () => {
    const a = SHOWCASE_ARTISANS[0];
    const avatarStr = renderAvatarSVGString(a.av);

    expect(avatarStr).toContain("<svg");
    expect(avatarStr).toContain("viewBox=\"0 0 140 140\"");
    expect(avatarStr).toContain(a.av.skin);
  });
});
