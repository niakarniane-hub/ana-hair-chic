import React, { useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Phone, MapPin, Instagram, CheckCircle, Loader2 } from "lucide-react";

const schema = z.object({
  name:    z.string().min(2).max(100),
  email:   z.string().email().max(255),
  subject: z.string().min(2).max(200),
  message: z.string().min(10).max(2000),
});
type FormData = z.infer<typeof schema>;

const ContactPage: React.FC = () => {
  const { lang, t } = useI18n();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (_data: FormData) => {
    setLoading(true);
    // Simulate API call — in production this would call a Supabase edge function
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
    reset();
  };

  const contactInfo = [
    { icon: Mail,     labelFr: "Email", labelEn: "Email",   value: "contact@anahair.com", href: "mailto:contact@anahair.com" },
    { icon: Phone,    labelFr: "Téléphone", labelEn: "Phone", value: "+225 XX XX XX XX XX", href: "tel:+225XXXXXXXXXX" },
    { icon: Instagram,labelFr: "Instagram", labelEn: "Instagram", value: "@anahair_officiel", href: "https://instagram.com/anahair_officiel" },
    { icon: MapPin,   labelFr: "Adresse",   labelEn: "Address",   value: "Abidjan, Côte d'Ivoire", href: null },
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-forest pt-[var(--nav-height)] pb-14">
        <div className="container-luxury text-center pt-10">
          <div className="section-eyebrow justify-center text-gold/70 mb-4">ANA'HAIR</div>
          <h1 className="t-display text-cream">
            {lang === "fr" ? "Nous Contacter" : "Contact Us"}
          </h1>
        </div>
      </section>

      <div className="container-luxury max-w-4xl py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact form */}
          <div>
            <h2 className="font-display text-xl font-light text-forest mb-6">
              {lang === "fr" ? "Envoyez-nous un message" : "Send us a message"}
            </h2>

            {submitted ? (
              <div className="flex flex-col items-center gap-4 py-12 text-center">
                <CheckCircle size={40} className="text-gold" />
                <p className="font-display text-xl text-forest">{t("contact.success")}</p>
                <p className="text-sm text-muted-foreground">
                  {lang === "fr" ? "Nous vous répondrons dans les 24h." : "We will reply within 24 hours."}
                </p>
                <button onClick={() => setSubmitted(false)} className="btn-outline mt-2">
                  {lang === "fr" ? "Nouveau message" : "New message"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                {[
                  { name: "name",    type: "text",   labelFr: "Nom complet",     labelEn: "Full name" },
                  { name: "email",   type: "email",  labelFr: "Email",           labelEn: "Email" },
                  { name: "subject", type: "text",   labelFr: "Objet",           labelEn: "Subject" },
                ].map((f) => {
                  const err = errors[f.name as keyof FormData];
                  return (
                    <div key={f.name}>
                      <label className="t-label text-forest block mb-1.5" htmlFor={f.name}>
                        {lang === "fr" ? f.labelFr : f.labelEn}
                      </label>
                      <input
                        id={f.name}
                        type={f.type}
                        className={`input-luxury ${err ? "border-destructive" : ""}`}
                        {...register(f.name as keyof FormData)}
                      />
                      {err && (
                        <p className="text-xs text-destructive mt-1" role="alert">
                          {err.message}
                        </p>
                      )}
                    </div>
                  );
                })}

                <div>
                  <label className="t-label text-forest block mb-1.5" htmlFor="message">
                    {lang === "fr" ? "Message" : "Message"}
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    className={`input-luxury resize-none ${errors.message ? "border-destructive" : ""}`}
                    {...register("message")}
                  />
                  {errors.message && (
                    <p className="text-xs text-destructive mt-1" role="alert">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? (
                    <><Loader2 size={15} className="animate-spin" /> {lang === "fr" ? "Envoi..." : "Sending..."}</>
                  ) : (
                    t("contact.send")
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Contact info */}
          <div>
            <h2 className="font-display text-xl font-light text-forest mb-6">
              {lang === "fr" ? "Informations de contact" : "Contact information"}
            </h2>

            <div className="space-y-5">
              {contactInfo.map((info) => {
                const Icon = info.icon;
                return (
                  <div key={info.labelFr} className="flex items-start gap-4">
                    <div className="w-9 h-9 border border-border flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className="text-gold" />
                    </div>
                    <div>
                      <p className="t-label text-muted-foreground mb-0.5">
                        {lang === "fr" ? info.labelFr : info.labelEn}
                      </p>
                      {info.href ? (
                        <a href={info.href} className="text-sm text-forest hover:text-gold transition-colors link-hover">
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-sm text-forest">{info.value}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hours */}
            <div className="mt-8 p-5 border border-border bg-card">
              <p className="t-label text-muted-foreground mb-3">
                {lang === "fr" ? "Horaires d'assistance" : "Support hours"}
              </p>
              <div className="space-y-1 text-sm text-forest">
                <p>{lang === "fr" ? "Lun – Ven : 8h – 20h (GMT)" : "Mon – Fri: 8am – 8pm (GMT)"}</p>
                <p>{lang === "fr" ? "Sam : 9h – 17h" : "Sat: 9am – 5pm"}</p>
                <p className="text-muted-foreground text-xs mt-2">
                  {lang === "fr" ? "Réponse sous 24h en semaine" : "Response within 24h on weekdays"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
