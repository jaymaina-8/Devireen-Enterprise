import Image from 'next/image';
import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { StatCounter } from '@/components/shared/StatCounter';
import { TrustBadge } from '@/components/shared/TrustBadge';
import {
  ShieldCheck,
  Target,
  Eye,
  Heart,
  Truck,
  Award,
  Users,
  CheckCircle2,
} from 'lucide-react';

import { OrganizationJsonLd } from '@/lib/seo/structured-data';
import { SeoContentSection } from '@/components/seo/SeoContentSection';

export const metadata = {
  title: 'About Us | Devireen Enterprise Nairobi',
  description:
    "Learn about Devireen Enterprise, Nairobi's trusted supplier of office supplies, stationery, school accessories, books, and bulk educational supplies since 2018.",
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Us | Devireen Enterprise Nairobi',
    description:
      "Nairobi's trusted supplier of office supplies, stationery, school accessories, books, and bulk educational supplies.",
    url: 'https://www.devireenenterprise.com/about',
    images: [
      {
        url: '/images/hero_main.png',
        width: 1200,
        height: 630,
        alt: 'About Devireen Enterprise',
      },
    ],
  },
};

const values = [
  {
    icon: <ShieldCheck className="h-7 w-7" />,
    title: 'Quality First',
    description:
      'We partner only with trusted manufacturers to ensure every product meets corporate standards.',
  },
  {
    icon: <Users className="h-7 w-7" />,
    title: 'Customer Focus',
    description:
      "Every decision we make starts with our clients' needs. Your success is our success.",
  },
  {
    icon: <Award className="h-7 w-7" />,
    title: 'Reliability',
    description:
      'Consistent delivery, transparent pricing, and dependable stock levels you can count on.',
  },
  {
    icon: <Heart className="h-7 w-7" />,
    title: 'Integrity',
    description:
      'Honest pricing, no hidden fees, and straightforward business relationships.',
  },
];

