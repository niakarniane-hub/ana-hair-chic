import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Leaf, Shield, Zap } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import heroModel from "@/assets/hero-model.jpg";

const features = [
  { icon: Leaf,   key: "100% Naturel",        desc: "Cheveux 100% naturels Remy, soigneusement sélectionnés" },
  { icon: Star,   key: "Qualité Premium",      desc: "Chaque mèche testée selon nos standards exigeants" },
  { icon: Shield, key: "Garantie Satisfaction",desc: "14 jours pour changer d'avis, sans condition" },
  { icon: Zap,    key: "Livraison Rapide",     desc: "Expédition sous 24h partout en Afrique et en France" },
];

const testimonials = [
  { name: "Aminata K.", city: "Abidjan", text: "Qualité incroyable ! Mes extensions ressemblent exactement à mes vrais cheveux. Je ne commanderai plus ailleurs.", rating: 5 },
  { name: "Fatou D.", city: "Dakar",    text: "Service impeccable, livraison rapide. Les 20 pouces sont magnifiques, exactement comme sur les photos.", rating: 5 },
  { name: "Nadia M.", city: "Paris",    text: "Enfin une marque africaine qui rivalise avec les grandes marques internationales. Bravo ANA'HAIR !", rating: 5 },
];

const IndexPage: React.FC = () => {
  const { t, lang } = useI18n();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const { data: featuredProducts, isLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`*, product_lengths(*), categories(*)`)
        .eq("is_featured", true)
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen">
      {/* ═══════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════ */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden bg-forest"
        aria-label="Hero"
      >
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={heroModel}
            alt="ANA'HAIR — Extensions de luxe"
            className="w-full h-full object-cover object-center opacity-40"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-forest/95 via-forest/70 to-forest/30" />
        </div>

        {/* Gold grain texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")", backgroundSize: "150px" }}
        />

        <div className="container-luxury relative z-10 pt-[var(--nav-height)]">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <div className="section-eyebrow text-gold/80 mb-8 animate-fade-in">
              {t("hero.eyebrow")}
            </div>

            {/* Title */}
            <h1 className="t-hero text-cream animate-fade-in delay-100">
              {t("hero.title1")}{" "}
              <em className="not-italic text-gold">{t("hero.title2")}</em>
              <br />
              {t("hero.title3")}
            </h1>

            {/* Subtitle */}
            <p className="t-body text-cream/60 mt-6 max-w-md animate-fade-in delay-200">
              {t("hero.subtitle")}
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-4 mt-10 animate-fade-in delay-300">
              <Link to="/products" className="btn-gold group">
                {t("hero.cta1")}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/about" className="btn-outline-cream">
                {t("hero.cta2")}
              </Link>
            </div>

            {/* Stats strip */}
            <div className="flex gap-8 mt-14 animate-fade-in delay-400">
              {[
                { value: "100%",  label: "Naturel" },
                { value: "500+",  label: lang === "fr" ? "Clientes satisfaites" : "Happy customers" },
                { value: "4.9★",  label: lang === "fr" ? "Note moyenne" : "Average rating" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-2xl font-light text-gold">{stat.value}</p>
                  <p className="text-xs text-cream/40 mt-0.5 font-light">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in delay-500">
          <span className="t-label text-cream/30 text-[10px]">scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-cream/30 to-transparent" />
        </div>
      </section>

      {/* ═══════════════════════════════════════
          BRAND STRIP
      ═══════════════════════════════════════ */}
      <section className="bg-gold py-3 overflow-hidden">
        <div className="flex items-center gap-8 animate-[scroll_20s_linear_infinite]" style={{ width: "max-content" }}>
          {Array(8).fill(null).map((_, i) => (
            <React.Fragment key={i}>
              <span className="t-label text-forest/60 whitespace-nowrap">Extensions Premium</span>
              <span className="text-forest/40">◆</span>
              <span className="t-label text-forest/60 whitespace-nowrap">100% Naturel</span>
              <span className="text-forest/40">◆</span>
              <span className="t-label text-forest/60 whitespace-nowrap">Livraison Afrique & France</span>
              <span className="text-forest/40">◆</span>
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURED PRODUCTS
      ═══════════════════════════════════════ */}
      <section className="py-24 bg-cream" aria-label="Produits vedettes">
        <div className="container-luxury">
          <div className="text-center mb-14">
            <div className="section-eyebrow justify-center mb-4">
              {t("products.subtitle")}
            </div>
            <h2 className="t-display text-forest">
              {t("products.title")}
            </h2>
            <div className="divider-gold mt-6 max-w-xs mx-auto">
              <span className="t-label text-gold/60">Signature</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading
              ? Array(4).fill(null).map((_, i) => <ProductCardSkeleton key={i} />)
              : featuredProducts?.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/products" className="btn-outline">
              {t("products.viewAll")}
              <ArrowRight size={15} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURES / WHY US
      ═══════════════════════════════════════ */}
      <section className="py-24 bg-forest" aria-label="Nos engagements">
        <div className="container-luxury">
          <div className="text-center mb-16">
            <div className="section-eyebrow justify-center text-gold/70 mb-4">
              {lang === "fr" ? "Nos Engagements" : "Our Commitments"}
            </div>
            <h2 className="t-display text-cream">
              {lang === "fr" ? "L'Excellence au Cœur" : "Excellence at Heart"}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.key}
                  className={`p-8 border transition-all duration-300 cursor-default ${
                    hoveredFeature === i
                      ? "border-gold/50 bg-forest-mid"
                      : "border-cream/10 bg-transparent"
                  }`}
                  onMouseEnter={() => setHoveredFeature(i)}
                  onMouseLeave={() => setHoveredFeature(null)}
                >
                  <div className={`w-10 h-10 rounded-sm flex items-center justify-center mb-5 transition-colors ${
                    hoveredFeature === i ? "bg-gold/20" : "bg-cream/5"
                  }`}>
                    <Icon size={20} className={hoveredFeature === i ? "text-gold" : "text-cream/40"} />
                  </div>
                  <h3 className="font-display text-lg font-light text-cream mb-2">{feat.key}</h3>
                  <p className="text-sm text-cream/50 font-light leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════ */}
      <section className="py-24 bg-cream" aria-label="Témoignages">
        <div className="container-luxury">
          <div className="text-center mb-14">
            <div className="section-eyebrow justify-center mb-4">
              {lang === "fr" ? "Elles nous font confiance" : "They trust us"}
            </div>
            <h2 className="t-display text-forest">
              {lang === "fr" ? "Ce que disent nos clientes" : "What our customers say"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <blockquote
                key={t.name}
                className="card-luxury p-8 bg-card"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {Array(t.rating).fill(null).map((_, si) => (
                    <Star key={si} size={14} className="text-gold fill-gold" />
                  ))}
                </div>
                <p className="font-display text-base font-light leading-relaxed text-foreground italic mb-6">
                  "{t.text}"
                </p>
                <footer>
                  <p className="font-medium text-sm text-forest">{t.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.city}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CTA BAND
      ═══════════════════════════════════════ */}
      <section className="py-20 bg-forest-mid border-y border-cream/5" aria-label="Appel à l'action">
        <div className="container-luxury text-center">
          <h2 className="t-display text-cream mb-4">
            {lang === "fr" ? "Prête à sublimer votre beauté ?" : "Ready to elevate your beauty?"}
          </h2>
          <p className="t-body text-cream/50 max-w-md mx-auto mb-8">
            {lang === "fr"
              ? "Découvrez notre collection complète et trouvez l'extension parfaite pour vous."
              : "Explore our full collection and find the perfect extension for you."}
          </p>
          <Link to="/products" className="btn-gold">
            {t("hero.cta1")}
            <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </section>

      <style>{`
        @keyframes scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default IndexPage;
