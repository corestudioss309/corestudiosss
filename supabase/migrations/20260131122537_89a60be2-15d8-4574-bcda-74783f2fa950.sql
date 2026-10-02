-- Drop existing insert policy
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;

-- Create new permissive insert policy for public role (not specifying role = all roles)
CREATE POLICY "Anyone can insert orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

-- Also fix the renewals insert policy
DROP POLICY IF EXISTS "Anyone can insert renewals" ON public.renewals;

CREATE POLICY "Anyone can insert renewals" 
ON public.renewals 
FOR INSERT 
WITH CHECK (true);