const milestones = [
  {
    year: '2018',
    title: 'Founded',
    description: 'Devireen Enterprise launched in Nairobi CBD.',
  },
  {
    year: '2019',
    title: '100+ Products',
    description: 'Expanded catalogue to serve corporate offices.',
  },
  {
    year: '2021',
    title: 'Nationwide Delivery',
    description: 'Extended logistics to all 47 counties.',
  },
  {
    year: '2023',
    title: 'Digital Platform',
    description: 'Launched B2B procurement platform with quote system.',
  },
  {
    year: '2024',
    title: '500+ Products',
    description: 'Catalogue expansion across 8 major categories.',
  },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <OrganizationJsonLd />
      {/* ─── Hero ─── */}
      <section className="bg-surface border-border-subtle relative overflow-hidden border-b pt-24 pb-16 md:pt-32 md:pb-24">
        {/* Subtle Background Pattern */}
        <div className="from-primary-50/50 via-surface to-surface pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]" />

        <div className="relative z-10 container mx-auto px-4">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <AnimatedSection animation="slide-right">
              <TrustBadge
                label="About Devireen Enterprise"
                variant="default"
                className="mb-6"
              />
              <h1 className="text-text-main mb-6 text-3xl leading-tight font-extrabold tracking-tight md:text-5xl lg:text-6xl">
                Your trusted partner in{' '}
                <span className="text-primary-600">corporate procurement</span>
              </h1>
              <p className="text-text-muted mb-8 max-w-lg text-lg leading-relaxed md:text-xl">
                Simplifying how businesses, schools, and organizations source
                office supplies, stationery, and equipment across Kenya since
                2018.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="text-text-main flex items-center gap-2 text-sm font-semibold">
                  <CheckCircle2 className="text-primary-600 h-5 w-5" /> Fast
                  Delivery
                </div>
                <div className="text-text-main flex items-center gap-2 text-sm font-semibold">
                  <CheckCircle2 className="text-primary-600 h-5 w-5" />{' '}
                  Wholesale Pricing
                </div>
                <div className="text-text-main flex items-center gap-2 text-sm font-semibold">
                  <CheckCircle2 className="text-primary-600 h-5 w-5" /> Premium
                  Quality
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection
              animation="fade-up"
              delay={200}
              className="relative hidden lg:block"
            >
              <div className="relative mx-auto aspect-square max-w-md">
                <div className="bg-primary-100 absolute inset-0 rounded-full opacity-50 mix-blend-multiply blur-3xl" />
                <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/20 shadow-2xl">
                  <Image
                    src="/images/category_office_supplies.png"
                    alt="Office supplies and stationery products"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ─── Our Story & Stats ─── */}
      <section className="bg-background py-12 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-24">
            <AnimatedSection animation="slide-right">
              <h2 className="text-text-main mb-6 text-3xl font-bold md:text-4xl">
                Our Story
              </h2>
              <div className="text-text-body space-y-6 text-lg leading-relaxed">
                <p>
                  Founded in Nairobi, Devireen Enterprise has grown to become
                  one of Kenya&apos;s most reliable B2B suppliers for office
                  supplies, stationery, and equipment.
                </p>
                <p>
                  We understand that efficient procurement is the backbone of
                  any successful business, school, or NGO. That&apos;s why
                  we&apos;ve built a streamlined platform that lets you browse,
                  compare, and request quotes in minutes — not hours.
                </p>
                <p>
                  From single-office startups to multi-branch corporations, our
                  catalogue of 500+ products, competitive wholesale pricing, and
                  nationwide delivery network is designed to serve organizations
                  of every size.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={200}>
              <div className="bg-surface border-border-subtle relative overflow-hidden rounded-3xl border p-8 shadow-xl md:p-12">
                <div className="bg-primary-50 absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full opacity-50 blur-3xl" />

                <h3 className="text-text-main relative z-10 mb-8 text-2xl font-bold">
                  Devireen by the Numbers
                </h3>

                <div className="relative z-10 grid grid-cols-2 gap-8">
                  <div className="bg-background border-border-subtle hover:border-primary-200 rounded-2xl border p-6 transition-colors">
                    <StatCounter
                      value={500}
                      suffix="+"
                      label="Products"
                      className="[&>div:first-child]:text-primary-600 [&>div:nth-child(2)]:text-primary-600 [&>div:nth-child(3)]:text-text-muted"
                    />
                  </div>
                  <div className="bg-background border-border-subtle hover:border-primary-200 rounded-2xl border p-6 transition-colors">
                    <StatCounter
                      value={200}
                      suffix="+"
                      label="Clients"
                      className="[&>div:first-child]:text-primary-600 [&>div:nth-child(2)]:text-primary-600 [&>div:nth-child(3)]:text-text-muted"
                    />
                  </div>
                  <div className="bg-background border-border-subtle hover:border-primary-200 rounded-2xl border p-6 transition-colors">
                    <StatCounter
                      value={47}
                      suffix=""
                      label="Counties Served"
                      className="[&>div:first-child]:text-primary-600 [&>div:nth-child(2)]:text-primary-600 [&>div:nth-child(3)]:text-text-muted"
                    />
                  </div>
                  <div className="bg-background border-border-subtle hover:border-primary-200 rounded-2xl border p-6 transition-colors">
                    <StatCounter
                      value={6}
                      suffix="+"
                      label="Years Experience"
                      className="[&>div:first-child]:text-primary-600 [&>div:nth-child(2)]:text-primary-600 [&>div:nth-child(3)]:text-text-muted"
                    />
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ─── Mission & Vision ─── */}
      <section className="bg-primary-700 relative overflow-hidden py-12 text-white md:py-32">
        {/* Abstract Background Shapes */}
        <div className="pointer-events-none absolute top-0 left-0 h-full w-full overflow-hidden">
          <div className="absolute -top-[20%] -right-[10%] h-[150%] w-[50%] rotate-12 rounded-full bg-white opacity-5 blur-3xl" />
          <div className="bg-primary-900 absolute top-[50%] -left-[20%] h-[100%] w-[40%] -rotate-12 rounded-full opacity-30 blur-3xl" />
        </div>

        <div className="relative z-10 container mx-auto px-4">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
            <AnimatedSection animation="fade-up">
              <div className="h-full rounded-3xl border border-white/20 bg-white/10 p-10 backdrop-blur-md transition-colors hover:bg-white/15">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/20 shadow-inner backdrop-blur-sm">
                  <Target className="h-7 w-7 text-white" />
                </div>
                <h3 className="mb-4 text-3xl font-bold tracking-tight">
                  Our Mission
                </h3>
                <p className="text-lg leading-relaxed font-medium text-white/80">
                  To simplify the procurement process for modern businesses by
                  providing a comprehensive catalog of high-quality products,
                  transparent pricing, and fast nationwide delivery. We aim to
                  be the silent engine behind every productive workspace.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={150}>
              <div className="h-full rounded-3xl border border-white/20 bg-white/10 p-10 backdrop-blur-md transition-colors hover:bg-white/15">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/20 shadow-inner backdrop-blur-sm">
                  <Eye className="h-7 w-7 text-white" />
                </div>
                <h3 className="mb-4 text-3xl font-bold tracking-tight">
                  Our Vision
                </h3>
                <p className="text-lg leading-relaxed font-medium text-white/80">
                  To become East Africa&apos;s leading B2B procurement platform,
                  empowering businesses with seamless access to quality supplies
                  at competitive prices. We envision a future where sourcing
                  office essentials is entirely frictionless.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ─── Core Values ─── */}
      <section className="bg-surface py-12 md:py-32">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up">
            <div className="mb-16 text-center">
              <span className="text-primary-600 mb-3 block text-sm font-bold tracking-wider uppercase">
                What Drives Us
              </span>
              <h2 className="text-text-main text-3xl font-bold tracking-tight md:text-5xl">
                Our Core Values
              </h2>
            </div>
          </AnimatedSection>

          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {values.map((value, i) => (
              <AnimatedSection
                key={value.title}
                animation="fade-up"
                delay={i * 100}
              >
                <div className="group bg-background border-border-subtle hover:border-primary-200 h-full rounded-3xl border p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                  <div className="bg-primary-50 text-primary-600 group-hover:bg-primary-100 group-hover:text-primary-700 mb-6 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110">
                    {value.icon}
                  </div>
                  <h3 className="text-text-main mb-3 text-xl font-bold">
                    {value.title}
                  </h3>
                  <p className="text-text-muted leading-relaxed font-medium">
                    {value.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Timeline ─── */}
      <section className="bg-background border-border-subtle border-t py-12 md:py-32">
        <div className="container mx-auto max-w-4xl px-4">
          <AnimatedSection animation="fade-up">
            <div className="mb-20 text-center">
              <h2 className="text-text-main text-3xl font-bold tracking-tight md:text-5xl">
                Our Journey
              </h2>
              <p className="text-text-muted mt-4 text-xl">
                Growing alongside Kenyan businesses since 2018.
              </p>
            </div>
          </AnimatedSection>

          <div className="relative">
            {/* Vertical Line */}
            <div className="from-primary-100 via-primary-300 to-primary-100 absolute top-0 bottom-0 left-8 w-0.5 transform rounded-full bg-gradient-to-b md:left-1/2 md:-translate-x-1/2" />

            <div className="relative space-y-12">
              {milestones.map((m, i) => (
                <AnimatedSection
                  key={m.year}
                  animation="fade-up"
                  delay={i * 100}
                >
                  <div
                    className={`flex flex-col items-start gap-6 md:flex-row md:items-center md:gap-12 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                  >
                    {/* Content */}
                    <div
                      className={`flex-1 md:w-1/2 ${i % 2 === 0 ? 'pl-20 md:pr-12 md:pl-0 md:text-left' : 'pl-20 md:pl-12 md:text-right'}`}
                    >
                      <div className="bg-surface border-border-subtle rounded-2xl border p-6 shadow-sm transition-shadow hover:shadow-md">
                        <div className="text-primary-100/20 pointer-events-none absolute -z-10 -mt-2 -ml-2 text-3xl font-extrabold select-none">
                          {m.year}
                        </div>
                        <div className="text-primary-600 mb-1 text-lg font-bold">
                          {m.year}
                        </div>
                        <h4 className="text-text-main mb-2 text-xl font-bold">
                          {m.title}
                        </h4>
                        <p className="text-text-muted font-medium">
                          {m.description}
                        </p>
                      </div>
                    </div>

                    {/* Dot */}
                    <div className="absolute left-8 flex -translate-x-1/2 transform items-center justify-center md:left-1/2">
                      <div className="bg-background border-primary-600 z-10 h-6 w-6 rounded-full border-4 shadow-sm" />
                    </div>

                    {/* Empty Space for layout */}
                    <div className="hidden flex-1 md:block" />
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Operations Gallery ─── */}
      <section className="bg-surface border-border-subtle border-t py-12 md:py-32">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up">
            <div className="mb-16 text-center">
              <span className="text-primary-600 mb-3 block text-sm font-bold tracking-wider uppercase">
                Inside Devireen
              </span>
              <h2 className="text-text-main text-3xl font-bold tracking-tight md:text-5xl">
                Our Operations
              </h2>
              <p className="text-text-muted mx-auto mt-4 max-w-2xl text-xl">
                From quality sourcing to careful packaging and swift delivery.
              </p>
            </div>
          </AnimatedSection>

          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-12 lg:gap-6">
            {/* Large Image */}
            <AnimatedSection
              animation="scale-in"
              delay={100}
              className="h-64 md:col-span-8 md:h-[400px]"
            >
              <div className="group relative h-full w-full overflow-hidden rounded-3xl shadow-lg">
                <Image
                  src="/images/hero_main.png"
                  alt="Premium desk setup"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 66vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            </AnimatedSection>

            {/* Small Top Right */}
            <AnimatedSection
              animation="scale-in"
              delay={200}
              className="h-64 md:col-span-4 md:h-[400px]"
            >
              <div className="flex h-full flex-col gap-4 lg:gap-6">
                <div className="group relative flex-1 overflow-hidden rounded-3xl shadow-lg">
                  <Image
                    src="/images/category_office_equipment.png"
                    alt="Office Equipment"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="group relative flex-1 overflow-hidden rounded-3xl shadow-lg">
                  <Image
                    src="/images/category_stationery.png"
                    alt="Stationery"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* SEO Content Layer */}
      <SeoContentSection
        title="About Devireen Enterprise — Stationers & Office Suppliers in Nairobi"
        subtitle="Empowering businesses, educational institutions, and organizations across Kenya since 2018."
        sections={[
          {
            heading: 'Our Growth & Institutional Commitment',
            content: (
              <p>
                Founded in Nairobi CBD, Devireen Enterprise has expanded from a
                local commercial stationery shop into a trusted B2B procurement
                partner for over 200 corporate accounts, schools, medical
                institutions, and non-governmental organizations.
              </p>
            ),
          },
          {
            heading: 'Transparent B2B Sourcing & Pricing Integrity',
            content: (
              <p>
                We operate on principles of pricing transparency and stock
                reliability. By working directly with certified manufacturers,
                we eliminate unnecessary supply chain markups, passing volume
                savings directly to our educational and corporate clients.
              </p>
            ),
          },
          {
            heading: 'Nationwide Logistics & Customer Support',
            content: (
              <p>
                Our fulfillment team handles orders with dedicated logistics
                management. Whether delivering office paper to Nairobi CBD
                boardrooms or sending school supplies to remote county branches,
                we guarantee safe packaging and timely dispatch.
              </p>
            ),
          },
        ]}
        faqs={[
          {
            question:
              'How long has Devireen Enterprise been operating in Kenya?',
            answer:
              'Devireen Enterprise was established in 2018 in Nairobi, Kenya, and has served businesses and schools for over 6 years.',
          },
          {
            question: 'What industries does Devireen Enterprise serve?',
            answer:
              'We serve corporate offices, primary and secondary schools, universities, hospitals, clinics, government agencies, and non-profit organizations.',
          },
        ]}
      />
    </div>
  );
}
