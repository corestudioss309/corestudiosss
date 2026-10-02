-- Create trigger to increment coupon usage when order is placed
CREATE OR REPLACE FUNCTION public.increment_coupon_on_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.coupon_code IS NOT NULL THEN
    UPDATE public.coupons
    SET usage_count = usage_count + 1
    WHERE code = NEW.coupon_code;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on orders table
DROP TRIGGER IF EXISTS increment_coupon_usage_trigger ON public.orders;
CREATE TRIGGER increment_coupon_usage_trigger
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.increment_coupon_on_order();