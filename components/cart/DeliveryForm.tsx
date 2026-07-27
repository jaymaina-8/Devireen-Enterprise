'use client';

import * as React from 'react';
import { deliveryFormSchema, DeliveryFormData, KENYA_COUNTIES, COURIER_SERVICES } from '@/lib/validation/checkout.schema';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeliveryFormProps {
  onSubmit: (data: DeliveryFormData) => Promise<void>;
  isSubmitting: boolean;
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

export function DeliveryForm({ onSubmit, isSubmitting }: DeliveryFormProps) {
  const [errors, setErrors] = React.useState<Partial<Record<keyof DeliveryFormData, string>>>({});
  const [formData, setFormData] = React.useState<DeliveryFormData>({
    fullName: '',
    phone: '',
    email: '',
    deliveryAddress: '',
    county: '',
    courierService: '',
    deliveryNotes: '',
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof DeliveryFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const result = deliveryFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof DeliveryFormData, string>> = {};
      const flat = result.error.flatten().fieldErrors;
      (Object.keys(flat) as Array<keyof DeliveryFormData>).forEach((key) => {
        fieldErrors[key] = flat[key]?.[0];
      });
      setErrors(fieldErrors);
      return;
    }

    await onSubmit(result.data);
  }

  const inputClass = (field: keyof DeliveryFormData) =>
    cn(
      'w-full rounded-lg border bg-background px-3 py-2.5 text-sm text-text-main placeholder:text-text-muted',
      'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors',
      errors[field]
        ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
        : 'border-border-main'
    );

  return (
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
            aria-invalid={!!errors.fullName}
            aria-describedby={errors.fullName ? 'fullName-error' : undefined}
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

      {/* Delivery Address */}
      <div>
        <FormLabel htmlFor="deliveryAddress" required>Delivery Address</FormLabel>
        <textarea
          id="deliveryAddress"
          name="deliveryAddress"
          rows={2}
          value={formData.deliveryAddress}
          onChange={handleChange}
          placeholder="Building, street, estate, landmark..."
          className={inputClass('deliveryAddress')}
        />
        <FieldError message={errors.deliveryAddress} />
      </div>

      {/* County + Courier */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <FormLabel htmlFor="county" required>County / Area</FormLabel>
          <select
            id="county"
            name="county"
            value={formData.county}
            onChange={handleChange}
            className={inputClass('county')}
          >
            <option value="">Select county...</option>
            {KENYA_COUNTIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <FieldError message={errors.county} />
        </div>
        <div>
          <FormLabel htmlFor="courierService" required>Courier Service</FormLabel>
          <select
            id="courierService"
            name="courierService"
            value={formData.courierService}
            onChange={handleChange}
            className={inputClass('courierService')}
          >
            <option value="">Select courier...</option>
            {COURIER_SERVICES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <FieldError message={errors.courierService} />
        </div>
      </div>

      {/* Notes */}
      <div>
        <FormLabel htmlFor="deliveryNotes">Delivery Instructions <span className="text-text-muted font-normal">(optional)</span></FormLabel>
        <textarea
          id="deliveryNotes"
          name="deliveryNotes"
          rows={2}
          value={formData.deliveryNotes}
          onChange={handleChange}
          placeholder="Gate code, preferred time, special instructions..."
          className={inputClass('deliveryNotes')}
        />
        <FieldError message={errors.deliveryNotes} />
      </div>

      <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Order...
          </>
        ) : (
          'Confirm Delivery & Generate Invoice'
        )}
      </Button>
    </form>
  );
}
