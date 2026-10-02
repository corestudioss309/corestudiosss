-- Recreate order ID trigger
CREATE TRIGGER trigger_generate_order_id
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_order_id();

-- Recreate renewal ID trigger
CREATE TRIGGER generate_renewal_id_trigger
  BEFORE INSERT ON public.renewals
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_renewal_id();