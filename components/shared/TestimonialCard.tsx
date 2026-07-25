import * as React from 'react';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

interface TestimonialCardProps extends React.HTMLAttributes<HTMLDivElement> {
  quote: string;
  name: string;
  role: string;
  company: string;
  rating?: number;
  avatarInitials?: string;
  avatarUrl?: string;
}

export function TestimonialCard({
  quote,
  name,
  role,
  company,
  rating = 5,
  avatarInitials,
  avatarUrl,
  className,
  ...props
}: TestimonialCardProps) {
  const initials =
    avatarInitials ||
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2);

  return (
    <div
      className={cn(
        'border-l-primary-600 border-border-subtle bg-surface flex flex-col rounded-xl border border-l-4 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:p-8',
        className
      )}
      {...props}
    >
      {/* Rating Stars */}
      <div
        className="mb-4 flex items-center gap-0.5"
        aria-label={`${rating} out of 5 stars`}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              'h-4 w-4',
              i < rating
                ? 'fill-warning text-warning'
                : 'fill-border-subtle text-border-subtle'
            )}
          />
        ))}
      </div>

      {/* Quote */}
      <blockquote className="text-text-body mb-6 flex-1 text-sm leading-relaxed md:text-base">
        &ldquo;{quote}&rdquo;
      </blockquote>

      {/* Author */}
      <div className="border-border-subtle mt-auto flex items-center gap-3 border-t pt-4">
        <div className="bg-primary-100 text-primary-700 border-primary-200 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border text-sm font-bold shadow-xs">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0">
          <div className="text-text-main truncate text-sm font-semibold">
            {name}
          </div>
          <div className="text-text-muted truncate text-xs">
            {role}, {company}
          </div>
        </div>
      </div>
    </div>
  );
}
