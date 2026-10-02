DROP POLICY IF EXISTS "Anyone can read their just-inserted order" ON public.orders;
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
CREATE POLICY "Guests can submit pending orders" ON public.orders FOR INSERT TO anon, authenticated
WITH CHECK (
  (user_id IS NULL OR user_id = auth.uid())
  AND subscription_status = 'pending'
  AND project_status = 'received'
  AND website_status = 'disabled'
  AND start_date IS NULL
);

DROP POLICY IF EXISTS "Anyone can read their just-inserted renewal" ON public.renewals;
DROP POLICY IF EXISTS "Anyone can insert renewals" ON public.renewals;
CREATE POLICY "Guests can submit pending renewals" ON public.renewals FOR INSERT TO anon, authenticated
WITH CHECK (status = 'pending');

CREATE OR REPLACE FUNCTION public.generate_order_id()
 RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $function$
DECLARE
  new_order_id TEXT;
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  i INTEGER;
BEGIN
  IF NEW.order_id ~ '^CS-[A-Z0-9]{6}$' AND NOT EXISTS (SELECT 1 FROM public.orders WHERE order_id = NEW.order_id) THEN
    RETURN NEW;
  END IF;
  LOOP
    new_order_id := 'CS-';
    FOR i IN 1..6 LOOP
      new_order_id := new_order_id || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.orders WHERE order_id = new_order_id);
  END LOOP;
  NEW.order_id := new_order_id;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_renewal_id()
 RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $function$
DECLARE
  new_renewal_id TEXT;
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  i INTEGER;
BEGIN
  IF NEW.renewal_id ~ '^CSR-[A-Z0-9]{6}$' AND NOT EXISTS (SELECT 1 FROM public.renewals WHERE renewal_id = NEW.renewal_id) THEN
    RETURN NEW;
  END IF;
  LOOP
    new_renewal_id := 'CSR-';
    FOR i IN 1..6 LOOP
      new_renewal_id := new_renewal_id || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.renewals WHERE renewal_id = new_renewal_id);
  END LOOP;
  NEW.renewal_id := new_renewal_id;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.order_exists(_order_id text)
 RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$ SELECT EXISTS (SELECT 1 FROM public.orders WHERE order_id = upper(trim(_order_id))) $$;
GRANT EXECUTE ON FUNCTION public.order_exists(text) TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can view receipts" ON storage.objects;
CREATE POLICY "Staff can view receipts" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'receipts' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'viewer')));