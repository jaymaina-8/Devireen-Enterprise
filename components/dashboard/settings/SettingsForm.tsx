'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { useToastStore } from '@/lib/store/toast-store';
import { updateSettingsAction } from '@/actions/settings.actions';
import {
  Building2,
  Landmark,
  Clock,
  Phone,
  Mail,
  FileText,
  Save,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

export function SettingsForm({ settings }: { settings: any }) {
  const [activeTab, setActiveTab] = useState('company');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { addToast } = useToastStore();

  const sections = [
    { id: 'company', label: 'Company Profile', icon: Building2 },
    { id: 'tax', label: 'Tax & KRA Settings', icon: Landmark },
    { id: 'hours', label: 'Business Hours', icon: Clock },
    { id: 'documents', label: 'Document Defaults', icon: FileText },
  ];

  async function handleSectionSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    try {
      const result = await updateSettingsAction(formData);
      if (result.success) {
        addToast({
          title: 'Saved!',
          description: 'Settings updated successfully',
          variant: 'success',
        });
        router.refresh();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      addToast({
        title: 'Error',
        description: error.message || 'Failed to update settings',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Navigation Cards Bar */}
      <div className="custom-scrollbar flex items-center gap-2 overflow-x-auto border-b border-slate-200/80 pb-1">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeTab === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveTab(sec.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon
                className={`h-4 w-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`}
              />
              {sec.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSectionSave} className="max-w-4xl space-y-6">
        {/* Section 1: Company Profile */}
        {activeTab === 'company' && (
          <div className="animate-in fade-in space-y-6 rounded-2xl border border-slate-200/80 bg-white p-6 text-xs shadow-2xs duration-150">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Building2 className="h-4 w-4 text-blue-600" /> Company
                Information & Branding
              </h2>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Physical office, contact information, and business identity.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label
                  htmlFor="company_name"
                  className="font-semibold text-slate-700"
                >
                  Company Legal Name *
                </Label>
                <Input
                  id="company_name"
                  name="company_name"
                  defaultValue={settings.company_name}
                  required
                  className="rounded-xl border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="font-semibold text-slate-700">
                  Support / Contact Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={settings.email}
                  className="rounded-xl border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="phone_numbers"
                  className="font-semibold text-slate-700"
                >
                  Primary Phone
                </Label>
                <Input
                  id="phone_numbers"
                  name="phone_numbers"
                  defaultValue={
                    settings.phone_numbers?.[0] || settings.phone_numbers
                  }
                  className="rounded-xl border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="whatsapp_number"
                  className="font-semibold text-slate-700"
                >
                  WhatsApp Hotline
                </Label>
                <Input
                  id="whatsapp_number"
                  name="whatsapp_number"
                  defaultValue={settings.whatsapp_number}
                  className="rounded-xl border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label
                  htmlFor="physical_address"
                  className="font-semibold text-slate-700"
                >
                  HQ Physical Address
                </Label>
                <Input
                  id="physical_address"
                  name="physical_address"
                  defaultValue={settings.physical_address}
                  className="rounded-xl border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="gap-1.5 rounded-xl bg-blue-600 text-xs font-semibold text-white hover:bg-blue-500"
              >
                <Save className="h-3.5 w-3.5" /> Save Company Profile
              </Button>
            </div>
          </div>
        )}

        {/* Section 2: Tax & KRA Settings */}
        {activeTab === 'tax' && (
          <div className="animate-in fade-in space-y-6 rounded-2xl border border-slate-200/80 bg-white p-6 text-xs shadow-2xs duration-150">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Landmark className="h-4 w-4 text-purple-600" /> Tax & KRA
                Compliance Settings
              </h2>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Kenya Revenue Authority PIN and VAT rates for official quotes &
                invoices.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label
                  htmlFor="kra_pin"
                  className="font-semibold text-slate-700"
                >
                  Company KRA PIN *
                </Label>
                <Input
                  id="kra_pin"
                  name="kra_pin"
                  placeholder="P000000000A"
                  defaultValue={settings.kra_pin}
                  className="rounded-xl border-slate-200 font-mono text-xs"
                />
                <p className="text-[10px] text-slate-400">
                  Printed on official quote PDFs.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="vat_rate"
                  className="font-semibold text-slate-700"
                >
                  Standard VAT Rate (%) *
                </Label>
                <Input
                  id="vat_rate"
                  name="vat_rate"
                  type="number"
                  min="0"
                  step="0.1"
                  defaultValue={settings.vat_rate || 16}
                  className="rounded-xl border-slate-200 text-xs"
                />
                <p className="text-[10px] text-slate-400">
                  Applied automatically to line items.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="mt-6 flex items-center justify-between">
                  <Label
                    htmlFor="enable_vat"
                    className="cursor-pointer font-semibold text-slate-700"
                  >
                    Enable VAT Sitewide
                  </Label>
                  <input
                    type="checkbox"
                    id="enable_vat"
                    name="enable_vat"
                    defaultChecked={settings.enable_vat !== false}
                    className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                  />
                </div>
                <p className="mt-1 text-[10px] text-slate-400">
                  If disabled, VAT will not be calculated on quotes and
                  invoices.
                </p>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="gap-1.5 rounded-xl bg-blue-600 text-xs font-semibold text-white hover:bg-blue-500"
              >
                <Save className="h-3.5 w-3.5" /> Save Tax Settings
              </Button>
            </div>
          </div>
        )}

        {/* Section 3: Business Hours */}
        {activeTab === 'hours' && (
          <div className="animate-in fade-in space-y-6 rounded-2xl border border-slate-200/80 bg-white p-6 text-xs shadow-2xs duration-150">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Clock className="h-4 w-4 text-emerald-600" /> Business
                Operating Hours
              </h2>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Displayed on storefront footer and contact page.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label
                  htmlFor="business_hours_weekdays"
                  className="font-semibold text-slate-700"
                >
                  Mon - Fri Hours
                </Label>
                <Input
                  id="business_hours_weekdays"
                  name="business_hours_weekdays"
                  placeholder="8:00 AM - 5:00 PM"
                  defaultValue={settings.business_hours_weekdays}
                  className="rounded-xl border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="business_hours_weekends"
                  className="font-semibold text-slate-700"
                >
                  Saturday & Sunday Hours
                </Label>
                <Input
                  id="business_hours_weekends"
                  name="business_hours_weekends"
                  placeholder="9:00 AM - 1:00 PM (Sat), Closed (Sun)"
                  defaultValue={settings.business_hours_weekends}
                  className="rounded-xl border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="gap-1.5 rounded-xl bg-blue-600 text-xs font-semibold text-white hover:bg-blue-500"
              >
                <Save className="h-3.5 w-3.5" /> Save Operating Hours
              </Button>
            </div>
          </div>
        )}

        {/* Section 4: Document Defaults */}
        {activeTab === 'documents' && (
          <div className="animate-in fade-in space-y-6 rounded-2xl border border-slate-200/80 bg-white p-6 text-xs shadow-2xs duration-150">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <FileText className="h-4 w-4 text-amber-600" /> Quotation &
                Invoice Defaults
              </h2>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Default terms and conditions printed on PDF quotes.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="footer_content"
                className="font-semibold text-slate-700"
              >
                Standard Terms & Payment Notes
              </Label>
              <Textarea
                id="footer_content"
                name="footer_content"
                rows={5}
                defaultValue={
                  settings.footer_content ||
                  'Quotes valid for 30 days. Payment terms 50% deposit, balance on delivery.'
                }
                className="rounded-xl border-slate-200 text-xs"
              />
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="gap-1.5 rounded-xl bg-blue-600 text-xs font-semibold text-white hover:bg-blue-500"
              >
                <Save className="h-3.5 w-3.5" /> Save Document Defaults
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
