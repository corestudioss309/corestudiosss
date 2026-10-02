
CREATE TABLE public.popup_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active boolean NOT NULL DEFAULT false,
  title_en text NOT NULL DEFAULT '',
  title_ar text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  description_ar text NOT NULL DEFAULT '',
  include_coupon boolean NOT NULL DEFAULT false,
  coupon_code text,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.popup_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view popup settings" ON public.popup_settings
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can update popup settings" ON public.popup_settings
  FOR UPDATE TO public USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_popup_settings_timestamp
  BEFORE UPDATE ON public.popup_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

INSERT INTO public.popup_settings (is_active, title_en, title_ar, description_en, description_ar, include_coupon)
VALUES (false, 'Welcome!', 'أهلاً وسهلاً!', 'Check out our latest offers', 'تفقد أحدث عروضنا', false);
