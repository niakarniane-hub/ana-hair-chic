
-- ============================================================
-- ANA'HAIR — PRODUCTION DATABASE SCHEMA
-- ============================================================

-- ───────────────── ENUMS ─────────────────
CREATE TYPE public.order_status AS ENUM (
  'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
);

CREATE TYPE public.payment_method AS ENUM (
  'cash_on_delivery', 'mobile_money', 'stripe', 'bank_transfer'
);

CREATE TYPE public.delivery_zone AS ENUM (
  'abidjan', 'cote_ivoire_interior', 'senegal', 'mali', 'burkina_faso',
  'other_west_africa', 'france', 'international'
);

CREATE TYPE public.app_role AS ENUM ('admin', 'moderator');

-- ───────────────── TIMESTAMPS UTILITY ─────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ───────────────── USER ROLES ─────────────────
CREATE TABLE public.user_roles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (true);

-- Security-definer function to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- ───────────────── CATEGORIES ─────────────────
CREATE TABLE public.categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT NOT NULL UNIQUE,
  name_fr     TEXT NOT NULL,
  name_en     TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are publicly readable"
  ON public.categories FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ───────────────── PRODUCTS ─────────────────
CREATE TABLE public.products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  slug            TEXT NOT NULL UNIQUE,
  name_fr         TEXT NOT NULL,
  name_en         TEXT NOT NULL,
  description_fr  TEXT,
  description_en  TEXT,
  image_url       TEXT,
  images          TEXT[] DEFAULT '{}',
  is_active       BOOLEAN NOT NULL DEFAULT true,
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active products are publicly readable"
  ON public.products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_active ON public.products(is_active);
CREATE INDEX idx_products_featured ON public.products(is_featured);

-- ───────────────── PRODUCT LENGTHS (VARIANTS) ─────────────────
CREATE TABLE public.product_lengths (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  length_in    INTEGER NOT NULL CHECK (length_in > 0),
  price_xof    INTEGER NOT NULL CHECK (price_xof >= 0),
  price_eur    NUMERIC(10,2) CHECK (price_eur >= 0),
  stock        INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  sku          TEXT UNIQUE,
  weight_g     INTEGER,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, length_in)
);

ALTER TABLE public.product_lengths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active product lengths are publicly readable"
  ON public.product_lengths FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage product lengths"
  ON public.product_lengths FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_product_lengths_updated_at
  BEFORE UPDATE ON public.product_lengths
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_product_lengths_product ON public.product_lengths(product_id);

