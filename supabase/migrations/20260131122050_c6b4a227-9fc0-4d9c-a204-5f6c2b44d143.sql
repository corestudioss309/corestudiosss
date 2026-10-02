-- Drop existing insert policy
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;

-- Create new permissive insert policy that explicitly allows anon and authenticated roles
CREATE POLICY "Anyone can insert orders" 
ON public.orders 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Also fix the renewals insert policy
DROP POLICY IF EXISTS "Anyone can insert renewals" ON public.renewals;

CREATE POLICY "Anyone can insert renewals" 
ON public.renewals 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);