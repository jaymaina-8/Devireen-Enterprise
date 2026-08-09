import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/lib/env';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set({
              name,
              value,
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
            })
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect Dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/login';
      redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    const adminEmail =
      process.env.ADMIN_EMAIL || 'admin@devireenenterprice.com';
    let isAdmin = user.email === adminEmail;

    if (!isAdmin) {
      // Fallback to canonical user_roles via the is_admin() RPC
      const { data, error } = await supabase.rpc('is_admin');
      if (!error && data === true) {
        isAdmin = true;
      }
    }

    if (!isAdmin) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/';
      // Optionally you could add an error query param like ?error=unauthorized
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}
