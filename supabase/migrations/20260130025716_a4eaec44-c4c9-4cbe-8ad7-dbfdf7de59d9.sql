-- Create renewal status enum
CREATE TYPE public.renewal_status AS ENUM ('pending', 'confirmed', 'rejected');

-- Create renewals table
CREATE TABLE public.renewals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  renewal_id text NOT NULL UNIQUE,
  original_order_id text NOT NULL,
  full_name text NOT NULL,
  business_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  whatsapp text NOT NULL,
  renewal_fee integer NOT NULL,
  payment_method text,
  receipt_url text,
  coupon_code text,
  coupon_discount integer NOT NULL DEFAULT 0,
  status public.renewal_status NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.renewals ENABLE ROW LEVEL SECURITY;

-- Create function to generate renewal ID
CREATE OR REPLACE FUNCTION public.generate_renewal_id()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_renewal_id TEXT;
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  i INTEGER;
BEGIN
  LOOP
    new_renewal_id := 'RNW-';
    FOR i IN 1..6 LOOP
      new_renewal_id := new_renewal_id || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    -- Check if this renewal_id already exists
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.renewals WHERE renewal_id = new_renewal_id);
  END LOOP;
  
  NEW.renewal_id := new_renewal_id;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-generate renewal_id
CREATE TRIGGER generate_renewal_id_trigger
BEFORE INSERT ON public.renewals
FOR EACH ROW
EXECUTE FUNCTION public.generate_renewal_id();

-- RLS Policies
-- Anyone can insert renewals (public checkout)
CREATE POLICY "Anyone can insert renewals"
ON public.renewals
FOR INSERT
WITH CHECK (true);

-- Admins can view all renewals
CREATE POLICY "Admins can view all renewals"
ON public.renewals
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update renewals
CREATE POLICY "Admins can update renewals"
ON public.renewals
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete renewals
CREATE POLICY "Admins can delete renewals"
ON public.renewals
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));