-- ───────────────── DELIVERY RATES ─────────────────
CREATE TABLE public.delivery_rates (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone         public.delivery_zone NOT NULL UNIQUE,
  name_fr      TEXT NOT NULL,
  name_en      TEXT NOT NULL,
  price_xof    INTEGER NOT NULL DEFAULT 0,
  price_eur    NUMERIC(10,2) NOT NULL DEFAULT 0,
  delay_days   TEXT NOT NULL DEFAULT '3-5 jours',
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.delivery_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Delivery rates are publicly readable"
  ON public.delivery_rates FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage delivery rates"
  ON public.delivery_rates FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ───────────────── ORDERS ─────────────────
CREATE TABLE public.orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number     TEXT NOT NULL UNIQUE,
  user_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name    TEXT NOT NULL,
  customer_email   TEXT NOT NULL CHECK (customer_email ~* '^[^@]+@[^@]+\.[^@]+$'),
  customer_phone   TEXT NOT NULL,
  delivery_zone    public.delivery_zone,
  delivery_address TEXT NOT NULL,
  delivery_city    TEXT NOT NULL,
  delivery_country TEXT NOT NULL DEFAULT 'CI',
  delivery_rate_id UUID REFERENCES public.delivery_rates(id),
  delivery_cost_xof INTEGER NOT NULL DEFAULT 0,
  delivery_cost_eur NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method   public.payment_method NOT NULL DEFAULT 'cash_on_delivery',
  payment_status   TEXT NOT NULL DEFAULT 'pending',
  payment_ref      TEXT,
  subtotal_xof     INTEGER NOT NULL DEFAULT 0,
  subtotal_eur     NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_xof        INTEGER NOT NULL DEFAULT 0,
  total_eur        NUMERIC(10,2) NOT NULL DEFAULT 0,
  status           public.order_status NOT NULL DEFAULT 'pending',
  notes            TEXT,
  admin_notes      TEXT,
  ip_address       INET,
  created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Orders viewable by owner or admin"
  ON public.orders FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Anyone can create an order"
  ON public.orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_email ON public.orders(customer_email);
CREATE INDEX idx_orders_number ON public.orders(order_number);

-- ───────────────── ORDER ITEMS ─────────────────
CREATE TABLE public.order_items (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id          UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  product_length_id   UUID NOT NULL REFERENCES public.product_lengths(id) ON DELETE RESTRICT,
  product_name_fr     TEXT NOT NULL,
  product_name_en     TEXT NOT NULL,
  length_in           INTEGER NOT NULL,
  quantity            INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_xof      INTEGER NOT NULL,
  unit_price_eur      NUMERIC(10,2),
  total_price_xof     INTEGER NOT NULL,
  total_price_eur     NUMERIC(10,2),
  image_url           TEXT,
  created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Order items viewable via order access"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id
      AND (o.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Order items insertable with order"
  ON public.order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage order items"
  ON public.order_items FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_order_items_product ON public.order_items(product_id);

-- ───────────────── ORDER NUMBER GENERATOR ─────────────────
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  v_number TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    v_number := 'AH-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 6));
    SELECT EXISTS(SELECT 1 FROM public.orders WHERE order_number = v_number) INTO v_exists;
    EXIT WHEN NOT v_exists;
  END LOOP;
  RETURN v_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := public.generate_order_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_order_number_trigger
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_order_number();

-- ───────────────── SEED: CATEGORIES ─────────────────
INSERT INTO public.categories (slug, name_fr, name_en, sort_order) VALUES
  ('extensions-naturelles', 'Extensions Naturelles', 'Natural Extensions', 1),
  ('extensions-synthetiques', 'Extensions Synthétiques', 'Synthetic Extensions', 2),
  ('soins', 'Soins Capillaires', 'Hair Care', 3);

-- ───────────────── SEED: DELIVERY RATES ─────────────────
INSERT INTO public.delivery_rates (zone, name_fr, name_en, price_xof, price_eur, delay_days) VALUES
  ('abidjan', 'Abidjan', 'Abidjan', 2000, 3.00, '24-48h'),
  ('cote_ivoire_interior', 'Côte d''Ivoire (Intérieur)', 'Ivory Coast (Interior)', 5000, 7.50, '3-5 jours'),
  ('senegal', 'Sénégal', 'Senegal', 8000, 12.00, '5-7 jours'),
  ('mali', 'Mali', 'Mali', 8000, 12.00, '5-7 jours'),
  ('burkina_faso', 'Burkina Faso', 'Burkina Faso', 8000, 12.00, '5-7 jours'),
  ('other_west_africa', 'Afrique de l''Ouest (autres)', 'West Africa (other)', 10000, 15.00, '7-10 jours'),
  ('france', 'France', 'France', 0, 9.90, '5-7 jours'),
  ('international', 'International', 'International', 0, 19.90, '10-15 jours');

-- ───────────────── SEED: SAMPLE PRODUCTS ─────────────────
WITH cat AS (SELECT id FROM public.categories WHERE slug = 'extensions-naturelles')
INSERT INTO public.products (category_id, slug, name_fr, name_en, description_fr, description_en, is_featured, sort_order)
SELECT
  cat.id, v.slug, v.name_fr, v.name_en, v.description_fr, v.description_en, v.is_featured, v.sort_order
FROM cat, (VALUES
  ('lisse-naturel', 'Lisse Naturel', 'Natural Straight',
   'Extensions 100% cheveux naturels, lisses et brillants. Texture légère pour un résultat naturel et élégant.',
   '100% natural hair extensions, straight and glossy. Light texture for a natural and elegant result.',
   true, 1),
  ('ondule-signature', 'Ondulé Signature', 'Signature Wavy',
   'Notre bestseller. Ondulations douces qui s''intègrent parfaitement à tous les types de cheveux.',
   'Our bestseller. Soft waves that blend perfectly with all hair types.',
   true, 2),
  ('bouclettes-premium', 'Bouclettes Premium', 'Premium Curly',
   'Boucles serrées et rebondissantes pour un look naturel et volumieux. Résistant à l''humidité.',
   'Tight, bouncy curls for a natural, voluminous look. Humidity resistant.',
   true, 3),
  ('deep-wave', 'Deep Wave', 'Deep Wave',
   'Vagues profondes et sensuelles. Texture riche en volume pour les occasions spéciales.',
   'Deep, sensual waves. Volume-rich texture for special occasions.',
   false, 4)
) AS v(slug, name_fr, name_en, description_fr, description_en, is_featured, sort_order);

-- ───────────────── SEED: PRODUCT LENGTHS ─────────────────
INSERT INTO public.product_lengths (product_id, length_in, price_xof, price_eur, stock)
SELECT p.id, v.length_in, v.price_xof, v.price_eur, v.stock
FROM public.products p
CROSS JOIN (VALUES
  (12, 35000, 53.00, 25),
  (16, 45000, 68.00, 30),
  (20, 58000, 88.00, 20),
  (24, 72000, 109.00, 15)
) AS v(length_in, price_xof, price_eur, stock);
