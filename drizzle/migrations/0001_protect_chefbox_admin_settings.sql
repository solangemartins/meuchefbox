ALTER POLICY settings_read ON public.chefbox_settings TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
REVOKE ALL ON TABLE public.chefbox_settings FROM anon;
CREATE FUNCTION public.get_public_chefbox_settings()
RETURNS TABLE (whatsapp text, retirada text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT settings.whatsapp, settings.retirada
  FROM public.chefbox_settings AS settings
  WHERE settings.id = 1;
$$;
REVOKE ALL ON FUNCTION public.get_public_chefbox_settings() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_chefbox_settings() TO anon, authenticated, service_role;
COMMENT ON FUNCTION public.get_public_chefbox_settings() IS 'Intentional public lookup: returns only customer-facing WhatsApp and pickup location for the singleton settings row; never administrator email.';