-- Fix admin email fallback typo in is_admin() function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_is_admin boolean := false;
BEGIN
    -- Check if JWT email matches the official bootstrap admin email
    IF auth.jwt() ->> 'email' IN ('admin@devireenenterprise.com', 'admin@devireenenterprice.com') THEN
        RETURN true;
    END IF;

    -- Check if user exists in user_roles with the ADMIN role
    IF auth.uid() IS NOT NULL THEN
        SELECT EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid() AND r.name = 'ADMIN'
        ) INTO v_is_admin;
    END IF;

    RETURN v_is_admin;
END;
$$;
