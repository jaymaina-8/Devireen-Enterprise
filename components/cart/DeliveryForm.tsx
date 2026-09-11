'use client';

import * as React from 'react';
import {
  deliveryFormSchema,
  DeliveryFormData,
  KENYA_COUNTIES,
  COURIER_SERVICES,
} from '@/lib/validation/checkout.schema';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeliveryFormProps {
  onSubmit: (data: DeliveryFormData) => Promise<void>;
  isSubmitting: boolean;
  onBack?: () => void;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-red-500">{message}</p>;
}

function FormLabel({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-text-main mb-1.5 block text-sm font-medium"
    >
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

export function DeliveryForm({
  onSubmit,
  isSubmitting,
  onBack,
}: DeliveryFormProps) {
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof DeliveryFormData, string>>
  >({});
  const [customCourier, setCustomCourier] = React.useState('');
  const [customCourierError, setCustomCourierError] = React.useState('');
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof DeliveryFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleCourierChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, courierService: value }));
    if (errors.courierService) {
      setErrors((prev) => ({ ...prev, courierService: undefined }));
    }
    if (value !== 'OTHER') {
      setCustomCourierError('');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setCustomCourierError('');

    const isCustom = formData.courierService === 'OTHER';
    if (isCustom && !customCourier.trim()) {
      setCustomCourierError('Please write your preferred courier name');
    }

    const effectiveData: DeliveryFormData = {
      ...formData,
      courierService: isCustom ? customCourier.trim() : formData.courierService,
    };

    const result = deliveryFormSchema.safeParse(effectiveData);
    if (!result.success || (isCustom && !customCourier.trim())) {
      const fieldErrors: Partial<Record<keyof DeliveryFormData, string>> = {};
      if (!result.success) {
        const flat = result.error.flatten().fieldErrors;
        (Object.keys(flat) as Array<keyof DeliveryFormData>).forEach((key) => {
          fieldErrors[key] = flat[key]?.[0];
        });
      }
      if (isCustom && !customCourier.trim()) {
        setCustomCourierError('Please write your preferred courier name');
        fieldErrors.courierService = 'Please specify your preferred courier';
      }
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FormLabel htmlFor="fullName" required>
            Full Name
          </FormLabel>
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
          <FormLabel htmlFor="phone" required>
            Phone Number
          </FormLabel>
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

      {/* Email (Optional) */}
      <div>
        <FormLabel htmlFor="email">
          Email Address{' '}
          <span className="text-text-muted text-xs font-normal">
            (Optional)
          </span>
        </FormLabel>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="jane@example.com (optional)"
          className={errors.email ? 'border-red-400' : ''}
        />
        <FieldError message={errors.email} />
      </div>

      {/* Delivery Address */}
      <div>
        <FormLabel htmlFor="deliveryAddress" required>
          Delivery Address
        </FormLabel>
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FormLabel htmlFor="county" required>
            County / Area
          </FormLabel>
          <select
            id="county"
            name="county"
            value={formData.county}
            onChange={handleChange}
            className={inputClass('county')}
          >
            <option value="">Select county...</option>
            {KENYA_COUNTIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <FieldError message={errors.county} />
        </div>
        <div>
          <FormLabel htmlFor="courierService" required>
            Courier Service
          </FormLabel>
          <select
            id="courierService"
            name="courierService"
            value={formData.courierService}
            onChange={handleCourierChange}
            className={inputClass('courierService')}
          >
            <option value="">Select courier...</option>
            {COURIER_SERVICES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value="OTHER">
              Other / Preferred Courier (Write your own)...
            </option>
          </select>
          <FieldError message={errors.courierService} />
        </div>
      </div>

      {/* Preferred Courier Input */}
      {formData.courierService === 'OTHER' && (
        <div className="animate-in fade-in duration-200">
          <FormLabel htmlFor="customCourier" required>
            Write Preferred Courier
          </FormLabel>
          <Input
            id="customCourier"
            name="customCourier"
            value={customCourier}
            onChange={(e) => {
              setCustomCourier(e.target.value);
              if (customCourierError) setCustomCourierError('');
              if (errors.courierService) {
                setErrors((prev) => ({ ...prev, courierService: undefined }));
              }
            }}
            placeholder="e.g. Modern Coast, Speedaf, North Rift, Transline, etc."
            className={
              customCourierError
                ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                : ''
            }
            autoFocus
          />
          {customCourierError && <FieldError message={customCourierError} />}
          <p className="text-text-muted mt-1 text-xs">
            Enter the name of your preferred parcel office or courier company.
          </p>
        </div>
      )}

      {/* Notes */}
      <div>
        <FormLabel htmlFor="deliveryNotes">
          Delivery Instructions{' '}
          <span className="text-text-muted font-normal">(optional)</span>
        </FormLabel>
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

      <div className="border-border-subtle flex flex-col-reverse items-center justify-between gap-3 border-t pt-4 sm:flex-row">
        {onBack ? (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Fulfillment
          </Button>
        ) : (
          <div />
        )}
        <Button
          type="submit"
          variant="primary"
          className="w-full py-3 text-base font-semibold shadow-md transition-all hover:shadow-lg sm:w-auto sm:px-8"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Order...
            </>
          ) : (
            <>
              Next: Complete Order
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
