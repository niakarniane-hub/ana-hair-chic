import React, { createContext, useContext, useState, useCallback } from "react";

type Lang = "fr" | "en";

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Lang, string>> = {
  // ── NAV ──
  "nav.home":       { fr: "Accueil",    en: "Home" },
  "nav.products":   { fr: "Produits",   en: "Products" },
  "nav.about":      { fr: "À Propos",   en: "About" },
  "nav.contact":    { fr: "Contact",    en: "Contact" },
  "nav.faq":        { fr: "FAQ",        en: "FAQ" },
  "nav.cart":       { fr: "Panier",     en: "Cart" },

  // ── HERO ──
  "hero.eyebrow":   { fr: "Collection Signature",  en: "Signature Collection" },
  "hero.title1":    { fr: "L'Art des",              en: "The Art of" },
  "hero.title2":    { fr: "Extensions",             en: "Hair" },
  "hero.title3":    { fr: "de Luxe",                en: "Extensions" },
  "hero.subtitle":  { fr: "Extensions capillaires 100% naturelles, sélectionnées pour leur qualité exceptionnelle et leur éclat inégalé.", en: "100% natural hair extensions, selected for their exceptional quality and unmatched shine." },
  "hero.cta1":      { fr: "Découvrir la collection", en: "Explore the Collection" },
  "hero.cta2":      { fr: "Notre histoire",          en: "Our Story" },

  // ── PRODUCTS ──
  "products.title":       { fr: "Notre Collection",        en: "Our Collection" },
  "products.subtitle":    { fr: "Extensions capillaires premium",  en: "Premium Hair Extensions" },
  "products.addToCart":   { fr: "Ajouter au panier",        en: "Add to Cart" },
  "products.selectLength":{ fr: "Choisir la longueur",      en: "Select Length" },
  "products.inStock":     { fr: "En stock",                 en: "In stock" },
  "products.lowStock":    { fr: "Stock limité",             en: "Low stock" },
  "products.outOfStock":  { fr: "Rupture de stock",         en: "Out of stock" },
  "products.inches":      { fr: "pouces",                   en: "inches" },
  "products.viewAll":     { fr: "Voir tout",                en: "View all" },
  "products.quickView":   { fr: "Aperçu rapide",            en: "Quick view" },
  "products.noProducts":  { fr: "Aucun produit disponible", en: "No products available" },

  // ── CART ──
  "cart.title":       { fr: "Mon Panier",         en: "My Cart" },
  "cart.empty":       { fr: "Votre panier est vide", en: "Your cart is empty" },
  "cart.subtotal":    { fr: "Sous-total",          en: "Subtotal" },
  "cart.checkout":    { fr: "Commander",           en: "Checkout" },
  "cart.continue":    { fr: "Continuer mes achats", en: "Continue shopping" },
  "cart.remove":      { fr: "Supprimer",           en: "Remove" },
  "cart.itemAdded":   { fr: "Ajouté au panier",    en: "Added to cart" },

  // ── CHECKOUT ──
  "checkout.title":       { fr: "Commander",            en: "Checkout" },
  "checkout.step1":       { fr: "Vos Informations",     en: "Your Information" },
  "checkout.step2":       { fr: "Livraison & Paiement", en: "Delivery & Payment" },
  "checkout.step3":       { fr: "Confirmation",         en: "Confirmation" },
  "checkout.name":        { fr: "Nom complet",          en: "Full name" },
  "checkout.email":       { fr: "Adresse e-mail",       en: "Email address" },
  "checkout.phone":       { fr: "Téléphone",            en: "Phone" },
  "checkout.address":     { fr: "Adresse de livraison", en: "Delivery address" },
  "checkout.city":        { fr: "Ville",                en: "City" },
  "checkout.country":     { fr: "Pays",                 en: "Country" },
  "checkout.next":        { fr: "Continuer",            en: "Continue" },
  "checkout.back":        { fr: "Retour",               en: "Back" },
  "checkout.placeOrder":  { fr: "Passer la commande",   en: "Place Order" },
  "checkout.orderSummary":{ fr: "Récapitulatif",        en: "Order Summary" },
  "checkout.delivery":    { fr: "Livraison",            en: "Delivery" },
  "checkout.total":       { fr: "Total",                en: "Total" },
  "checkout.payment":     { fr: "Mode de paiement",     en: "Payment method" },
  "checkout.cod":         { fr: "Paiement à la livraison", en: "Cash on delivery" },
  "checkout.mobile":      { fr: "Mobile Money",         en: "Mobile Money" },
  "checkout.transfer":    { fr: "Virement bancaire",    en: "Bank transfer" },
  "checkout.success":     { fr: "Commande confirmée !", en: "Order confirmed!" },
  "checkout.successMsg":  { fr: "Nous avons bien reçu votre commande. Vous recevrez une confirmation par email.",
                            en: "We have received your order. You will receive a confirmation by email." },

  // ── ABOUT ──
  "about.title":    { fr: "Notre Histoire", en: "Our Story" },
  "about.mission":  { fr: "Notre Mission",  en: "Our Mission" },

  // ── CONTACT ──
  "contact.title":    { fr: "Nous Contacter", en: "Contact Us" },
  "contact.send":     { fr: "Envoyer",         en: "Send" },
  "contact.success":  { fr: "Message envoyé !", en: "Message sent!" },

  // ── FAQ ──
  "faq.title":    { fr: "Questions Fréquentes", en: "Frequently Asked Questions" },

  // ── FOOTER ──
  "footer.tagline": { fr: "Extensions capillaires de luxe", en: "Luxury hair extensions" },
  "footer.rights":  { fr: "Tous droits réservés",           en: "All rights reserved" },

  // ── COMMON ──
  "common.loading":   { fr: "Chargement...",      en: "Loading..." },
  "common.error":     { fr: "Une erreur est survenue", en: "An error occurred" },
  "common.retry":     { fr: "Réessayer",           en: "Retry" },
  "common.close":     { fr: "Fermer",              en: "Close" },
  "common.save":      { fr: "Enregistrer",         en: "Save" },
  "common.cancel":    { fr: "Annuler",             en: "Cancel" },
  "common.delete":    { fr: "Supprimer",           en: "Delete" },
  "common.edit":      { fr: "Modifier",            en: "Edit" },
  "common.search":    { fr: "Rechercher",          en: "Search" },
  "common.of":        { fr: "de",                  en: "of" },
  "common.items":     { fr: "articles",            en: "items" },
};

const I18nContext = createContext<I18nContextValue>({
  lang: "fr",
  setLang: () => {},
  t: (key) => key,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem("anahair-lang");
    return (stored === "en" || stored === "fr") ? stored : "fr";
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("anahair-lang", l);
    document.documentElement.lang = l;
  }, []);

  const t = useCallback(
    (key: string): string => {
      return translations[key]?.[lang] ?? translations[key]?.fr ?? key;
    },
    [lang],
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
