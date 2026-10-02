
CREATE TABLE public.snaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  image_url text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.snaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active snaps" ON public.snaps
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can view all snaps" ON public.snaps
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert snaps" ON public.snaps
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update snaps" ON public.snaps
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete snaps" ON public.snaps
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO storage.buckets (id, name, public) VALUES ('snaps', 'snaps', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view snaps images" ON storage.objects
  FOR SELECT USING (bucket_id = 'snaps');

CREATE POLICY "Admins can upload snaps images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'snaps' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete snaps images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'snaps' AND public.has_role(auth.uid(), 'admin'));
