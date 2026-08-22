'use client';

import * as React from 'react';
import { Truck, Store } from 'lucide-react';
import { cn } from '@/lib/utils';

type FulfillmentType = 'DELIVERY' | 'PICKUP';

interface FulfillmentSelectorProps {
  value: FulfillmentType | null;
  onChange: (type: FulfillmentType) => void;
}

const options: Array<{
  id: FulfillmentType;
  icon: React.ElementType;
  label: string;
  description: string;
}> = [
  {
    id: 'DELIVERY',
    icon: Truck,
    label: 'Delivery',
    description:
      'Delivery is completed the same day within Nairobi and surrounding counties, and the next day for other regions.',
  },
  {
    id: 'PICKUP',
    icon: Store,
    label: 'Personal Pickup',
    description: 'Come collect your order directly from our premises.',
  },
];

export function FulfillmentSelector({
  value,
  onChange,
}: FulfillmentSelectorProps) {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      role="radiogroup"
      aria-label="Fulfillment type"
    >
      {options.map((option) => {
        const Icon = option.icon;
        const isSelected = value === option.id;

        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.id)}
            className={cn(
              'relative flex flex-col items-start gap-3 rounded-xl border-2 p-5 text-left transition-all duration-200',
              'focus-visible:ring-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
              'hover:border-primary-300 hover:bg-primary-50/30',
              isSelected
                ? 'border-primary-500 bg-primary-50/40 shadow-primary-100 shadow-md'
                : 'border-border-main bg-surface'
            )}
          >
            {/* Selected indicator */}
            <span
              className={cn(
                'absolute top-4 right-4 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all',
                isSelected
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-border-main bg-transparent'
              )}
            >
              {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
            </span>

            {/* Icon */}
            <span
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                isSelected
                  ? 'bg-primary-500 text-white'
                  : 'bg-background text-text-muted'
              )}
            >
              <Icon className="h-5 w-5" />
            </span>

            {/* Text */}
            <div>
              <p
                className={cn(
                  'text-base leading-snug font-semibold',
                  isSelected ? 'text-primary-700' : 'text-text-main'
                )}
              >
                {option.label}
              </p>
              <p className="text-text-muted mt-0.5 text-sm leading-snug">
                {option.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
