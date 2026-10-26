import { describe, it, expect } from "vitest";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import { AppProvider } from "./context/AppContext";

describe("App Root Component", () => {
  it("renders without crashing on home route", () => {
    const html = ReactDOMServer.renderToString(
      <MemoryRouter initialEntries={["/"]}>
        <AppProvider>
          <App />
        </AppProvider>
      </MemoryRouter>
    );

    expect(html).toContain("KALART");
    expect(html).toContain("Free shipping over ₹2,000");
  });

  it("renders shop route without crashing", () => {
    const html = ReactDOMServer.renderToString(
      <MemoryRouter initialEntries={["/shop"]}>
        <AppProvider>
          <App />
        </AppProvider>
      </MemoryRouter>
    );

    expect(html).toContain("KALART");
  });

  it("renders gallery route without crashing", () => {
    const html = ReactDOMServer.renderToString(
      <MemoryRouter initialEntries={["/gallery"]}>
        <AppProvider>
          <App />
        </AppProvider>
      </MemoryRouter>
    );

    expect(html).toContain("KALART");
  });
});
