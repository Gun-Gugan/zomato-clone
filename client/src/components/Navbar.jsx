import { NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinkClass = ({ isActive }) =>
    `transition duration-200 ${
      isActive
        ? "text-red-500 font-semibold"
        : "text-gray-800 hover:text-red-500"
    }`;

  return (
    <nav className="bg-white shadow-lg px-6 py-4 sticky top-0 z-50">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <NavLink to="/" className="text-2xl font-extrabold text-red-500">
          Zomato Clone
        </NavLink>

        {/* Hamburger Button */}
        <button
          className="md:hidden text-2xl focus:outline-none"
          onClick={toggleMenu}
        >
          {isOpen ? "✕" : "☰"}
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6 text-base font-medium">
          <NavLink to="/restaurants" className={navLinkClass}>
            Restaurants
          </NavLink>

          {user && (
            <>
              <NavLink to="/orders" className={navLinkClass}>
                Orders
              </NavLink>
              <NavLink to="/profile" className={navLinkClass}>
                Profile
              </NavLink>
              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  `relative flex items-center gap-1 transition duration-200 ${
                    isActive
                      ? "text-red-500 font-semibold"
                      : "text-gray-800 hover:text-red-500"
                  }`
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                >
                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm0 2zM1 2v2h2l3.6 7.59-1.35 2.45C4.52 15.37 5.48 17 7 17h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03L21 6H5.21L4.27 4H1zm16 16c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2z" />
                </svg>
                <span>Cart</span>
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center shadow-md">
                    {cart.length}
                  </span>
                )}
              </NavLink>
            </>
          )}

          {user ? (
            <button
              onClick={logout}
              className="px-3 py-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
            >
              Logout
            </button>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `px-3 py-1 rounded-full transition ${
                    isActive
                      ? "bg-red-100 text-red-600 font-semibold"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`
                }
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `px-3 py-1 rounded-full transition ${
                    isActive
                      ? "bg-red-600 text-white font-semibold"
                      : "bg-red-500 text-white hover:bg-red-600"
                  }`
                }
              >
                Register
              </NavLink>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-4 flex flex-col items-center gap-4 text-base font-medium">
          <NavLink to="/restaurants" onClick={toggleMenu} className={navLinkClass}>
            Restaurants
          </NavLink>

          {user && (
            <>
              <NavLink to="/orders" onClick={toggleMenu} className={navLinkClass}>
                Orders
              </NavLink>
              <NavLink to="/profile" onClick={toggleMenu} className={navLinkClass}>
                Profile
              </NavLink>
              <NavLink
                to="/cart"
                onClick={toggleMenu}
                className={({ isActive }) =>
                  `relative transition duration-200 ${
                    isActive
                      ? "text-red-500 font-semibold"
                      : "text-gray-800 hover:text-red-500"
                  }`
                }
              >
                🛒 Cart
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center shadow-md">
                    {cart.length}
                  </span>
                )}
              </NavLink>
            </>
          )}

          {user ? (
            <button
              onClick={() => {
                logout();
                toggleMenu();
              }}
              className="px-3 py-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
            >
              Logout
            </button>
          ) : (
            <>
              <NavLink
                to="/login"
                onClick={toggleMenu}
                className={({ isActive }) =>
                  `px-3 py-1 rounded-full transition ${
                    isActive
                      ? "bg-red-100 text-red-600 font-semibold"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`
                }
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                onClick={toggleMenu}
                className={({ isActive }) =>
                  `px-3 py-1 rounded-full transition ${
                    isActive
                      ? "bg-red-600 text-white font-semibold"
                      : "bg-red-500 text-white hover:bg-red-600"
                  }`
                }
              >
                Register
              </NavLink>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
