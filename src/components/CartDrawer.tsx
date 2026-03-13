import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useI18n } from "@/contexts/I18nContext";
import { formatXof, formatEur } from "@/lib/format";

const CartDrawer: React.FC = () => {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotalXof, subtotalEur, totalItems } =
    useCart();
  const { t, lang } = useI18n();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Focus trap + close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeCart]);

  if (!isOpen && items.length === 0) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-forest/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("cart.title")}
        className={`fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-cream flex flex-col transition-transform duration-400 ease-luxury ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ transition: "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <h2 className="font-display text-xl font-light text-forest">
              {t("cart.title")}
            </h2>
            {totalItems > 0 && (
              <p className="t-label text-muted-foreground mt-0.5">
                {totalItems} {t("common.items")}
              </p>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-muted rounded-sm transition-colors"
            aria-label={t("common.close")}
          >
            <X size={20} className="text-forest" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
              <ShoppingBag size={48} strokeWidth={1} className="text-muted-foreground/40" />
              <p className="font-display text-xl font-light text-muted-foreground">
                {t("cart.empty")}
              </p>
              <Link
                to="/products"
                onClick={closeCart}
                className="btn-primary mt-2"
              >
                {t("nav.products")}
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border" role="list">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 px-6 py-5">
                  {/* Product image */}
                  <div className="w-20 h-20 bg-muted rounded-sm flex-shrink-0 overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={lang === "fr" ? item.nameFr : item.nameEn}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag size={24} className="text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-base font-light text-forest truncate">
                      {lang === "fr" ? item.nameFr : item.nameEn}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.lengthIn} {t("products.inches")}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 border border-border flex items-center justify-center hover:border-gold transition-colors"
                        aria-label="Diminuer la quantité"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-forest">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-7 h-7 border border-border flex items-center justify-center hover:border-gold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Augmenter la quantité"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Price + remove */}
                  <div className="flex flex-col items-end justify-between">
                    <div className="text-right">
                      <p className="font-medium text-forest text-sm">
                        {formatXof(item.priceXof * item.quantity)}
                      </p>
                      {item.priceEur && (
                        <p className="text-xs text-muted-foreground">
                          {formatEur(item.priceEur * item.quantity)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      aria-label={`${t("cart.remove")} ${lang === "fr" ? item.nameFr : item.nameEn}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-border bg-cream">
            {/* Subtotal */}
            <div className="flex items-center justify-between mb-1">
              <span className="t-label text-muted-foreground">{t("cart.subtotal")}</span>
              <div className="text-right">
                <p className="font-medium text-forest">{formatXof(subtotalXof)}</p>
                {subtotalEur !== null && (
                  <p className="text-xs text-muted-foreground">{formatEur(subtotalEur)}</p>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-5 italic">
              {lang === "fr" ? "Frais de livraison calculés à la commande" : "Shipping calculated at checkout"}
            </p>

            <Link
              to="/checkout"
              onClick={closeCart}
              className="btn-primary w-full text-center block"
            >
              {t("cart.checkout")}
            </Link>
            <button
              onClick={closeCart}
              className="w-full text-center t-label text-muted-foreground hover:text-forest transition-colors mt-3 py-1"
            >
              {t("cart.continue")}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
