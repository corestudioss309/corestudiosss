-- Create enums for status tracking
CREATE TYPE subscription_status AS ENUM ('pending', 'active', 'suspended', 'expired', 'renewed', 'didnt_renew', 'fake_order');
CREATE TYPE project_status AS ENUM ('received', 'in_progress', 'delivered');
CREATE TYPE website_status AS ENUM ('live', 'disabled', 'maintenance', 'paused');

-- Create profiles table for client data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  whatsapp TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table for subscriptions
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  website_requirements TEXT,
  setup_fee INTEGER NOT NULL DEFAULT 1500,
  monthly_fee INTEGER NOT NULL DEFAULT 500,
  custom_domain_addon BOOLEAN NOT NULL DEFAULT false,
  business_email_addon BOOLEAN NOT NULL DEFAULT false,
  addon_total INTEGER NOT NULL DEFAULT 0,
  subscription_status subscription_status NOT NULL DEFAULT 'pending',
  project_status project_status NOT NULL DEFAULT 'received',
  website_status website_status NOT NULL DEFAULT 'disabled',
  start_date TIMESTAMP WITH TIME ZONE,
  renewal_date TIMESTAMP WITH TIME ZONE,
  payment_method TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payment_settings table for admin configuration
CREATE TABLE public.payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instapay_account_number TEXT DEFAULT '01092291259',
  instapay_username TEXT DEFAULT 'abdelrahman.afia203@instapay',
  instapay_link TEXT DEFAULT 'https://ipn.eg/S/abdelrahman.afia203/instapay/3j1lcA',
  instapay_qr_url TEXT,
  vodafone_number TEXT DEFAULT '01033865141',
  vodafone_link TEXT DEFAULT 'http://vf.eg/vfcash?id=mt&qrId=nXKEKr',
  vodafone_qr_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create addon_settings table for admin configuration
CREATE TABLE public.addon_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_domain_price INTEGER NOT NULL DEFAULT 2000,
  custom_domain_enabled BOOLEAN NOT NULL DEFAULT true,
  business_email_price INTEGER NOT NULL DEFAULT 4000,
  business_email_enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default rows
INSERT INTO public.payment_settings (id) VALUES (gen_random_uuid());
INSERT INTO public.addon_settings (id) VALUES (gen_random_uuid());

-- Create function to generate unique order ID
CREATE OR REPLACE FUNCTION public.generate_order_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_order_id TEXT;
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  i INTEGER;
BEGIN
  LOOP
    new_order_id := 'SNP-';
    FOR i IN 1..6 LOOP
      new_order_id := new_order_id || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    -- Check if this order_id already exists
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.orders WHERE order_id = new_order_id);
  END LOOP;
  
  NEW.order_id := new_order_id;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-generate order_id
CREATE TRIGGER trigger_generate_order_id
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  WHEN (NEW.order_id IS NULL OR NEW.order_id = '')
  EXECUTE FUNCTION public.generate_order_id();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_settings_updated_at
  BEFORE UPDATE ON public.payment_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_addon_settings_updated_at
  BEFORE UPDATE ON public.addon_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addon_settings ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Orders RLS policies
CREATE POLICY "Anyone can insert orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all orders"
  ON public.orders FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete orders"
  ON public.orders FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Payment settings RLS policies
CREATE POLICY "Anyone can view payment settings"
  ON public.payment_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can update payment settings"
  ON public.payment_settings FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Addon settings RLS policies
CREATE POLICY "Anyone can view addon settings"
  ON public.addon_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can update addon settings"
  ON public.addon_settings FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true);

-- Storage policies for receipts bucket
CREATE POLICY "Anyone can view receipts"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'receipts');

CREATE POLICY "Authenticated users can upload receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Admins can delete receipts"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'receipts' AND has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_orders_order_id ON public.orders(order_id);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_subscription_status ON public.orders(subscription_status);
CREATE INDEX idx_orders_renewal_date ON public.orders(renewal_date);