import Image from 'next/image';
import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { ContactForm } from './ContactForm';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ShoppingCart,
  HeadphonesIcon,
  CreditCard,
  Building2,
  MessageCircle,
} from 'lucide-react';

import { LocalBusinessJsonLd } from '@/lib/seo/structured-data';
import { SeoContentSection } from '@/components/seo/SeoContentSection';
import { SettingsRepository } from '@/lib/supabase/repositories/settings.repository';

export const metadata = {
  title: 'Contact Us | Devireen Enterprise Nairobi',
  description:
    'Get in touch with Devireen Enterprise for stationery, office supplies, school materials, and bulk business orders in Nairobi, Kenya.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Us | Devireen Enterprise Nairobi',
    description:
      'Contact Devireen Enterprise for stationery, office supplies, school materials, and bulk business orders in Nairobi, Kenya.',
    url: 'https://www.devireenenterprise.com/contact',
  },
};

const departments = [
  {
    icon: <ShoppingCart className="h-5 w-5" />,
    name: 'Sales',
    description: 'Product inquiries, quotes, and new accounts',
    email: 'devireenenterprise@gmail.com',
    phone: '+254 708 037929',
  },
  {
    icon: <HeadphonesIcon className="h-5 w-5" />,
    name: 'Support',
    description: 'Order tracking, returns, and issues',
    email: 'devireenenterprise@gmail.com',
    phone: '+254 708 037929',
  },
  {
    icon: <CreditCard className="h-5 w-5" />,
    name: 'Accounts',
    description: 'Invoicing, payments, and statements',
    email: 'devireenenterprise@gmail.com',
    phone: '+254 708 037929',
  },
  {
    icon: <Building2 className="h-5 w-5" />,
    name: 'Procurement',
    description: 'Bulk orders and corporate accounts',
    email: 'devireenenterprise@gmail.com',
    phone: '+254 708 037929',
  },
];

