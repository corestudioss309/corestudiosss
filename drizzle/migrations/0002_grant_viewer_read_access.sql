GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT ON public.orders TO authenticated;
GRANT SELECT ON public.renewals TO authenticated;
GRANT SELECT ON public.leads TO authenticated;

CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Viewers can view orders"
ON public.orders
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'viewer'::public.app_role));

CREATE POLICY "Viewers can view renewals"
ON public.renewals
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'viewer'::public.app_role));

CREATE POLICY "Viewers can view leads"
ON public.leads
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'viewer'::public.app_role));