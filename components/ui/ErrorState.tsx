'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  LucideIcon,
} from 'lucide-react';

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  error?:
    | Error
    | { message?: string; digest?: string; stack?: string }
    | string
    | null;
  digest?: string;
  icon?: LucideIcon;
  onRetry?: () => void | Promise<void>;
  isRetrying?: boolean;
  retryLabel?: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  variant?: 'section' | 'card' | 'inline' | 'minimal';
  showDetails?: boolean;
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'An unexpected error occurred while processing your request. Please try again.',
  error,
  digest: explicitDigest,
  icon: Icon = AlertTriangle,
  onRetry,
  isRetrying: externalRetrying,
  retryLabel = 'Try Again',
  action,
  secondaryAction,
  variant = 'section',
  showDetails = process.env.NODE_ENV !== 'production',
  className,
  ...props
}: ErrorStateProps) {
  const [internalRetrying, setInternalRetrying] = React.useState(false);
  const [copiedDigest, setCopiedDigest] = React.useState(false);
  const [detailsOpen, setDetailsOpen] = React.useState(false);

  const isRetrying = externalRetrying ?? internalRetrying;

  const handleRetry = async () => {
    if (!onRetry || isRetrying) return;
    try {
      setInternalRetrying(true);
      await Promise.resolve(onRetry());
    } finally {
      setInternalRetrying(false);
    }
  };

  const errorMessage =
    typeof error === 'string'
      ? error
      : error instanceof Error
        ? error.message
        : error?.message;

  const errorStack =
    typeof error === 'object' && error && 'stack' in error
      ? (error as any).stack
      : null;

  const errorDigest =
    explicitDigest ||
    (typeof error === 'object' && error && 'digest' in error
      ? (error as any).digest
      : undefined);

  const copyDigest = async () => {
    if (!errorDigest) return;
    try {
      await navigator.clipboard.writeText(errorDigest);
      setCopiedDigest(true);
      setTimeout(() => setCopiedDigest(false), 2000);
    } catch {
      // Ignore clipboard write failures in restricted contexts
    }
  };

  // Inline / Minimal variant
  if (variant === 'inline' || variant === 'minimal') {
    return (
      <div
        role="alert"
        aria-live="polite"
        className={cn(
          'border-error-200 bg-error-50/70 text-text-main flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 text-sm',
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-3">
          <div className="bg-error-100 text-error-600 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-text-main font-semibold">{title}</p>
            {description && (
              <p className="text-text-muted text-xs">{description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {action}
          {onRetry && (
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              variant="outline"
              size="sm"
              className="border-error-200 text-error-700 hover:bg-error-50 h-8 gap-1.5 bg-white text-xs font-medium"
            >
              <RotateCcw
                className={cn('h-3.5 w-3.5', isRetrying && 'animate-spin')}
              />
              {isRetrying ? 'Retrying...' : retryLabel}
            </Button>
          )}
          {secondaryAction}
        </div>
      </div>
    );
  }

  // Card variant (for inside dashboards, tables, dialogs)
  if (variant === 'card') {
    return (
      <div
        role="alert"
        aria-live="polite"
        className={cn(
          'border-error-200/80 flex flex-col items-center justify-center rounded-2xl border bg-white p-8 text-center shadow-xs',
          className
        )}
        {...props}
      >
        <div className="bg-error-50 text-error-600 ring-error-50/40 relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ring-8">
          <Icon className="h-7 w-7" />
        </div>

        <h3 className="text-text-main mb-2 text-lg font-bold">{title}</h3>
        <p className="text-text-muted mb-6 max-w-md text-sm">{description}</p>

        {errorDigest && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
            <span className="font-mono text-[11px]">ID: {errorDigest}</span>
            <button
              type="button"
              onClick={copyDigest}
              title="Copy error reference"
              className="ml-1 inline-flex items-center text-slate-400 hover:text-slate-600"
            >
              {copiedDigest ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          {action}
          {onRetry && (
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              variant="primary"
              size="sm"
              className="gap-2 px-5 py-2 font-medium"
            >
              <RotateCcw
                className={cn('h-4 w-4', isRetrying && 'animate-spin')}
              />
              {isRetrying ? 'Retrying...' : retryLabel}
            </Button>
          )}
          {secondaryAction}
        </div>

        {showDetails && (errorMessage || errorStack) && (
          <div className="mt-6 w-full max-w-lg text-left">
            <button
              type="button"
              onClick={() => setDetailsOpen(!detailsOpen)}
              className="flex w-full items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              <span>Technical Diagnostics</span>
              {detailsOpen ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
            {detailsOpen && (
              <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-slate-900 p-3 font-mono text-[11px] text-slate-200">
                {errorMessage && (
                  <p className="font-semibold text-rose-400">{errorMessage}</p>
                )}
                {errorStack && (
                  <pre className="mt-2 whitespace-pre-wrap text-slate-400">
                    {errorStack}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Section variant (standard full error page / route boundary)
  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center',
        className
      )}
      {...props}
    >
      <div className="bg-error-50 text-error-600 ring-error-50/50 relative mb-6 flex h-20 w-20 items-center justify-center rounded-3xl shadow-sm ring-12">
        <Icon className="h-10 w-10" />
      </div>

      <h1 className="text-text-main mb-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
        {title}
      </h1>
      <p className="text-text-muted mb-8 max-w-lg text-base leading-relaxed sm:text-lg">
        {description}
      </p>

      {errorDigest && (
        <div className="mb-8 flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs text-slate-600">
          <span className="font-medium text-slate-400">Ref Code:</span>
          <span className="font-mono text-slate-700">{errorDigest}</span>
          <button
            type="button"
            onClick={copyDigest}
            title="Copy error code"
            className="ml-1 inline-flex items-center text-slate-400 transition-colors hover:text-slate-700"
          >
            {copiedDigest ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-4">
        {action}
        {onRetry && (
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            variant="primary"
            className="h-11 gap-2 rounded-xl px-6 text-sm font-semibold shadow-sm transition-all"
          >
            <RotateCcw
              className={cn('h-4 w-4', isRetrying && 'animate-spin')}
            />
            {isRetrying ? 'Retrying...' : retryLabel}
          </Button>
        )}
        {secondaryAction}
      </div>

      {showDetails && (errorMessage || errorStack) && (
        <div className="mt-10 w-full max-w-xl text-left">
          <button
            type="button"
            onClick={() => setDetailsOpen(!detailsOpen)}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 shadow-xs hover:bg-slate-50"
          >
            <span>Developer Diagnostics</span>
            {detailsOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {detailsOpen && (
            <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 shadow-inner">
              {errorMessage && (
                <div className="border-b border-slate-800 pb-2 font-medium text-rose-400">
                  {errorMessage}
                </div>
              )}
              {errorStack && (
                <pre className="mt-2 text-[11px] whitespace-pre-wrap text-slate-400">
                  {errorStack}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
