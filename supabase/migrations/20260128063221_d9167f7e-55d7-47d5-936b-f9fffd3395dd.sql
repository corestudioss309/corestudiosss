-- Rate limiting function for leads table
CREATE OR REPLACE FUNCTION public.check_lead_submission_rate()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Count submissions from same email in last hour
  SELECT COUNT(*) INTO recent_count
  FROM public.leads
  WHERE email = NEW.email
    AND created_at > NOW() - INTERVAL '1 hour';
  
  IF recent_count >= 5 THEN
    RAISE EXCEPTION 'Too many submissions. Please try again later.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Rate limiting function for interested_leads table
CREATE OR REPLACE FUNCTION public.check_interested_lead_submission_rate()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Count submissions from same email in last hour
  SELECT COUNT(*) INTO recent_count
  FROM public.interested_leads
  WHERE email = NEW.email
    AND created_at > NOW() - INTERVAL '1 hour';
  
  IF recent_count >= 5 THEN
    RAISE EXCEPTION 'Too many submissions. Please try again later.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for leads rate limiting
CREATE TRIGGER check_lead_rate
  BEFORE INSERT ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.check_lead_submission_rate();

-- Create trigger for interested_leads rate limiting
CREATE TRIGGER check_interested_lead_rate
  BEFORE INSERT ON public.interested_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.check_interested_lead_submission_rate();