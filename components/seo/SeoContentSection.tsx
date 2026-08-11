import React from 'react';
import { FaqPageJsonLd } from '@/lib/seo/structured-data';
import { HelpCircle, BookOpen, ChevronDown } from 'lucide-react';

export interface SeoContentBlock {
  heading: string;
  content: React.ReactNode;
}

export interface SeoFaqItem {
  question: string;
  answer: string;
}

export interface SeoContentSectionProps {
  title: string;
  subtitle?: string;
  sections: SeoContentBlock[];
  faqs?: SeoFaqItem[];
  className?: string;
}

export function SeoContentSection({
  title,
  subtitle,
  sections,
  faqs,
  className = '',
}: SeoContentSectionProps) {
  return (
    <section
      aria-label={title}
      className={`bg-surface border-border-subtle border-t py-12 md:py-16 ${className}`}
    >
      {faqs && faqs.length > 0 && <FaqPageJsonLd faqs={faqs} />}

      <div className="container mx-auto px-4">
        {/* Main Section Header */}
        <div className="mb-10 max-w-3xl">
          <div className="border-primary-100 bg-primary-50 text-primary-700 mb-3 inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Devireen Supply Guide &amp; Knowledge Base</span>
          </div>
          <h2 className="text-text-main text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
            {title}
          </h2>
          {subtitle && (
            <p className="text-text-muted mt-3 text-base md:text-lg">
              {subtitle}
            </p>
          )}
        </div>

        {/* Content Paragraph Blocks */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
          {sections.map((section, idx) => (
            <div
              key={idx}
              className="border-border-subtle bg-background rounded-2xl border p-6 shadow-sm transition-shadow duration-200 hover:shadow-md md:p-8"
            >
              <h3 className="text-text-main mb-3 text-lg font-bold md:text-xl">
                {section.heading}
              </h3>
              <div className="prose prose-sm text-text-body text-text-muted max-w-none leading-relaxed">
                {section.content}
              </div>
            </div>
          ))}
        </div>

        {/* Frequently Asked Questions */}
        {faqs && faqs.length > 0 && (
          <div className="border-border-subtle bg-background mt-12 rounded-2xl border p-6 md:mt-16 md:p-8">
            <div className="border-border-subtle mb-6 flex items-center gap-3 border-b pb-4">
              <div className="bg-primary-100 text-primary-600 flex h-9 w-9 items-center justify-center rounded-xl">
                <HelpCircle className="h-5 w-5" />
              </div>
              <h3 className="text-text-main text-xl font-bold md:text-2xl">
                Frequently Asked Questions
              </h3>
            </div>

            <div className="divide-border-subtle divide-y">
              {faqs.map((faq, idx) => (
                <details key={idx} className="group py-4 first:pt-0 last:pb-0">
                  <summary className="text-text-main hover:text-primary-600 flex cursor-pointer list-none items-center justify-between font-semibold transition-colors focus:outline-none">
                    <span className="pr-4 text-base md:text-lg">
                      {faq.question}
                    </span>
                    <ChevronDown className="text-text-muted h-5 w-5 shrink-0 transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <div className="text-text-muted mt-3 text-sm leading-relaxed md:text-base">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