export default async function ContactPage() {
  const settings = await SettingsRepository.getSettings();
  const phone = settings?.phone_numbers?.[0] || '+254 708 037929';
  const email = settings?.email || 'devireenenterprise@gmail.com';
  const whatsapp = settings?.whatsapp_number || '+254 708 037929';
  const rawWhatsapp = whatsapp.replace(/[^\d]/g, '');
  const cleanPhone = phone.replace(/\s/g, '');

  return (
    <div className="flex min-h-screen flex-col">
      <LocalBusinessJsonLd />
      {/* ─── Hero ─── */}
      <section className="relative flex min-h-[300px] items-center overflow-hidden md:min-h-[360px]">
        <Image
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=80"
          alt="Modern corporate office"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="bg-dark-overlay-strong absolute inset-0" />
        <div className="relative z-10 container mx-auto px-4 py-16 md:py-20">
          <AnimatedSection animation="fade-up">
            <h1 className="max-w-3xl text-4xl leading-tight font-bold text-white md:text-5xl">
              Get in touch
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-white/80">
              We&apos;re here to help with your procurement needs. Reach out to
              the right department below.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── Department Cards ─── */}
      <section className="bg-background py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
            {departments.map((dept, i) => (
              <AnimatedSection
                key={dept.name}
                animation="fade-up"
                delay={i * 80}
              >
                <div className="bg-surface border-border-subtle h-full rounded-xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <div className="bg-primary-100 text-primary-600 mb-4 flex h-10 w-10 items-center justify-center rounded-lg">
                    {dept.icon}
                  </div>
                  <h3 className="text-text-main mb-1 font-bold">{dept.name}</h3>
                  <p className="text-text-muted mb-4 text-xs">
                    {dept.description}
                  </p>
                  <div className="text-text-muted space-y-2 text-xs">
                    <a
                      href={`mailto:${dept.email}`}
                      className="hover:text-primary-600 flex cursor-pointer items-center gap-2 font-medium transition-colors"
                    >
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span>{dept.email}</span>
                    </a>
                    <a
                      href={`tel:${dept.phone.replace(/\s/g, '')}`}
                      className="hover:text-primary-600 flex cursor-pointer items-center gap-2 font-medium transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span>{dept.phone}</span>
                    </a>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Contact Form + Info ─── */}
      <section className="bg-surface border-border-subtle border-y py-12 md:py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left — Info + Map */}
            <AnimatedSection animation="slide-right">
              <div>
                <h2 className="text-text-main mb-6 text-2xl font-bold md:text-3xl">
                  Visit our office
                </h2>
                <p className="text-text-muted mb-8 leading-relaxed">
                  Whether you need a custom quote, have a question about our
                  products, or need support with an existing order, our team is
                  ready to assist you.
                </p>

                {/* Contact Details */}
                <div className="mb-8 space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary-100 text-primary-600 shrink-0 rounded-lg p-2.5">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-text-main text-sm font-semibold">
                        Office Address
                      </h4>
                      <p className="text-text-muted text-sm">
                        {settings?.physical_address || 'Nairobi CBD, Kenya'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary-100 text-primary-600 shrink-0 rounded-lg p-2.5">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-text-main text-sm font-semibold">
                        Phone
                      </h4>
                      <a
                        href={`tel:${cleanPhone}`}
                        className="text-text-muted hover:text-primary-600 inline-block text-sm font-medium transition-colors hover:underline"
                      >
                        {phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary-100 text-primary-600 shrink-0 rounded-lg p-2.5">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-text-main text-sm font-semibold">
                        Email Support
                      </h4>
                      <a
                        href={`mailto:${email}`}
                        className="text-text-muted hover:text-primary-600 inline-block text-sm font-medium transition-colors hover:underline"
                      >
                        {email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="shrink-0 rounded-lg bg-emerald-100 p-2.5 text-emerald-600">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-text-main text-sm font-semibold">
                        WhatsApp Hotline
                      </h4>
                      <a
                        href={`https://wa.me/${rawWhatsapp}?text=${encodeURIComponent('Hello Devireen Enterprise, I would like to make an inquiry.')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 transition-colors hover:text-emerald-800 hover:underline"
                      >
                        Chat on WhatsApp &rarr;
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary-100 text-primary-600 shrink-0 rounded-lg p-2.5">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-text-main text-sm font-semibold">
                        Business Hours
                      </h4>
                      <div className="text-text-muted space-y-0.5 text-sm">
                        <p>
                          {settings?.business_hours_weekdays ||
                            'Mon – Fri: 8:00 AM – 6:00 PM'}
                        </p>
                        <p>
                          {settings?.business_hours_weekends ||
                            'Saturday: 9:00 AM – 2:00 PM'}
                        </p>
                        <p>Sunday: Closed</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Map Placeholder */}
                <a
                  href="https://www.google.com/maps/place/Devireen+Enterprise./@-1.28181,36.825743,17z/data=!3m1!4b1!4m6!3m5!1s0x182f118fa27150b5:0xe0fb2ec5aa188109!8m2!3d-1.2818154!4d36.8283179!16s%2Fg%2F11nth4f4zs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-border-subtle bg-background relative block aspect-[16/9] overflow-hidden rounded-xl border transition-opacity hover:opacity-90"
                >
                  <Image
                    src="https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=600&q=80"
                    alt="Nairobi office location map placeholder"
                    fill
                    className="object-cover opacity-60"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-surface/90 text-text-main flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium shadow-md backdrop-blur-sm">
                      <MapPin className="text-primary-600 h-4 w-4" />
                      Nairobi CBD, Kenya
                    </div>
                  </div>
                </a>
              </div>
            </AnimatedSection>

            {/* Right — Form */}
            <AnimatedSection animation="fade-up" delay={200}>
              <ContactForm />
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* SEO Content Layer */}
      <SeoContentSection
        title="Contact Devireen Enterprise — Sales, Support & Customer Desk"
        subtitle="Visit our Nairobi CBD store or contact our sales desk for stationery, office, and school procurement."
        sections={[
          {
            heading: 'Direct Assistance for Corporate & School Inquiries',
            content: (
              <p>
                Our specialized sales, accounts, support, and procurement teams
                are ready to help you find products, track orders, or generate
                formal quotation documents for your company or school.
              </p>
            ),
          },
          {
            heading: 'Store Location & In-Person Purchases in Nairobi CBD',
            content: (
              <p>
                Visit our storefront in Nairobi CBD during regular business
                hours to browse physical product samples, pick up online orders,
                or consult directly with an account manager.
              </p>
            ),
          },
        ]}
        faqs={[
          {
            question: 'What are Devireen Enterprise operating hours?',
            answer:
              'We are open Monday through Friday from 8:00 AM to 6:00 PM, and Saturday from 9:00 AM to 2:00 PM. We are closed on Sundays and public holidays.',
          },
          {
            question:
              'How can I contact customer support regarding an existing order?',
            answer:
              'Call our support line at +254 708 037929 or email devireenenterprise@gmail.com with your order reference number for rapid assistance.',
          },
        ]}
      />
    </div>
  );
}
