import React, { useState, useEffect, useRef } from "react";
import { X, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { useCart } from "@/contexts/CartContext";
import { formatXof, formatEur } from "@/lib/format";

interface ProductLength {
  id: string;
  length_in: number;
  price_xof: number;
  price_eur: number | null;
  stock: number;
  is_active: boolean;
}

interface Product {
  id: string;
  slug: string;
  name_fr: string;
  name_en: string;
  description_fr: string | null;
  description_en: string | null;
  image_url: string | null;
  images: string[];
  product_lengths: ProductLength[];
}

interface Props {
  product: Product;
  imageUrl: string | null;
  onClose: () => void;
}

const ProductQuickView: React.FC<Props> = ({ product, imageUrl, onClose }) => {
  const { t, lang } = useI18n();
  const { addItem } = useCart();
  const modalRef = useRef<HTMLDivElement>(null);

  const name = lang === "fr" ? product.name_fr : product.name_en;
  const description = lang === "fr" ? product.description_fr : product.description_en;

  const activeLengths = product.product_lengths
    .filter((l) => l.is_active)
    .sort((a, b) => a.length_in - b.length_in);

  const [selectedLength, setSelectedLength] = useState<ProductLength | null>(
    activeLengths.find((l) => l.stock > 0) ?? null
  );
  const [addedFeedback, setAddedFeedback] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    modalRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  function handleAdd() {
    if (!selectedLength || selectedLength.stock === 0) return;
    addItem({
      id: selectedLength.id,
      productId: product.id,
      productSlug: product.slug,
      nameFr: product.name_fr,
      nameEn: product.name_en,
      lengthIn: selectedLength.length_in,
      priceXof: selectedLength.price_xof,
      priceEur: selectedLength.price_eur,
      imageUrl,
      stock: selectedLength.stock,
    });
    setAddedFeedback(true);
    setTimeout(() => {
      setAddedFeedback(false);
      onClose();
    }, 1500);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={name}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-forest/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative bg-card w-full max-w-2xl rounded-sm shadow-luxury-xl animate-scale-in overflow-hidden"
        style={{ maxHeight: "90vh" }}
      >
        <div className="flex flex-col md:flex-row h-full">
          {/* Image */}
          <div className="md:w-2/5 aspect-square md:aspect-auto md:min-h-[400px] bg-muted flex-shrink-0 overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag size={48} strokeWidth={1} className="text-muted-foreground/20" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto flex flex-col">
            {/* Close */}
            <div className="flex justify-end mb-2">
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-muted rounded-sm transition-colors"
                aria-label={t("common.close")}
              >
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>

            <h2 className="font-display text-2xl font-light text-forest mb-2">{name}</h2>

            {description && (
              <p className="text-sm text-muted-foreground font-light leading-relaxed mb-5">
                {description}
              </p>
            )}

            {/* Length selector */}
            <div className="mb-5">
              <p className="t-label text-muted-foreground mb-3">{t("products.selectLength")}</p>
              <div className="grid grid-cols-4 gap-2">
                {activeLengths.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setSelectedLength(l)}
                    disabled={l.stock === 0}
                    className={`p-2.5 border text-sm font-medium transition-all ${
                      selectedLength?.id === l.id
                        ? "border-gold bg-gold/10 text-forest"
                        : l.stock === 0
                        ? "border-border text-muted-foreground/30 cursor-not-allowed line-through"
                        : "border-border text-forest hover:border-gold"
                    }`}
                  >
                    {l.length_in}"
                    {l.stock > 0 && l.stock <= 5 && (
                      <div className="text-[9px] text-amber-600 mt-0.5">
                        {lang === "fr" ? `${l.stock} restants` : `${l.stock} left`}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="mb-6 mt-auto">
              {selectedLength ? (
                <div>
                  <p className="font-display text-2xl font-light text-forest">
                    {formatXof(selectedLength.price_xof)}
                  </p>
                  {selectedLength.price_eur && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {formatEur(selectedLength.price_eur)}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">{t("products.selectLength")}</p>
              )}
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAdd}
              disabled={!selectedLength || selectedLength.stock === 0}
              className={`w-full btn-luxury text-sm ${
                addedFeedback ? "bg-green-700 text-cream" : "btn-primary"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <ShoppingBag size={15} />
              {addedFeedback ? t("cart.itemAdded") : t("products.addToCart")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductQuickView;
