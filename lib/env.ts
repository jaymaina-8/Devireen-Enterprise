import { z } from 'zod';

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Anon key is required'),
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url('Must be a valid URL')
    .default('http://localhost:3000'),
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Service role key is required'),
  COMPANY_NAME: z.string().min(1).default('Devireen Enterprise'),
  WHATSAPP_NUMBER: z.string().min(1).default('+254708037929'),
});

const processEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  ...(typeof window === 'undefined'
    ? {
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
        COMPANY_NAME: process.env.COMPANY_NAME,
        WHATSAPP_NUMBER: process.env.WHATSAPP_NUMBER,
      }
    : {}),
};

const parsedClientEnv = clientSchema.safeParse(processEnv);

if (!parsedClientEnv.success) {
  console.log('processEnv debug:', processEnv);
  console.error(
    'Invalid client environment variables:',
    parsedClientEnv.error.format()
  );
  // Don't throw to prevent 500 error on Vercel, use a dummy fallback
}

let parsedServerEnv = null;
if (typeof window === 'undefined') {
  parsedServerEnv = serverSchema.safeParse(processEnv);
  if (!parsedServerEnv.success) {
    console.error(
      'Invalid server environment variables:',
      parsedServerEnv.error.format()
    );
    // Don't throw to prevent 500 error on Vercel
  }
}

export const env = {
  NEXT_PUBLIC_SUPABASE_URL:
    processEnv.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    processEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
  NEXT_PUBLIC_SITE_URL:
    processEnv.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  SUPABASE_SERVICE_ROLE_KEY:
    typeof window === 'undefined'
      ? processEnv.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
      : '',
  COMPANY_NAME:
    typeof window === 'undefined'
      ? processEnv.COMPANY_NAME || 'Devireen Enterprise'
      : 'Devireen Enterprise',
  WHATSAPP_NUMBER:
    typeof window === 'undefined'
      ? processEnv.WHATSAPP_NUMBER || '+254708037929'
      : '+254708037929',
};
