import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useI18n } from "@/contexts/I18nContext";
import { useCart } from "@/contexts/CartContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatXof, formatEur } from "@/lib/format";
import { Check, ChevronLeft, ShoppingBag, Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
type DeliveryZone = Database["public"]["Enums"]["delivery_zone"];
type PaymentMethod = Database["public"]["Enums"]["payment_method"];

// ── STEP 1 SCHEMA ──
const step1Schema = z.object({
  customer_name:    z.string().min(2, "Nom trop court").max(100),
  customer_email:   z.string().email("Email invalide").max(255),
  customer_phone:   z.string().min(8, "Téléphone invalide").max(20),
  delivery_address: z.string().min(5, "Adresse requise").max(300),
  delivery_city:    z.string().min(2, "Ville requise").max(100),
  delivery_country: z.string().min(2).max(100),
});

type Step1Data = z.infer<typeof step1Schema>;

// ── STEP 2 SCHEMA ──
const step2Schema = z.object({
  delivery_zone:   z.string().min(1, "Choisir une zone de livraison"),
  payment_method:  z.enum(["cash_on_delivery", "mobile_money", "bank_transfer"]),
  notes:           z.string().max(500).optional(),
});

type Step2Data = z.infer<typeof step2Schema>;

const paymentMethods: { value: PaymentMethod; labelFr: string; labelEn: string }[] = [
  { value: "cash_on_delivery", labelFr: "Paiement à la livraison", labelEn: "Cash on delivery" },
  { value: "mobile_money",     labelFr: "Mobile Money (Wave, Orange, MTN…)", labelEn: "Mobile Money (Wave, Orange, MTN…)" },
  { value: "bank_transfer",    labelFr: "Virement bancaire",        labelEn: "Bank transfer" },
];

const StepIndicator: React.FC<{ step: number; current: number; label: string }> = ({
  step, current, label,
}) => {
  const done = step < current;
  const active = step === current;
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
          done
            ? "bg-gold text-forest"
            : active
            ? "bg-forest text-cream"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {done ? <Check size={12} /> : step}
      </div>
      <span
        className={`text-xs font-medium hidden sm:block ${
          active ? "text-forest" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </div>
  );
};

const CheckoutPage: React.FC = () => {
  const { lang, t } = useI18n();
  const { items, subtotalXof, subtotalEur, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<{ number: string } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: deliveryRates } = useQuery({
    queryKey: ["delivery-rates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("delivery_rates")
        .select("*")
        .eq("is_active", true)
        .order("price_xof");
      if (error) throw error;
      return data;
    },
  });

  // Forms
  const form1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { delivery_country: "Côte d'Ivoire" },
  });

  const form2 = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: { payment_method: "cash_on_delivery" },
  });

  // Redirect if cart empty
  if (items.length === 0 && !orderResult) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream gap-4 pt-[var(--nav-height)]">
        <ShoppingBag size={48} strokeWidth={1} className="text-muted-foreground/30" />
        <p className="font-display text-xl text-muted-foreground">{t("cart.empty")}</p>
        <Link to="/products" className="btn-primary">{t("nav.products")}</Link>
      </div>
    );
  }

  // Compute selected delivery rate
  const selectedRate = deliveryRates?.find((r) => r.zone === step2Data?.delivery_zone);
  const deliveryCostXof = selectedRate?.price_xof ?? 0;
  const deliveryCostEur = selectedRate ? Number(selectedRate.price_eur) : 0;
  const totalXof = subtotalXof + deliveryCostXof;
  const totalEur = subtotalEur !== null ? subtotalEur + deliveryCostEur : null;

  // ── STEP 1 SUBMIT ──
  const onStep1Submit = (data: Step1Data) => {
    setStep1Data(data);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── STEP 2 SUBMIT ──
  const onStep2Submit = (data: Step2Data) => {
    setStep2Data(data);
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── FINAL ORDER SUBMIT ──
  const handlePlaceOrder = async () => {
    if (!step1Data || !step2Data || !selectedRate) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Insert order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_name:     step1Data.customer_name,
          customer_email:    step1Data.customer_email,
          customer_phone:    step1Data.customer_phone,
          delivery_address:  step1Data.delivery_address,
          delivery_city:     step1Data.delivery_city,
          delivery_country:  step1Data.delivery_country,
          delivery_zone:     step2Data.delivery_zone as DeliveryZone,
          delivery_rate_id:  selectedRate.id,
          delivery_cost_xof: deliveryCostXof,
          delivery_cost_eur: deliveryCostEur,
          payment_method:    step2Data.payment_method as PaymentMethod,
          subtotal_xof:      subtotalXof,
          subtotal_eur:      subtotalEur ?? 0,
          total_xof:         totalXof,
          total_eur:         totalEur ?? 0,
          notes:             step2Data.notes ?? null,
          status:            "pending",
          order_number:      "",
        })
        .select("id, order_number")
        .single();

      if (orderError) throw orderError;

      // 2. Insert order items
      const orderItems = items.map((item) => ({
        order_id:           order.id,
        product_id:         item.productId,
        product_length_id:  item.id,
        product_name_fr:    item.nameFr,
        product_name_en:    item.nameEn,
        length_in:          item.lengthIn,
        quantity:           item.quantity,
        unit_price_xof:     item.priceXof,
        unit_price_eur:     item.priceEur,
        total_price_xof:    item.priceXof * item.quantity,
        total_price_eur:    item.priceEur ? item.priceEur * item.quantity : null,
        image_url:          item.imageUrl,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Clear cart and show confirmation
      clearCart();
      setOrderResult({ number: order.order_number });
      setStep(4);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setSubmitError(err.message ?? t("common.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── ORDER CONFIRMATION ──
  if (step === 4 && orderResult) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4 pt-[var(--nav-height)]">
        <div className="max-w-md w-full text-center py-16">
          <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
            <Check size={28} className="text-gold" />
          </div>
          <h1 className="t-display text-forest mb-3">{t("checkout.success")}</h1>
          <p className="text-muted-foreground mb-4">{t("checkout.successMsg")}</p>
          <div className="py-3 px-5 bg-card border border-border rounded-sm mb-8">
            <p className="t-label text-muted-foreground mb-1">
              {lang === "fr" ? "Numéro de commande" : "Order number"}
            </p>
            <p className="font-display text-xl text-forest">{orderResult.number}</p>
          </div>
          <Link to="/products" className="btn-primary">
            {lang === "fr" ? "Continuer mes achats" : "Continue shopping"}
          </Link>
        </div>
      </div>
    );
  }

  const stepLabels = [t("checkout.step1"), t("checkout.step2"), t("checkout.step3")];

  return (
    <div className="min-h-screen bg-cream pt-[var(--nav-height)]">
      <div className="container-luxury py-10 max-w-5xl">
        {/* Title */}
        <div className="text-center mb-10">
          <div className="section-eyebrow justify-center mb-3">{t("checkout.title")}</div>
          <h1 className="t-display-sm text-forest">
            {lang === "fr" ? "Finaliser votre commande" : "Complete your order"}
          </h1>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {[1, 2, 3].map((s, i) => (
            <React.Fragment key={s}>
              <StepIndicator step={s} current={step} label={stepLabels[i]} />
              {s < 3 && (
                <div className={`hidden sm:block flex-1 max-w-16 h-px transition-colors ${step > s ? "bg-gold" : "bg-border"}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form column */}
          <div className="lg:col-span-2">
            {/* ── STEP 1 ── */}
            {step === 1 && (
              <form
                onSubmit={form1.handleSubmit(onStep1Submit)}
                className="bg-card border border-border p-6 rounded-sm space-y-5"
                noValidate
              >
                <h2 className="font-display text-xl font-light text-forest mb-2">
                  {t("checkout.step1")}
                </h2>

                {[
                  { name: "customer_name",    label: t("checkout.name"),    type: "text",  autocomplete: "name" },
                  { name: "customer_email",   label: t("checkout.email"),   type: "email", autocomplete: "email" },
                  { name: "customer_phone",   label: t("checkout.phone"),   type: "tel",   autocomplete: "tel" },
                  { name: "delivery_address", label: t("checkout.address"), type: "text",  autocomplete: "street-address" },
                  { name: "delivery_city",    label: t("checkout.city"),    type: "text",  autocomplete: "address-level2" },
                  { name: "delivery_country", label: t("checkout.country"), type: "text",  autocomplete: "country-name" },
                ].map((field) => {
                  const error = form1.formState.errors[field.name as keyof Step1Data];
                  return (
                    <div key={field.name}>
                      <label className="t-label text-forest block mb-1.5" htmlFor={field.name}>
                        {field.label}
                      </label>
                      <input
                        id={field.name}
                        type={field.type}
                        autoComplete={field.autocomplete}
                        className={`input-luxury ${error ? "border-destructive focus:border-destructive" : ""}`}
                        {...form1.register(field.name as keyof Step1Data)}
                      />
                      {error && (
                        <p className="text-xs text-destructive mt-1" role="alert">
                          {error.message}
                        </p>
                      )}
                    </div>
                  );
                })}

                <button type="submit" className="btn-primary w-full mt-2">
                  {t("checkout.next")}
                </button>
              </form>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <form
                onSubmit={form2.handleSubmit(onStep2Submit)}
                className="bg-card border border-border p-6 rounded-sm space-y-6"
                noValidate
              >
                <div className="flex items-center gap-3 mb-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-muted-foreground hover:text-forest transition-colors"
                    aria-label={t("checkout.back")}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <h2 className="font-display text-xl font-light text-forest">
                    {t("checkout.step2")}
                  </h2>
                </div>

                {/* Delivery zone */}
                <div>
                  <p className="t-label text-forest mb-3">{t("checkout.delivery")}</p>
                  {deliveryRates?.map((rate) => {
                    const selected = form2.watch("delivery_zone") === rate.zone;
                    return (
                      <label
                        key={rate.zone}
                        className={`flex items-center justify-between p-4 border cursor-pointer transition-all mb-2 ${
                          selected ? "border-gold bg-gold/5" : "border-border hover:border-forest/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            value={rate.zone}
                            className="accent-gold"
                            {...form2.register("delivery_zone")}
                          />
                          <div>
                            <p className="text-sm font-medium text-forest">
                              {lang === "fr" ? rate.name_fr : rate.name_en}
                            </p>
                            <p className="text-xs text-muted-foreground">{rate.delay_days}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-forest">
                            {rate.price_xof > 0 ? formatXof(rate.price_xof) : rate.price_eur > 0 ? formatEur(Number(rate.price_eur)) : (lang === "fr" ? "Gratuit" : "Free")}
                          </p>
                          {rate.price_eur > 0 && rate.price_xof > 0 && (
                            <p className="text-xs text-muted-foreground">{formatEur(Number(rate.price_eur))}</p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                  {form2.formState.errors.delivery_zone && (
                    <p className="text-xs text-destructive mt-1" role="alert">
                      {form2.formState.errors.delivery_zone.message}
                    </p>
                  )}
                </div>

                {/* Payment method */}
                <div>
                  <p className="t-label text-forest mb-3">{t("checkout.payment")}</p>
                  {paymentMethods.map((pm) => {
                    const selected = form2.watch("payment_method") === pm.value;
                    return (
                      <label
                        key={pm.value}
                        className={`flex items-center gap-3 p-4 border cursor-pointer transition-all mb-2 ${
                          selected ? "border-gold bg-gold/5" : "border-border hover:border-forest/30"
                        }`}
                      >
                        <input
                          type="radio"
                          value={pm.value}
                          className="accent-gold"
                          {...form2.register("payment_method")}
                        />
                        <span className="text-sm text-forest">
                          {lang === "fr" ? pm.labelFr : pm.labelEn}
                        </span>
                      </label>
                    );
                  })}
                </div>

                {/* Notes */}
                <div>
                  <label className="t-label text-forest block mb-1.5" htmlFor="notes">
                    {lang === "fr" ? "Instructions de livraison (optionnel)" : "Delivery instructions (optional)"}
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    className="input-luxury resize-none"
                    {...form2.register("notes")}
                  />
                </div>

                <button type="submit" className="btn-primary w-full">
                  {t("checkout.next")}
                </button>
              </form>
            )}

            {/* ── STEP 3: REVIEW ── */}
            {step === 3 && step1Data && step2Data && (
              <div className="bg-card border border-border p-6 rounded-sm space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-muted-foreground hover:text-forest transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <h2 className="font-display text-xl font-light text-forest">
                    {t("checkout.step3")}
                  </h2>
                </div>

                {/* Customer info review */}
                <div>
                  <p className="t-label text-muted-foreground mb-3">{t("checkout.step1")}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {[
                      [t("checkout.name"),    step1Data.customer_name],
                      [t("checkout.email"),   step1Data.customer_email],
                      [t("checkout.phone"),   step1Data.customer_phone],
                      [t("checkout.address"), `${step1Data.delivery_address}, ${step1Data.delivery_city}`],
                    ].map(([label, value]) => (
                      <React.Fragment key={label}>
                        <p className="text-muted-foreground">{label}</p>
                        <p className="text-forest font-medium">{value}</p>
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="t-label text-muted-foreground mb-3">{t("checkout.step2")}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p className="text-muted-foreground">{t("checkout.delivery")}</p>
                    <p className="text-forest font-medium">
                      {lang === "fr" ? selectedRate?.name_fr : selectedRate?.name_en}
                    </p>
                    <p className="text-muted-foreground">{t("checkout.payment")}</p>
                    <p className="text-forest font-medium">
                      {paymentMethods.find((p) => p.value === step2Data.payment_method)?.[lang === "fr" ? "labelFr" : "labelEn"]}
                    </p>
                  </div>
                </div>

                {submitError && (
                  <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-sm" role="alert">
                    {submitError}
                  </p>
                )}

                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="btn-gold w-full"
                >
                  {isSubmitting ? (
                    <><Loader2 size={16} className="animate-spin" /> {lang === "fr" ? "Envoi..." : "Placing..."}</>
                  ) : (
                    t("checkout.placeOrder")
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div>
            <div className="bg-card border border-border p-5 rounded-sm sticky top-[calc(var(--nav-height)+16px)]">
              <h2 className="font-display text-base font-light text-forest mb-4">
                {t("checkout.orderSummary")}
              </h2>

              <ul className="divide-y divide-border mb-4">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-3 py-3">
                    <div className="w-12 h-12 bg-muted rounded-sm flex-shrink-0 overflow-hidden">
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt={lang === "fr" ? item.nameFr : item.nameEn} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-forest truncate">
                        {lang === "fr" ? item.nameFr : item.nameEn}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.lengthIn}" × {item.quantity}</p>
                    </div>
                    <p className="text-xs font-medium text-forest">
                      {formatXof(item.priceXof * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="space-y-2 text-sm border-t border-border pt-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                  <span className="text-forest">{formatXof(subtotalXof)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("checkout.delivery")}</span>
                  <span className="text-forest">
                    {selectedRate
                      ? deliveryCostXof > 0
                        ? formatXof(deliveryCostXof)
                        : (lang === "fr" ? "Gratuit" : "Free")
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between font-medium border-t border-border pt-2 mt-2">
                  <span className="text-forest">{t("checkout.total")}</span>
                  <div className="text-right">
                    <p className="text-forest font-display text-lg">{formatXof(totalXof)}</p>
                    {totalEur !== null && (
                      <p className="text-xs text-muted-foreground">{formatEur(totalEur)}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
