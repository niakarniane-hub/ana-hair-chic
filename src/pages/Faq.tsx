import React, { useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { Plus, Minus } from "lucide-react";

const faqData = [
  {
    questionFr: "Quelle est la différence entre les extensions Remy et les extensions standards ?",
    questionEn: "What is the difference between Remy extensions and standard extensions?",
    answerFr: "Les extensions Remy sont fabriquées à partir de cheveux naturels dont les cuticules sont alignées dans le même sens, ce qui les rend plus douces, plus brillantes et plus résistantes aux emmêlements. C'est la référence qualité que nous utilisons chez ANA'HAIR.",
    answerEn: "Remy extensions are made from natural hair with cuticles aligned in the same direction, making them softer, shinier and more tangle-resistant. This is the quality standard we use at ANA'HAIR.",
  },
  {
    questionFr: "Comment choisir la bonne longueur ?",
    questionEn: "How do I choose the right length?",
    answerFr: "Nous proposons 4 longueurs : 12 pouces (30 cm), 16 pouces (40 cm), 20 pouces (50 cm) et 24 pouces (60 cm). Pour une longueur naturelle, choisissez 12-16 pouces. Pour un effet dramatique, optez pour 20-24 pouces.",
    answerEn: "We offer 4 lengths: 12 inches (30 cm), 16 inches (40 cm), 20 inches (50 cm) and 24 inches (60 cm). For a natural look, choose 12-16 inches. For a dramatic effect, opt for 20-24 inches.",
  },
  {
    questionFr: "Puis-je teindre ou coiffer les extensions à la chaleur ?",
    questionEn: "Can I dye or heat-style the extensions?",
    answerFr: "Oui, nos extensions 100% naturelles peuvent être coiffées avec des outils chauffants (max 180°C). Pour la teinture, nous recommandons de faire appel à un professionnel. Évitez l'eau de Javel et les décolorations excessives.",
    answerEn: "Yes, our 100% natural extensions can be styled with heat tools (max 180°C). For dyeing, we recommend consulting a professional. Avoid bleach and excessive discoloration.",
  },
  {
    questionFr: "Quels sont les délais et coûts de livraison ?",
    questionEn: "What are the delivery times and costs?",
    answerFr: "Livraison à Abidjan : 24-48h (2 000 FCFA). Intérieur Côte d'Ivoire : 3-5 jours (5 000 FCFA). Afrique de l'Ouest : 5-7 jours (8 000 FCFA). France : 5-7 jours (9,90 €). International : 10-15 jours (19,90 €).",
    answerEn: "Delivery to Abidjan: 24-48h (2,000 XOF). Ivory Coast interior: 3-5 days (5,000 XOF). West Africa: 5-7 days (8,000 XOF). France: 5-7 days (€9.90). International: 10-15 days (€19.90).",
  },
  {
    questionFr: "Quels modes de paiement acceptez-vous ?",
    questionEn: "What payment methods do you accept?",
    answerFr: "Nous acceptons le paiement à la livraison (cash), le Mobile Money (Wave, Orange Money, MTN) et le virement bancaire. Stripe pour les paiements par carte bancaire est en cours d'intégration.",
    answerEn: "We accept cash on delivery, Mobile Money (Wave, Orange Money, MTN), and bank transfers. Stripe for card payments is currently being integrated.",
  },
  {
    questionFr: "Quelle est votre politique de retour ?",
    questionEn: "What is your return policy?",
    answerFr: "Vous disposez de 14 jours après réception pour retourner un produit non ouvert et dans son état d'origine. Contactez-nous à contact@anahair.com pour initier un retour.",
    answerEn: "You have 14 days after receipt to return an unopened product in its original condition. Contact us at contact@anahair.com to initiate a return.",
  },
  {
    questionFr: "Comment entretenir mes extensions ?",
    questionEn: "How do I care for my extensions?",
    answerFr: "Démêlez délicatement avec une brosse à dents large. Lavez à l'eau tiède avec un shampoing doux. Séchez à l'air libre ou avec un sèche-cheveux à basse température. Rangez dans un sachet en satin quand vous ne les portez pas.",
    answerEn: "Gently detangle with a wide-tooth brush. Wash with lukewarm water and mild shampoo. Air dry or blow-dry on low heat. Store in a satin bag when not wearing.",
  },
];

const FaqItem: React.FC<{ item: typeof faqData[0]; isOpen: boolean; onToggle: () => void }> = ({
  item, isOpen, onToggle,
}) => {
  const { lang } = useI18n();
  return (
    <div className={`border transition-colors duration-200 ${isOpen ? "border-gold/40" : "border-border"}`}>
      <button
        onClick={onToggle}
        className="w-full px-6 py-5 flex items-center justify-between text-left gap-4"
        aria-expanded={isOpen}
      >
        <span className="font-display text-base font-light text-forest">
          {lang === "fr" ? item.questionFr : item.questionEn}
        </span>
        <div
          className={`w-7 h-7 flex-shrink-0 border flex items-center justify-center transition-all duration-200 ${
            isOpen ? "border-gold bg-gold/10" : "border-border"
          }`}
        >
          {isOpen
            ? <Minus size={12} className="text-gold" />
            : <Plus size={12} className="text-forest" />}
        </div>
      </button>
      {isOpen && (
        <div className="px-6 pb-5 border-t border-border/50 animate-fade-in">
          <p className="text-sm text-muted-foreground font-light leading-relaxed pt-4">
            {lang === "fr" ? item.answerFr : item.answerEn}
          </p>
        </div>
      )}
    </div>
  );
};

const FaqPage: React.FC = () => {
  const { lang } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-forest pt-[var(--nav-height)] pb-14">
        <div className="container-luxury text-center pt-10">
          <div className="section-eyebrow justify-center text-gold/70 mb-4">ANA'HAIR</div>
          <h1 className="t-display text-cream">
            {lang === "fr" ? "Questions Fréquentes" : "Frequently Asked Questions"}
          </h1>
        </div>
      </section>

      <div className="container-luxury max-w-2xl py-16">
        <div className="space-y-3" role="list">
          {faqData.map((item, i) => (
            <FaqItem
              key={i}
              item={item}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center p-8 border border-border bg-card">
          <p className="font-display text-lg text-forest mb-2">
            {lang === "fr" ? "Vous n'avez pas trouvé votre réponse ?" : "Didn't find your answer?"}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            {lang === "fr"
              ? "Notre équipe répond dans les 24h"
              : "Our team responds within 24 hours"}
          </p>
          <a href="/contact" className="btn-primary">
            {lang === "fr" ? "Nous contacter" : "Contact us"}
          </a>
        </div>
      </div>
    </div>
  );
};

export default FaqPage;
