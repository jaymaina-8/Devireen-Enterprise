'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createCustomerAction,
  updateCustomerAction,
} from '@/actions/customer.actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { useToastStore } from '@/lib/store/toast-store';
import {
  Building2,
  Mail,
  Phone,
  Landmark,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

type CustomerFormData = {
  id?: string;
  company_name?: string | null;
  type?: 'BUSINESS' | 'RETAIL' | null;
  kra_pin?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
};

export function CustomerForm({
  initialData,
}: {
  initialData?: CustomerFormData;
}) {
  const isEditing = Boolean(initialData?.id);
  const router = useRouter();
  const { addToast } = useToastStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companyName, setCompanyName] = useState(
    initialData?.company_name ?? ''
  );
  const [type, setType] = useState<'BUSINESS' | 'RETAIL'>(
    initialData?.type ?? 'BUSINESS'
  );
  const [kraPin, setKraPin] = useState(initialData?.kra_pin ?? '');
  const [contactEmail, setContactEmail] = useState(
    initialData?.contact_email ?? ''
  );
  const [contactPhone, setContactPhone] = useState(
    initialData?.contact_phone ?? ''
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        company_name: companyName,
        type,
        kra_pin: kraPin,
        contact_email: contactEmail,
        contact_phone: contactPhone,
      };

      const res =
        isEditing && initialData?.id
          ? await updateCustomerAction(initialData.id, payload)
          : await createCustomerAction(payload);

      if (res.success) {
        addToast({
          title: isEditing ? 'Customer Updated' : 'Customer Created',
          description: isEditing
            ? `Successfully updated ${companyName || 'customer'} record`
            : `Successfully added ${companyName || 'new customer'} to CRM directory`,
          variant: 'success',
        });
        router.push(
          isEditing
            ? `/dashboard/customers/${initialData!.id}`
            : '/dashboard/customers'
        );
        router.refresh();
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      addToast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6 text-xs">
      <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
        {/* Section 1: Business Identity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Building2 className="h-4 w-4 text-purple-600" /> Account Profile
              & Identity
            </h2>
            <span className="font-mono text-[10px] text-slate-400">
              B2B CRM
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5 md:col-span-2">
              <Label
                htmlFor="company_name"
                className="font-semibold text-slate-700"
              >
                Company / Organization Name *
              </Label>
              <Input
                id="company_name"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Supplies Ltd"
                className="rounded-xl border-slate-200 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="type" className="font-semibold text-slate-700">
                Customer Account Type *
              </Label>
              <Select
                id="type"
                value={type}
                onChange={(e: any) => setType(e.target.value)}
                className="rounded-xl border-slate-200 text-xs"
              >
                <option value="BUSINESS">Corporate / Business (B2B)</option>
                <option value="RETAIL">Retail / Individual</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="kra_pin" className="font-semibold text-slate-700">
                KRA PIN (Optional)
              </Label>
              <Input
                id="kra_pin"
                value={kraPin}
                onChange={(e) => setKraPin(e.target.value)}
                placeholder="P000000000A"
                className="rounded-xl border-slate-200 font-mono text-xs"
              />
              <p className="text-[10px] text-slate-400">
                Used for official E-TIMS tax invoices and quotation PDFs.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Contact Points */}
        <div className="space-y-4 pt-2">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Mail className="h-4 w-4 text-red-600" /> Primary Contact Points
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="contact_email"
                className="font-semibold text-slate-700"
              >
                Contact Email Address
              </Label>
              <Input
                id="contact_email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="procurement@acme.co.ke"
                className="rounded-xl border-slate-200 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="contact_phone"
                className="font-semibold text-slate-700"
              >
                Contact Phone Number
              </Label>
              <Input
                id="contact_phone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+254 700 000 000"
                className="rounded-xl border-slate-200 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <Link href="/dashboard/customers">
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-1.5 rounded-xl border-slate-200 text-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Customers
            </Button>
          </Link>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-red-600 px-5 text-xs font-semibold text-white shadow-sm hover:bg-red-700"
          >
            {isSubmitting
              ? 'Saving...'
              : isEditing
                ? 'Update Customer Record'
                : 'Create Customer Record'}
          </Button>
        </div>
      </div>
    </form>
  );
}
