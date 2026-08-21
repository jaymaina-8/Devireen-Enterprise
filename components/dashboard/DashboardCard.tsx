'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ArrowUpRight } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: {
    value: number | string;
    label?: string;
    isPositive?: boolean;
  };
  href?: string;
  variant?: 'default' | 'red' | 'amber' | 'emerald' | 'purple';
  badge?: string;
  className?: string;
}

const variantStyles = {
  default: {
    iconBg: 'bg-slate-100 text-slate-700',
    hoverBorder: 'hover:border-slate-300',
    glow: '',
  },
  red: {
    iconBg: 'bg-red-50 text-red-600',
    hoverBorder: 'hover:border-red-200 hover:shadow-red-500/5',
    glow: 'group-hover:text-red-600',
  },
  amber: {
    iconBg: 'bg-amber-50 text-amber-600',
    hoverBorder: 'hover:border-amber-200 hover:shadow-amber-500/5',
    glow: 'group-hover:text-amber-600',
  },
  emerald: {
    iconBg: 'bg-emerald-50 text-emerald-600',
    hoverBorder: 'hover:border-emerald-200 hover:shadow-emerald-500/5',
    glow: 'group-hover:text-emerald-600',
  },
  purple: {
    iconBg: 'bg-purple-50 text-purple-600',
    hoverBorder: 'hover:border-purple-200 hover:shadow-purple-500/5',
    glow: 'group-hover:text-purple-600',
  },
};

export function DashboardCard({
  title,
  value,
  icon,
  description,
  trend,
  href,
  variant = 'default',
  badge,
  className,
}: DashboardCardProps) {
  const styles = variantStyles[variant] || variantStyles.default;

  const content = (
    <div
      className={twMerge(
        clsx(
          'group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs transition-all duration-200',
          href &&
            `cursor-pointer hover:-translate-y-0.5 hover:shadow-md ${styles.hoverBorder}`,
          className
        )
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            {title}
          </span>
          {badge && (
            <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800">
              {badge}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className={clsx(
              'flex h-9 w-9 items-center justify-center rounded-xl transition-colors',
              styles.iconBg
            )}
          >
            {icon}
          </div>
          {href && (
            <ArrowUpRight className="h-4 w-4 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
          )}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {value}
        </p>
        {(description || trend) && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
            {trend && (
              <span
                className={clsx(
                  'font-semibold',
                  trend.isPositive === true && 'text-emerald-600',
                  trend.isPositive === false && 'text-red-600',
                  trend.isPositive === undefined && 'text-slate-600'
                )}
              >
                {trend.value}
              </span>
            )}
            {description && (
              <span className="text-slate-500">{description}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
