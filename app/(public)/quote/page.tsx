import { QuoteForm } from './QuoteForm';
import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { FileText, ShieldCheck, Clock, CheckCircle } from 'lucide-react';
import { SeoContentSection } from '@/components/seo/SeoContentSection';

export const metadata = {
  title: 'Request a Quotation | Devireen Enterprise Nairobi',
  description:
    'Request a formal B2B quotation for office supplies, stationery, school materials, and bulk corporate orders in Kenya.',
  alternates: {
    canonical: '/quote',
  },
};

export default function QuotePage() {
  return (
    <div className="bg-background min-h-screen pb-16">
      {/* ─── Hero Section ─── */}
      <section className="bg-surface border-border-subtle border-b py-10 md:py-14">
        <div className="container mx-auto max-w-6xl px-4">
          <AnimatedSection animation="fade-up">
            <div className="text-primary-600 mb-2 flex items-center gap-2.5">
              <FileText className="h-5 w-5" />
              <span className="text-xs font-bold tracking-wider uppercase">
                B2B &amp; Corporate Procurement
              </span>
            </div>
            <h1 className="text-text-main text-3xl font-bold md:text-4xl">
              Request a Quotation
            </h1>
            <p className="text-text-muted mt-2 max-w-2xl text-sm leading-relaxed md:text-base">
              Submit your selected products for an official quotation. Our sales
              and accounts team will prepare a formal stamped quotation with tax
              invoice terms.
            </p>

            {/* Quick value badges */}
            <div className="text-text-muted mt-6 flex flex-wrap gap-4 text-xs font-medium">
              <div className="bg-background border-border-subtle flex items-center gap-1.5 rounded-lg border px-3 py-1.5">
                <Clock className="text-primary-600 h-4 w-4" /> Rapid Turnaround
              </div>
              <div className="bg-background border-border-subtle flex items-center gap-1.5 rounded-lg border px-3 py-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> KRA PIN
                &amp; VAT Invoicing
              </div>
              <div className="bg-background border-border-subtle flex items-center gap-1.5 rounded-lg border px-3 py-1.5">
                <CheckCircle className="h-4 w-4 text-blue-600" /> Wholesale
                &amp; Tier Pricing
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── Quote Form Workspace ─── */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <QuoteForm />
        </div>
      </section>

      {/* ─── SEO FAQs ─── */}
      <SeoContentSection
        title="B2B Quotations & Corporate Procurement Services"
        subtitle="How to request formal tender documents, RFQs, and bulk price estimates from Devireen Enterprise."
        sections={[
          {
            heading: 'How Official Quotes Work',
            content: (
              <p>
                Add items to your quote cart from our online catalog, review
                quantities, and fill out your organization details. Once
                submitted, our procurement desk receives the request immediately
                and issues a formal PDF quotation.
              </p>
            ),
          },
        ]}
        faqs={[
          {
            question: 'How fast will I receive a formal quotation?',
            answer:
              'Quotes submitted during business hours (Mon-Fri: 8am-6pm) are reviewed and processed within 1 to 2 hours.',
          },
          {
            question:
              'Can I request quotes for products not listed in the catalog?',
            answer:
              'Yes! Enter your custom item requirements in the "Additional Notes" field or message our sales desk directly via WhatsApp.',
          },
        ]}
      />
    </div>
  );
}
