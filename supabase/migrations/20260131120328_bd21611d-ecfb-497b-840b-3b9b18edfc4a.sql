-- Drop existing restrictive insert policy
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;

-- Create new permissive insert policy
CREATE POLICY "Anyone can insert orders" 
ON public.orders 
FOR INSERT 
TO public
WITH CHECK (true);

-- Also fix the renewals insert policy if it has the same issue
DROP POLICY IF EXISTS "Anyone can insert renewals" ON public.renewals;

CREATE POLICY "Anyone can insert renewals" 
ON public.renewals 
FOR INSERT 
TO public
WITH CHECK (true);