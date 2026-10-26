import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
  type ReactNode,
} from "react";
import { api, type CartLine, type User } from "../data/store";

interface Toast { id: number; kind: "success" | "error" | "info"; text: string }

interface AppCtx {
  user: User | null;
  setUser: (u: User | null) => void;
  cart: CartLine[];
  cartCount: number;
  refreshCart: () => void;
  addToCart: (line: CartLine) => void;
  setQty: (i: number, q: number) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  refreshFavorites: () => void;
  toast: (kind: Toast["kind"], text: string) => void;
}

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => api.currentUser());
  const [cart, setCart] = useState<CartLine[]>(() => api.cart());
  const [favorites, setFavorites] = useState<string[]>(() => api.favorites());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const tid = useRef(0);

  const refreshCart = useCallback(() => setCart([...api.cart()]), []);
  const refreshFavorites = useCallback(() => setFavorites([...api.favorites()]), []);

  const addToCart = useCallback((line: CartLine) => {
    api.addToCart(line);
    refreshCart();
  }, [refreshCart]);

  const setQty = useCallback((i: number, q: number) => {
    api.setQty(i, q);
    refreshCart();
  }, [refreshCart]);

  const toggleFavorite = useCallback((id: string) => {
    api.toggleFavorite(id);
    refreshFavorites();
  }, [refreshFavorites]);

  const toast = useCallback((kind: Toast["kind"], text: string) => {
    const id = ++tid.current;
    setToasts((t) => [...t, { id, kind, text }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  // keep cart badge in sync across tabs/instances
  useEffect(() => {
    const onStorage = () => { refreshCart(); refreshFavorites(); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refreshCart, refreshFavorites]);

  const value = useMemo<AppCtx>(() => ({
    user, setUser, cart, cartCount: cart.reduce((s, l) => s + l.qty, 0),
    refreshCart, addToCart, setQty, favorites, toggleFavorite, refreshFavorites, toast,
  }), [user, cart, favorites, refreshCart, addToCart, setQty, toggleFavorite, refreshFavorites, toast]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.kind}`}>
            <span aria-hidden style={{ marginTop: 1 }}>
              {t.kind === "success" ? "✓" : t.kind === "error" ? "!" : "i"}
            </span>
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useApp(): AppCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
