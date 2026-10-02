-- Function to generate order IDs like SNP-0001, SNP-0002, etc.
CREATE OR REPLACE FUNCTION public.generate_order_id()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_id FROM 5) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.orders
  WHERE order_id ~ '^SNP-[0-9]+$';
  
  NEW.order_id := 'SNP-' || LPAD(next_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Function to generate renewal IDs like RNW-0001, RNW-0002, etc.
CREATE OR REPLACE FUNCTION public.generate_renewal_id()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(renewal_id FROM 5) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.renewals
  WHERE renewal_id ~ '^RNW-[0-9]+$';
  
  NEW.renewal_id := 'RNW-' || LPAD(next_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers
CREATE TRIGGER set_order_id
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_order_id();

CREATE TRIGGER set_renewal_id
  BEFORE INSERT ON public.renewals
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_renewal_id();