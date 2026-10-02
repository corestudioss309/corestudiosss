-- Add coupon-related columns to orders table
ALTER TABLE public.orders
ADD COLUMN coupon_code TEXT DEFAULT NULL,
ADD COLUMN coupon_discount INTEGER DEFAULT 0;