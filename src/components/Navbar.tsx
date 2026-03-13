import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useI18n } from "@/contexts/I18nContext";

const navLinks = [
  { key: "nav.home",     href: "/" },
  { key: "nav.products", href: "/products" },
  { key: "nav.about",    href: "/about" },
  { key: "nav.contact",  href: "/contact" },
  { key: "nav.faq",      href: "/faq" },
];

const Navbar: React.FC = () => {
  const { totalItems, openCart } = useCart();
  const { lang, setLang, t } = useI18n();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isForestBg =
    location.pathname === "/" ||
    location.pathname === "/about";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const textColor = !scrolled && isForestBg ? "text-cream" : "text-forest";
  const bgClass = scrolled
    ? "bg-forest/97 backdrop-blur-md shadow-sm"
    : isForestBg
    ? "bg-transparent"
    : "bg-cream/90 backdrop-blur-sm";

  return (
    <>
      <nav
        className={`nav-luxury fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${bgClass}`}
        role="navigation"
        aria-label="Navigation principale"
      >
        <div className="container-luxury h-[var(--nav-height)] flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className={`font-display text-2xl font-light tracking-[0.15em] ${scrolled || !isForestBg ? "text-forest" : "text-cream"} hover:opacity-80 transition-opacity`}
            aria-label="ANA'HAIR — Accueil"
          >
            ANA<span className="text-gold">'</span>HAIR
          </Link>

          {/* Desktop nav */}
          <ul className="hidden lg:flex items-center gap-8" role="list">
            {navLinks.map((link) => {
              const active = location.pathname === link.href;
              return (
                <li key={link.key}>
                  <Link
                    to={link.href}
                    className={`link-hover t-label transition-colors duration-200 ${
                      scrolled || !isForestBg ? "text-forest" : "text-cream"
                    } ${active ? "text-gold after:w-full" : ""}`}
                  >
                    {t(link.key)}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Language toggle */}
            <div className="hidden sm:flex items-center gap-1 text-xs font-medium tracking-wider">
              <button
                onClick={() => setLang("fr")}
                className={`px-1 transition-colors ${
                  lang === "fr"
                    ? "text-gold"
                    : scrolled || !isForestBg
                    ? "text-muted-foreground hover:text-forest"
                    : "text-cream/60 hover:text-cream"
                }`}
                aria-pressed={lang === "fr"}
              >
                FR
              </button>
              <span className={scrolled || !isForestBg ? "text-border" : "text-cream/30"}>|</span>
              <button
                onClick={() => setLang("en")}
                className={`px-1 transition-colors ${
                  lang === "en"
                    ? "text-gold"
                    : scrolled || !isForestBg
                    ? "text-muted-foreground hover:text-forest"
                    : "text-cream/60 hover:text-cream"
                }`}
                aria-pressed={lang === "en"}
              >
                EN
              </button>
            </div>

            {/* Cart button */}
            <button
              onClick={openCart}
              className={`relative p-2 transition-all duration-200 hover:scale-105 ${
                scrolled || !isForestBg ? "text-forest" : "text-cream"
              }`}
              aria-label={`${t("nav.cart")} (${totalItems} articles)`}
            >
              <ShoppingBag size={22} strokeWidth={1.5} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold text-forest text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className={`lg:hidden p-2 ${scrolled || !isForestBg ? "text-forest" : "text-cream"}`}
              aria-label="Menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden bg-forest/97 backdrop-blur-md animate-slide-down">
            <ul className="container-luxury py-6 flex flex-col gap-4" role="list">
              {navLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    to={link.href}
                    className="block t-label text-cream hover:text-gold transition-colors py-2"
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
              <li className="pt-4 border-t border-cream/10 flex gap-3">
                <button
                  onClick={() => setLang("fr")}
                  className={`t-label px-3 py-1 border ${lang === "fr" ? "border-gold text-gold" : "border-cream/30 text-cream/60"}`}
                >
                  FR
                </button>
                <button
                  onClick={() => setLang("en")}
                  className={`t-label px-3 py-1 border ${lang === "en" ? "border-gold text-gold" : "border-cream/30 text-cream/60"}`}
                >
                  EN
                </button>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
