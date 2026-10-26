import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import RequireRole from "./components/RequireRole";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Customize from "./pages/Customize";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Favorites from "./pages/Favorites";
import { ArtisanList as ArtisansPage, ArtisanProfile } from "./pages/Artisans";
import { CraftsIndex, CraftDetail } from "./pages/Crafts";
import { OrdersList as OrdersPage, OrderDetail } from "./pages/Orders";
import AdminDashboard from "./pages/AdminDashboard";
import ArtisanDashboard from "./pages/ArtisanDashboard";
import Legal, { NotFound } from "./pages/Legal";
import { About, Help, Sell } from "./pages/StaticPages";
import Gallery from "./pages/Gallery";

const TITLES: Record<string, string> = {
  "/": "KALART — Handmade Indian craft, customised with you",
  "/shop": "Shop handmade pieces · KALART",
  "/crafts": "Browse by craft · KALART",
  "/gallery": "GI Craft Library · KALART",
  "/artisans": "Meet the artisans · KALART",
  "/customize": "Customisation studio · KALART",
  "/cart": "Your bag · KALART",
  "/checkout": "Checkout · KALART",
  "/login": "Sign in · KALART",
  "/signup": "Create account · KALART",
  "/favorites": "Saved pieces · KALART",
  "/account/orders": "My orders · KALART",
  "/artisan": "Artisan workspace · KALART",
  "/admin": "Platform console · KALART",
  "/about": "Our story · KALART",
  "/help": "Help & contact · KALART",
  "/sell": "Become an artisan partner · KALART",
};

function ScrollAndTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title =
      TITLES[pathname] ??
      (pathname.startsWith("/product/")
        ? "Handmade piece · KALART"
        : pathname.startsWith("/artisan-profile") ||
          pathname.startsWith("/artisans/")
        ? "Artisan profile · KALART"
        : pathname.startsWith("/orders/")
        ? "Order details · KALART"
        : pathname.startsWith("/legal/")
        ? "Policies · KALART"
        : pathname.startsWith("/crafts/")
        ? "Craft · KALART"
        : "KALART");
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <div style={{ display: "flex", minHeight: "100dvh", flexDirection: "column" }}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <ScrollAndTitle />
      <Header />
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/crafts" element={<CraftsIndex />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/crafts/:slug" element={<CraftDetail />} />
          <Route path="/artisans" element={<ArtisansPage />} />
          <Route path="/artisan/:id" element={<ArtisanProfile />} />
          <Route path="/customize" element={<Customize />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/account/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route
            path="/artisan"
            element={
              <RequireRole role="artisan">
                <ArtisanDashboard />
              </RequireRole>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireRole role="admin">
                <AdminDashboard />
              </RequireRole>
            }
          />
          <Route path="/about" element={<About />} />
          <Route path="/help" element={<Help />} />
          <Route path="/sell" element={<Sell />} />
          <Route path="/legal/:doc" element={<Legal />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
      <CartDrawer />
    </div>
  );
}
