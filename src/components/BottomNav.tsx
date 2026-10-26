import { NavLink } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  IconHome,
  IconGrid,
  IconSparkle,
  IconHeart,
  IconBag,
} from "./icons";

export default function BottomNav() {
  const { cartCount, setCartOpen } = useApp();

  return (
    <nav className="ka-bottom-nav" aria-label="Mobile Navigation">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          "ka-bottom-nav__item" + (isActive ? " ka-bottom-nav__item--active" : "")
        }
      >
        <IconHome size={20} />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/shop"
        className={({ isActive }) =>
          "ka-bottom-nav__item" + (isActive ? " ka-bottom-nav__item--active" : "")
        }
      >
        <IconGrid size={20} />
        <span>Shop</span>
      </NavLink>

      <NavLink
        to="/customize"
        className={({ isActive }) =>
          "ka-bottom-nav__item" + (isActive ? " ka-bottom-nav__item--active" : "")
        }
      >
        <IconSparkle size={20} />
        <span>Custom</span>
      </NavLink>

      <NavLink
        to="/favorites"
        className={({ isActive }) =>
          "ka-bottom-nav__item" + (isActive ? " ka-bottom-nav__item--active" : "")
        }
      >
        <IconHeart size={20} />
        <span>Saved</span>
      </NavLink>

      <button
        type="button"
        className="ka-bottom-nav__item ka-bottom-nav__item--bag"
        onClick={() => setCartOpen(true)}
        aria-label={`Open shopping bag, ${cartCount} items`}
      >
        <span className="ka-bottom-nav__bag-wrap">
          <IconBag size={20} />
          {cartCount > 0 && (
            <span className="ka-bottom-nav__badge" aria-hidden="true">
              {cartCount}
            </span>
          )}
        </span>
        <span>Bag</span>
      </button>
    </nav>
  );
}
