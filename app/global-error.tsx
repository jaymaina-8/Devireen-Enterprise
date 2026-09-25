'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Root Layout Global Error Boundary caught:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans text-slate-900 antialiased">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-8 ring-red-50/50">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-900">
            Application Error
          </h1>
          <p className="mb-6 text-sm leading-relaxed text-slate-500">
            A critical error interrupted the application layout. Please try
            refreshing the application.
          </p>

          {error.digest && (
            <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-mono text-[11px] text-slate-500">
              <span>Code:</span>
              <span className="font-semibold text-slate-700">
                {error.digest}
              </span>
            </div>
          )}

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 active:scale-98"
            >
              <RotateCcw className="h-4 w-4" />
              Reload Application
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Home className="h-4 w-4" />
              Return Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
