import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Eye } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { useCart } from "@/contexts/CartContext";
import { formatXof, formatEur } from "@/lib/format";
import ProductQuickView from "./ProductQuickView";

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
  is_featured: boolean;
  product_lengths: ProductLength[];
}

interface ProductCardProps {
  product: Product;
}

function getProductImage(product: Product): string | undefined {
  if (product.image_url) return product.image_url;
  const imageMap: Record<string, string> = {
    "lisse-naturel":   "/src/assets/product-lisse.jpg",
    "ondule-signature":"/src/assets/product-ondule.jpg",
    "bouclettes-premium":"/src/assets/product-bouclettes.jpg",
    "deep-wave":       "/src/assets/product-deepwave.jpg",
  };
  return imageMap[product.slug];
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { t, lang } = useI18n();
  const { addItem } = useCart();
  const [selectedLength, setSelectedLength] = useState<ProductLength | null>(
    product.product_lengths.find((l) => l.is_active && l.stock > 0) ?? null
  );
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const name = lang === "fr" ? product.name_fr : product.name_en;
  const activeLengths = product.product_lengths
    .filter((l) => l.is_active)
    .sort((a, b) => a.length_in - b.length_in);

  const imageUrl = getProductImage(product);

  function getStockBadge(stock: number) {
    if (stock === 0) return <span className="badge-out-of-stock">{t("products.outOfStock")}</span>;
    if (stock <= 5) return <span className="badge-low-stock">{t("products.lowStock")}</span>;
    return <span className="badge-in-stock">{t("products.inStock")}</span>;
  }

  function handleAddToCart() {
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
      imageUrl: imageUrl ?? null,
      stock: selectedLength.stock,
    });
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1800);
  }

  return (
    <>
      <article className="card-luxury group bg-card flex flex-col" aria-label={name}>
        {/* Image */}
        <div className="relative overflow-hidden aspect-[3/4] bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <ShoppingBag size={40} strokeWidth={1} className="text-muted-foreground/30" />
            </div>
          )}

          {/* Overlay actions */}
          <div className="absolute inset-0 bg-forest/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <button
              onClick={() => setQuickViewOpen(true)}
              className="w-10 h-10 bg-cream/90 text-forest rounded-sm flex items-center justify-center hover:bg-cream transition-colors"
              aria-label={t("products.quickView")}
            >
              <Eye size={16} />
            </button>
          </div>

          {/* Featured badge */}
          {product.is_featured && (
            <div className="absolute top-3 left-3">
              <span className="t-label text-[10px] px-2 py-1 bg-gold text-forest">
                {lang === "fr" ? "Bestseller" : "Best seller"}
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-display text-lg font-light text-forest line-clamp-2 leading-tight">
              {name}
            </h3>
            {selectedLength && getStockBadge(selectedLength.stock)}
          </div>

          {/* Length selector */}
          {activeLengths.length > 0 && (
            <div className="mb-4">
              <p className="t-label text-muted-foreground mb-2">{t("products.selectLength")}</p>
              <div className="flex flex-wrap gap-1.5">
                {activeLengths.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setSelectedLength(l)}
                    disabled={l.stock === 0}
                    className={`px-2.5 py-1 text-xs font-medium border transition-all duration-150 ${
                      selectedLength?.id === l.id
                        ? "border-gold bg-gold/10 text-forest"
                        : l.stock === 0
                        ? "border-border text-muted-foreground/40 cursor-not-allowed line-through"
                        : "border-border text-forest hover:border-gold"
                    }`}
                    aria-pressed={selectedLength?.id === l.id}
                    aria-label={`${l.length_in} ${t("products.inches")}`}
                  >
                    {l.length_in}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price */}
          <div className="mt-auto mb-4">
            {selectedLength ? (
              <>
                <p className="font-display text-xl font-light text-forest">
                  {formatXof(selectedLength.price_xof)}
                </p>
                {selectedLength.price_eur && (
                  <p className="text-xs text-muted-foreground">
                    {formatEur(selectedLength.price_eur)}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                {t("products.selectLength")}
              </p>
            )}
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={!selectedLength || selectedLength.stock === 0}
            className={`w-full btn-luxury text-xs transition-all ${
              addedFeedback
                ? "bg-green-700 text-cream"
                : "btn-primary"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <ShoppingBag size={14} />
            {addedFeedback ? t("cart.itemAdded") : t("products.addToCart")}
          </button>
        </div>
      </article>

      {quickViewOpen && (
        <ProductQuickView
          product={product}
          imageUrl={imageUrl ?? null}
          onClose={() => setQuickViewOpen(false)}
        />
      )}
    </>
  );
};

export default ProductCard;
