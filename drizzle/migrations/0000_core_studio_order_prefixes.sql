CREATE OR REPLACE FUNCTION public.generate_order_id()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $function$
DECLARE
  new_order_id TEXT;
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  i INTEGER;
BEGIN
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
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $function$
DECLARE
  new_renewal_id TEXT;
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  i INTEGER;
BEGIN
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