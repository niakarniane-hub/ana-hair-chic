import React, { useState, useMemo } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import { Search, Filter } from "lucide-react";

const ProductsPage: React.FC = () => {
  const { t, lang } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: products, isLoading, error } = useQuery({
    queryKey: ["products", selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select(`*, product_lengths(*), categories(*)`)
        .eq("is_active", true)
        .order("sort_order");

      if (selectedCategory !== "all") {
        query = query.eq("category_id", selectedCategory);
      }

      const { data, err } = await query as any;
      if (err) throw err;
      return data;
    },
  });

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p: any) =>
        p.name_fr.toLowerCase().includes(q) ||
        p.name_en.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  return (
    <div className="min-h-screen bg-cream">
      {/* Page Hero */}
      <section className="bg-forest pt-[var(--nav-height)] pb-16">
        <div className="container-luxury text-center pt-10">
          <div className="section-eyebrow justify-center text-gold/70 mb-4">
            {t("products.subtitle")}
          </div>
          <h1 className="t-display text-cream">{t("products.title")}</h1>
          <div className="divider-gold mt-6 max-w-xs mx-auto">
            <span className="t-label text-gold/50">ANA'HAIR</span>
          </div>
        </div>
      </section>

      <div className="container-luxury py-12">
        {/* Filters row */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === "fr" ? "Rechercher une extension..." : "Search extensions..."}
              className="input-luxury pl-9"
              aria-label={t("common.search")}
            />
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={15} className="text-muted-foreground" />
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 text-xs font-medium border transition-all ${
                selectedCategory === "all"
                  ? "bg-forest text-cream border-forest"
                  : "bg-transparent text-forest border-border hover:border-forest"
              }`}
            >
              {lang === "fr" ? "Tous" : "All"}
            </button>
            {categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 text-xs font-medium border transition-all ${
                  selectedCategory === cat.id
                    ? "bg-forest text-cream border-forest"
                    : "bg-transparent text-forest border-border hover:border-forest"
                }`}
              >
                {lang === "fr" ? cat.name_fr : cat.name_en}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        {!isLoading && (
          <p className="text-sm text-muted-foreground mb-6">
            {filteredProducts.length} {t("common.items")}
            {searchQuery && ` ${lang === "fr" ? "pour" : "for"} "${searchQuery}"`}
          </p>
        )}

        {/* Products grid */}
        {error ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">{t("common.error")}</p>
            <button className="btn-outline mt-4">{t("common.retry")}</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading
              ? Array(8).fill(null).map((_, i) => <ProductCardSkeleton key={i} />)
              : filteredProducts.length === 0
              ? (
                <div className="col-span-full text-center py-20">
                  <p className="font-display text-xl text-muted-foreground">
                    {t("products.noProducts")}
                  </p>
                </div>
              )
              : filteredProducts.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
