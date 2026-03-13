import React from "react";
import { useI18n } from "@/contexts/I18nContext";
import heroModel from "@/assets/hero-model.jpg";

const AboutPage: React.FC = () => {
  const { lang } = useI18n();

  const values = [
    {
      titleFr: "Authenticité",
      titleEn: "Authenticity",
      textFr: "Nous sélectionnons uniquement des cheveux 100% naturels, sans compromis sur la qualité.",
      textEn: "We select only 100% natural hair, without compromise on quality.",
    },
    {
      titleFr: "Excellence",
      titleEn: "Excellence",
      textFr: "Chaque produit passe par un contrôle qualité rigoureux avant de vous être livré.",
      textEn: "Each product undergoes rigorous quality control before being delivered to you.",
    },
    {
      titleFr: "Confiance",
      titleEn: "Trust",
      textFr: "La satisfaction de nos clientes est notre priorité absolue.",
      textEn: "Our customers' satisfaction is our absolute priority.",
    },
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="relative bg-forest pt-[var(--nav-height)] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={heroModel} alt="" className="w-full h-full object-cover object-top" aria-hidden="true" />
          <div className="absolute inset-0 bg-forest/70" />
        </div>
        <div className="container-luxury relative z-10 py-20 text-center">
          <div className="section-eyebrow justify-center text-gold/70 mb-4">ANA'HAIR</div>
          <h1 className="t-display text-cream">
            {lang === "fr" ? "Notre Histoire" : "Our Story"}
          </h1>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-cream">
        <div className="container-luxury max-w-3xl mx-auto">
          <div className="section-eyebrow mb-4">
            {lang === "fr" ? "Depuis 2020" : "Since 2020"}
          </div>
          <h2 className="t-display-sm text-forest mb-8">
            {lang === "fr" ? "L'amour de la beauté authentique" : "The love of authentic beauty"}
          </h2>
          <div className="space-y-5 t-body text-muted-foreground">
            <p>
              {lang === "fr"
                ? "ANA'HAIR est née d'une passion profonde pour la beauté naturelle africaine et d'un constat simple : les femmes méritent des extensions capillaires de qualité véritablement luxueuse, à des prix accessibles."
                : "ANA'HAIR was born from a deep passion for natural African beauty and a simple observation: women deserve hair extensions of truly luxurious quality, at accessible prices."}
            </p>
            <p>
              {lang === "fr"
                ? "Notre fondatrice, elle-même passionnée de cheveux naturels, a voyagé à travers l'Afrique et l'Asie pour sourcer les meilleures matières premières et créer une gamme qui allie tradition et modernité."
                : "Our founder, herself passionate about natural hair, traveled across Africa and Asia to source the best raw materials and create a range that combines tradition and modernity."}
            </p>
            <p>
              {lang === "fr"
                ? "Aujourd'hui, ANA'HAIR est la référence des extensions de luxe pour les femmes africaines, en Afrique de l'Ouest et en France."
                : "Today, ANA'HAIR is the reference for luxury extensions for African women, in West Africa and France."}
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-forest">
        <div className="container-luxury">
          <div className="text-center mb-14">
            <div className="section-eyebrow justify-center text-gold/70 mb-4">
              {lang === "fr" ? "Ce qui nous définit" : "What defines us"}
            </div>
            <h2 className="t-display text-cream">
              {lang === "fr" ? "Nos Valeurs" : "Our Values"}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v) => (
              <div
                key={v.titleFr}
                className="p-8 border border-cream/10 hover:border-gold/40 transition-colors"
              >
                <div className="w-8 h-px bg-gold mb-6" />
                <h3 className="font-display text-xl text-cream mb-3">
                  {lang === "fr" ? v.titleFr : v.titleEn}
                </h3>
                <p className="text-sm text-cream/50 font-light leading-relaxed">
                  {lang === "fr" ? v.textFr : v.textEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-cream border-b border-border">
        <div className="container-luxury">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "500+",  labelFr: "Clientes satisfaites",       labelEn: "Happy customers" },
              { value: "4",     labelFr: "Textures disponibles",       labelEn: "Available textures" },
              { value: "8",     labelFr: "Pays livrés",                labelEn: "Countries delivered" },
              { value: "4.9★",  labelFr: "Note moyenne clientes",      labelEn: "Average customer rating" },
            ].map((stat) => (
              <div key={stat.value}>
                <p className="font-display text-4xl font-light text-gold mb-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground font-light">
                  {lang === "fr" ? stat.labelFr : stat.labelEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
