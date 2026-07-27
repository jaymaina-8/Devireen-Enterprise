'use client';

import * as React from 'react';
import { pickupFormSchema, PickupFormData } from '@/lib/validation/checkout.schema';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Loader2, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PickupFormProps {
  onSubmit: (data: PickupFormData) => Promise<void>;
  isSubmitting: boolean;
  shopAddress?: string;
  mapsUrl?: string;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-red-500">{message}</p>;
}

function FormLabel({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-text-main mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

export function PickupForm({ onSubmit, isSubmitting, shopAddress, mapsUrl }: PickupFormProps) {
  const [errors, setErrors] = React.useState<Partial<Record<keyof PickupFormData, string>>>({});
  const [formData, setFormData] = React.useState<PickupFormData>({
    fullName: '',
    phone: '',
    email: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof PickupFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const result = pickupFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof PickupFormData, string>> = {};
      const flat = result.error.flatten().fieldErrors;
      (Object.keys(flat) as Array<keyof PickupFormData>).forEach((key) => {
        fieldErrors[key] = flat[key]?.[0];
      });
      setErrors(fieldErrors);
      return;
    }

    await onSubmit(result.data);
  }

  function handleOpenMaps() {
    try {
      if (mapsUrl) {
        window.open(mapsUrl, '_blank', 'noopener,noreferrer');
      } else if (shopAddress) {
        const query = encodeURIComponent(shopAddress);
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank', 'noopener,noreferrer');
      }
    } catch {
      // Silently fail map open
    }
  }

  return (
    <div className="space-y-6">
      {/* Shop location info */}
      {(shopAddress || mapsUrl) && (
        <div className="flex items-start gap-3 rounded-xl border border-border-subtle bg-background p-4">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
            <MapPin className="h-4 w-4" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-main">Our Location</p>
            {shopAddress && (
              <p className="text-sm text-text-muted mt-0.5 leading-snug">{shopAddress}</p>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleOpenMaps}
            className="flex-shrink-0 text-xs"
          >
            <MapPin className="mr-1 h-3 w-3" />
            Get Directions
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Name + Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FormLabel htmlFor="fullName" required>Full Name</FormLabel>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Jane Wangari"
              className={errors.fullName ? 'border-red-400' : ''}
            />
            <FieldError message={errors.fullName} />
          </div>
          <div>
            <FormLabel htmlFor="phone" required>Phone Number</FormLabel>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+254 712 345 678"
              className={errors.phone ? 'border-red-400' : ''}
            />
            <FieldError message={errors.phone} />
          </div>
        </div>

        {/* Email */}
        <div>
          <FormLabel htmlFor="email" required>Email Address</FormLabel>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="jane@example.com"
            className={errors.email ? 'border-red-400' : ''}
          />
          <FieldError message={errors.email} />
        </div>

        <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Order...
            </>
          ) : (
            'Confirm Pickup & Generate Invoice'
          )}
        </Button>
      </form>
    </div>
  );
}
