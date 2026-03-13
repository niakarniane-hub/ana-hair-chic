import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Mail, Phone } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

const Footer: React.FC = () => {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-forest text-cream/80" role="contentinfo">
      {/* Gold top border */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold to-transparent" />

      <div className="container-luxury py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="font-display text-3xl font-light tracking-[0.15em] text-cream hover:opacity-80 transition-opacity">
              ANA<span className="text-gold">'</span>HAIR
            </Link>
            <p className="mt-3 text-sm font-light text-cream/50 italic font-display">
              {t("footer.tagline")}
            </p>
            <p className="mt-5 text-sm font-light leading-relaxed max-w-xs text-cream/60">
              Extensions capillaires 100% naturelles, sélectionnées avec soin pour sublimer votre beauté naturelle.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="https://instagram.com/anahair"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-cream/20 flex items-center justify-center hover:border-gold hover:text-gold transition-all duration-200"
                aria-label="Instagram ANA'HAIR"
              >
                <Instagram size={16} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="t-label text-gold mb-5">Navigation</h3>
            <ul className="space-y-3 text-sm font-light">
              {[
                { label: t("nav.home"),     href: "/" },
                { label: t("nav.products"), href: "/products" },
                { label: t("nav.about"),    href: "/about" },
                { label: t("nav.contact"),  href: "/contact" },
                { label: t("nav.faq"),      href: "/faq" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    to={l.href}
                    className="hover:text-gold transition-colors link-hover"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="t-label text-gold mb-5">Contact</h3>
            <ul className="space-y-3 text-sm font-light">
              <li className="flex items-center gap-2 text-cream/60">
                <Mail size={14} className="text-gold flex-shrink-0" />
                <a href="mailto:contact@anahair.com" className="hover:text-gold transition-colors">
                  contact@anahair.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-cream/60">
                <Phone size={14} className="text-gold flex-shrink-0" />
                <span>+225 XX XX XX XX XX</span>
              </li>
            </ul>
            <div className="mt-8">
              <p className="t-label text-cream/40 mb-2">Paiements acceptés</p>
              <div className="flex flex-wrap gap-2 text-[10px] font-medium tracking-wider">
                {["VISA", "M-PESA", "ORANGE", "WAVE"].map((p) => (
                  <span key={p} className="px-2 py-1 border border-cream/15 text-cream/40 rounded-sm">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-cream/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-cream/30">
          <p>© {year} ANA'HAIR. {t("footer.rights")}.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-cream/60 transition-colors">Politique de confidentialité</a>
            <a href="#" className="hover:text-cream/60 transition-colors">CGV</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
