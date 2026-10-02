-- Create function to auto-calculate renewal_date from start_date
CREATE OR REPLACE FUNCTION public.calculate_renewal_date()
RETURNS TRIGGER AS $$
BEGIN
  -- When start_date is set or updated, calculate renewal_date as start_date + 30 days
  IF NEW.start_date IS NOT NULL AND (OLD.start_date IS NULL OR NEW.start_date != OLD.start_date) THEN
    NEW.renewal_date := NEW.start_date + INTERVAL '30 days';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to run before insert or update on orders
DROP TRIGGER IF EXISTS trigger_calculate_renewal_date ON public.orders;
CREATE TRIGGER trigger_calculate_renewal_date
  BEFORE INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_renewal_date();