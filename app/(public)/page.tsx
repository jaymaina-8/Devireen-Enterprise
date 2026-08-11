import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/products/ProductCard';
import { SectionHeading } from '@/components/layout/SectionHeading';
import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { ProcessTimeline } from '@/components/shared/ProcessTimeline';
import { LogoCarousel } from '@/components/shared/LogoCarousel';
import { TestimonialCard } from '@/components/shared/TestimonialCard';
import { IndustryCard } from '@/components/shared/IndustryCard';
import { TrustBadge } from '@/components/shared/TrustBadge';
import { fetchProducts } from '@/actions/product.actions';
import { fetchCategories } from '@/actions/category.actions';
import {
  ArrowRight,
  Package,
  Truck,
  ShieldCheck,
  Clock,
  PackageSearch,
  LayoutGrid,
  Search,
  Award,
  Users,
  Tag,
  DollarSign,
  Star,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import { StockStatus } from '@/components/products/StockIndicator';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  OrganizationJsonLd,
  LocalBusinessJsonLd,
  WebSiteJsonLd,
} from '@/lib/seo/structured-data';
import { SeoContentSection } from '@/components/seo/SeoContentSection';

export const metadata = {
  title:
    'Office Supplies, Stationery & School Essentials | Devireen Enterprise Nairobi',
  description:
    "Devireen Enterprise is Nairobi's leading supplier of office supplies, stationery, school accessories, books, and bulk educational supplies. Fast delivery across Kenya.",
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title:
      'Office Supplies, Stationery & School Essentials | Devireen Enterprise Nairobi',
    description:
      "Nairobi's trusted supplier of office supplies, stationery, school accessories, books, and bulk educational supplies.",
    url: 'https://www.devireenenterprise.com/',
    images: [
      {
        url: '/images/hero_main.png',
        width: 1200,
        height: 630,
        alt: 'Devireen Enterprise Stationery & Office Supplies',
      },
    ],
  },
};

/* ─── Category imagery (AI-generated, stored locally) ─── */
const categoryImages: Record<string, string> = {
  'office-furniture': '/images/category_office_furniture.png',
  'printer-supplies': '/images/category_printer_supplies.png',
  stationery: '/images/category_stationery.png',
  technology: '/images/category_technology.png',
  cleaning: '/images/category_cleaning.png',
  'school-supplies': '/images/category_school_supplies.png',
  'paper-products': '/images/category_stationery.png',
  'office-equipment': '/images/category_office_equipment.png',
  'office-supplies': '/images/category_office_supplies.png',
  packaging: '/images/category_office_supplies.png',
};

const defaultCategoryImage = '/images/category_office_supplies.png';

/* ─── Category descriptions ─── */
const categoryDescriptions: Record<string, string> = {
  'office-furniture': 'Desks, chairs, shelves and ergonomic solutions.',
  'printer-supplies': 'Toner cartridges, ink, paper and printer accessories.',
  stationery: 'Pens, notebooks, markers, rulers and writing essentials.',
  technology: 'Laptops, accessories, cables and tech peripherals.',
  cleaning: 'Disinfectants, paper towels, sanitizers and hygiene supplies.',
  'school-supplies': 'Exercise books, sets, backpacks and classroom tools.',
  'school-accessories': 'Pencil cases, rulers, geometry sets and art supplies.',
  'paper-products': 'Notebooks, exercise books, copy paper and writing pads.',
  'office-equipment': 'Printers, shredders, laminators and copiers.',
  'office-supplies': 'Folders, staplers, clips, tape and daily essentials.',
  packaging: 'Boxes, tape, labels and wrapping materials.',
};

/* ─── Testimonials ─── */
const testimonials = [
  {
    quote:
      'Devireen has transformed how we manage office procurement. Their quote system saves us hours every month, and deliveries are always on schedule.',
    name: 'Grace Wanjiku',
    role: 'Procurement Manager',
    company: 'KCB Group',
    rating: 5,
    avatarUrl: '/images/testimonial_grace.png',
  },
  {
    quote:
      'We switched from three separate vendors to Devireen for all our school supplies. The catalogue depth and competitive pricing are unmatched in Kenya.',
    name: 'James Ochieng',
    role: 'Head of Operations',
    company: 'Alliance Schools',
    rating: 5,
    avatarUrl: '/images/testimonial_james.png',
  },
  {
    quote:
      'Their dedicated account manager understands our needs perfectly. Bulk ordering for our 12 branches has never been this seamless.',
    name: 'Amina Hassan',
    role: 'Office Administrator',
    company: 'Nairobi Hospital',
    rating: 5,
    avatarUrl: '/images/testimonial_amina.png',
  },
];

/* ─── Value Proposition Cards ─── */
const whyCards = [
  {
    icon: <DollarSign className="h-6 w-6" />,
    title: 'Competitive Pricing',
    description:
      'Wholesale rates and volume pricing across all 500+ products in our catalogue.',
  },
  {
    icon: <Truck className="h-6 w-6" />,
    title: 'Nationwide Delivery',
    description: 'Fast, reliable delivery to all 47 counties across Kenya.',
  },
  {
    icon: <Tag className="h-6 w-6" />,
    title: 'Bulk Discounts',
    description:
      'The more you order, the more you save — automatic volume pricing on large orders.',
  },
  {
    icon: <Award className="h-6 w-6" />,
    title: 'Trusted Brands',
    description:
      'Only verified manufacturers and quality-assured products in our catalogue.',
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: '24hr Quotations',
    description:
      'Receive detailed, itemized quotations within one business day of your request.',
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Dedicated Account Support',
    description:
      'A personal account manager for your school, business, hospital, or institution.',
  },
];

/* ─── Industries ─── */
const industries = [
  {
    name: 'Schools & Universities',
    description:
      'Exercise books, chalk, markers, printers and all classroom essentials.',
    imageUrl: '/images/industry_schools.png',
  },
  {
    name: 'Hospitals & Clinics',
    description:
      'Administrative supplies, printing and stationery for medical facilities.',
    imageUrl: '/images/industry_hospitals.png',
  },
  {
    name: 'Corporate Offices',
    description:
      'Office supplies, technology and furniture for productive workplaces.',
    imageUrl: '/images/industry_corporate.png',
  },
  {
    name: 'Government Agencies',
    description:
      'Bulk procurement of stationery, equipment and office essentials.',
    imageUrl: '/images/industry_government.png',
  },
];

/* ─── SEO Content Layer Sections ─── */
const homepageSeoSections = [
  {
    heading: 'Comprehensive Office Supplies & Stationery in Nairobi',
    content: (
      <p>
        Devireen Enterprise is your one-stop supplier for quality stationery,
        writing materials, filing products, printer paper, toner cartridges, and
        desk organization tools. Whether equipping a corporate boardroom or a
        local business office, our catalogue brings together verified
        manufacturers to ensure long-lasting performance and corporate
        compliance.
      </p>
    ),
  },
  {
    heading: 'Primary, Secondary & Institutional Educational Supplies',
    content: (
      <p>
        We partner with schools, colleges, and training institutes across Kenya
        to provide exercise books, geometry sets, art supplies, chalkboards, and
        classroom tools. Our school packages are tailored to meet curriculum
        requirements while offering educational administrators reliable
        inventory throughout the academic calendar.
      </p>
    ),
  },
  {
    heading: 'Bulk Purchasing & Wholesale Pricing for Organizations',
    content: (
      <p>
        For NGOs, medical facilities, government agencies, and multi-branch
        enterprises, Devireen Enterprise provides dedicated B2B procurement
        support. Enjoy itemized volume pricing, custom quotation turnarounds
        within 24 hours, and flexible invoicing tailored to corporate finance
        procedures.
      </p>
    ),
  },
  {
    heading: 'Fast Delivery & Local Store Pickup Across All 47 Counties',
    content: (
      <p>
        Based in Nairobi CBD, Devireen Enterprise operates a dedicated retail
        and wholesale storefront. Orders can be dispatched directly to your
        doorstep in Nairobi within 1 to 2 business days or shipped via verified
        courier partners to all 47 counties in Kenya.
      </p>
    ),
  },
];

const homepageFaqs = [
  {
    question: 'Where is Devireen Enterprise located in Nairobi?',
    answer:
      'Devireen Enterprise is headquartered in Nairobi CBD, Kenya. Customers can visit our retail and wholesale store for in-person orders or place requests online for fast nationwide delivery.',
  },
  {
    question: 'What types of stationery and supplies do you offer?',
    answer:
      'We supply ballpoint pens, notebooks, exercise books, printing paper, toner cartridges, office equipment, furniture, art materials, and school accessories.',
  },
  {
    question: 'How do I request a bulk or wholesale quotation?',
    answer:
      'Browse our catalogue, add items to your quote cart, and submit your request. Our procurement team will generate an itemized quote within 24 hours.',
  },
  {
    question: 'What are the delivery options and timelines?',
    answer:
      'Nairobi deliveries take 1 to 2 business days. Deliveries outside Nairobi take 2 to 4 business days depending on the county location.',
  },
];

export default async function HomePage() {
  const [{ data: products }, { data: categories }] = await Promise.all([
    fetchProducts({ context: 'retail' }),
    fetchCategories(),
  ]);

  const inStockProducts =
    products?.filter((p: any) => p.stock_status === 'IN_STOCK') || [];
  const featuredProducts = (
    inStockProducts.length > 0 ? inStockProducts : products || []
  ).slice(0, 8);

  // Show all active categories from the DB (up to 6), sorted by name.
  // No need to hardcode slugs — any category added in the dashboard will appear automatically.
  const displayCategories = (categories || []).slice(0, 6);

  return (
    <div className="flex min-h-screen flex-col">
      <OrganizationJsonLd />
      <LocalBusinessJsonLd />
      <WebSiteJsonLd />
      {/* ─────────────────────────────────────────────────
          1. HERO
      ───────────────────────────────────────────────── */}
      <section className="bg-hero-gradient border-border-subtle border-b">
        <div className="container mx-auto px-4 py-16 md:py-20 lg:py-24">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left — Copy */}
            <div className="max-w-xl">
              <div className="mb-6 flex flex-wrap gap-2">
                <TrustBadge
                  label="500+ Products"
                  icon={<Package className="h-3.5 w-3.5" />}
                />
                <TrustBadge
                  label="24hr Quote Turnaround"
                  icon={<Clock className="h-3.5 w-3.5" />}
                />
                <TrustBadge
                  label="Nationwide Delivery"
                  icon={<Truck className="h-3.5 w-3.5" />}
                />
              </div>

              <h1 className="text-text-main text-4xl leading-[1.1] font-extrabold tracking-tight md:text-5xl lg:text-[3.25rem]">
                Office Supplies, Stationery &amp; School Essentials{' '}
                <span className="text-primary-600">
                  — Delivered Across Kenya.
                </span>
              </h1>

              <p className="text-text-body mt-5 text-lg leading-relaxed">
                Devireen supplies{' '}
                <strong>businesses, schools, NGOs, hospitals,</strong> and{' '}
                <strong>government institutions</strong> with 500+
                quality-assured products — from pens and printer paper to
                furniture and classroom supplies.
              </p>

              {/* Search bar */}
              <form
                action="/products"
                method="GET"
                className="border-primary-200 hover:border-primary-400 focus-within:border-primary-600 focus-within:ring-primary-100 mt-7 flex max-w-full items-center rounded-xl border-2 bg-white shadow-sm transition-all duration-200 focus-within:ring-4"
              >
                <Search className="text-text-muted ml-3 h-5 w-5 shrink-0 sm:ml-4" />
                <input
                  type="text"
                  name="q"
                  placeholder="Search — printer paper, exercise books, pens..."
                  className="text-text-main placeholder:text-text-muted w-full min-w-0 bg-transparent px-2 py-3.5 text-xs focus:outline-none sm:px-3 sm:text-sm"
                  aria-label="Search products"
                />
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 mr-1.5 shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-white transition-all active:scale-[0.98] sm:mr-2 sm:px-4 sm:text-sm"
                  aria-label="Search"
                >
                  Search
                </button>
              </form>

              <div className="mt-5 flex flex-col gap-3">
                <Link href="/products" className="w-full">
                  <Button
                    size="lg"
                    variant="primary"
                    className="w-full justify-center"
                  >
                    Browse Products
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/wholesale" className="w-full">
                  <Button
                    size="lg"
                    className="w-full justify-center border-transparent bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    Browse Wholesale
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right — Hero Image */}
            <div className="relative hidden lg:block">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <Image
                  src="/images/hero_main.png"
                  alt="Premium office supplies and stationery — organized desk with notebooks, pens and supplies"
                  width={1000}
                  height={1000}
                  className="h-auto w-full object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
              {/* Floating cards */}
              <div className="bg-surface border-border-subtle absolute -bottom-4 -left-4 flex items-center gap-3 rounded-xl border p-4 shadow-lg">
                <div className="bg-success/10 text-success flex h-10 w-10 items-center justify-center rounded-full">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-text-main text-sm font-bold">
                    Trusted by 200+
                  </div>
                  <div className="text-text-muted text-xs">
                    organizations across Kenya
                  </div>
                </div>
              </div>
              <div className="bg-surface border-border-subtle absolute -top-4 -right-4 flex items-center gap-2.5 rounded-xl border p-3 shadow-lg">
                <div className="bg-primary-50 text-primary-600 flex h-8 w-8 items-center justify-center rounded-full">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-text-main text-xs font-bold">24-hr</div>
                  <div className="text-text-muted text-xs">
                    Quote turnaround
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────
          2. STOREFRONT SHOWCASE
      ───────────────────────────────────────────────── */}
      <section className="bg-surface border-border-subtle border-b py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <a
              href="https://www.google.com/maps/place/Devireen+Enterprise./@-1.28181,36.825743,17z/data=!3m1!4b1!4m6!3m5!1s0x182f118fa27150b5:0xe0fb2ec5aa188109!8m2!3d-1.2818154!4d36.8283179!16s%2Fg%2F11nth4f4zs"
              target="_blank"
              rel="noopener noreferrer"
              className="group border-border-subtle relative block overflow-hidden rounded-2xl border bg-gray-50 shadow-xl"
            >
              <Image
                src="/images/storefront.jpg"
                alt="Devireen Stationers Wholesale & Retail Storefront"
                width={1200}
                height={900}
                className="h-auto w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                sizes="(max-width: 1200px) 100vw, 1200px"
                priority
              />
              {/* Persistent Overlay Message */}
              <div className="absolute inset-x-0 bottom-0 flex items-end bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 sm:p-8">
                <div className="transform text-white transition-transform duration-300 group-hover:-translate-y-1">
                  <div className="mb-1 flex items-center gap-2 text-lg font-bold sm:text-xl">
                    <MapPin className="text-primary-500 h-5 w-5 sm:h-6 sm:w-6" />
                    Visit Our Store
                  </div>
                  <p className="text-sm font-medium text-white/90 sm:text-base">
                    Click here for Google Maps directions to Devireen Enterprise
                  </p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>
      {/* ─────────────────────────────────────────────────
          2. TRUST STRIP
      ───────────────────────────────────────────────── */}
      <section className="bg-surface border-border-subtle border-b py-8">
        <div className="container mx-auto px-4">
          <p className="text-text-muted mb-5 text-center text-xs font-semibold tracking-widest uppercase">
            Trusted by organizations across Kenya
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {[
              {
                icon: <Package className="h-4 w-4 shrink-0" />,
                label: '500+ Products',
              },
              {
                icon: <Truck className="h-4 w-4 shrink-0" />,
                label: 'Nationwide Delivery',
              },
              {
                icon: <Clock className="h-4 w-4 shrink-0" />,
                label: '24hr Quotations',
              },
              {
                icon: <ShieldCheck className="h-4 w-4 shrink-0" />,
                label: 'Secure Procurement',
              },
              {
                icon: <Star className="h-4 w-4 shrink-0" />,
                label: '98% Satisfaction',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-primary-50 text-primary-700 border-primary-100 flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold"
              >
                {item.icon}
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 overflow-hidden">
          <LogoCarousel />
        </div>
      </section>

      {/* ─────────────────────────────────────────────────
          3. CATEGORIES
      ───────────────────────────────────────────────── */}
      <section className="bg-background py-12 md:py-24">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up">
            <SectionHeading
              title="Browse Categories"
              subtitle="Office supplies, stationery, school supplies, equipment and more — everything your organization needs."
              action={
                displayCategories.length > 0 && (
                  <Link href="/products" className="hidden sm:inline-flex">
                    <Button variant="ghost">
                      View All <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )
              }
              className="mb-10"
            />
          </AnimatedSection>

          {displayCategories.length === 0 ? (
            <EmptyState
              icon={LayoutGrid}
              title="No categories available"
              description="Our catalog is currently being updated. Please check back later."
              className="bg-surface border-border-subtle border"
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
              {displayCategories.map((c: any, i: number) => (
                <AnimatedSection key={c.id} animation="fade-up" delay={i * 80}>
                  <Link
                    href={`/products?category=${c.slug}`}
                    className="group block"
                  >
                    <div className="relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl shadow-sm transition-shadow duration-300 hover:shadow-md">
                      <Image
                        src={categoryImages[c.slug] || defaultCategoryImage}
                        alt={c.name}
                        fill
                        className="img-zoom object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                      <div className="absolute inset-0 flex flex-col justify-end p-4">
                        <h3 className="text-base font-bold text-white md:text-lg">
                          {c.name}
                        </h3>
                        <p className="mt-0.5 line-clamp-1 text-xs text-white/70">
                          {categoryDescriptions[c.slug] ||
                            'Browse our full range.'}
                        </p>
                        {c.productCount !== undefined && (
                          <p className="mt-0.5 text-xs text-white/55">
                            {c.productCount} Products
                          </p>
                        )}
                        <div className="mt-1.5 flex items-center gap-1 text-xs text-white/80 transition-transform duration-300 group-hover:translate-x-1">
                          <span>Shop now</span>
                          <ArrowRight className="h-3 w-3" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          )}

          {displayCategories.length > 0 && (
            <Link href="/products" className="mt-6 block w-full sm:hidden">
              <Button variant="ghost" className="w-full">
                View All Categories <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────
          4. FEATURED PRODUCTS
      ───────────────────────────────────────────────── */}
      <section className="bg-surface border-border-subtle border-y py-12 md:py-24">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up">
            <SectionHeading
              title="Featured Products"
              subtitle="Top picks for your procurement needs."
              action={
                <Link href="/products" className="hidden sm:inline-flex">
                  <Button variant="ghost">
                    View All <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              }
              className="mb-10"
            />
          </AnimatedSection>

          {featuredProducts.length === 0 ? (
            <div className="bg-background border-border-subtle flex flex-col items-center justify-center rounded-2xl border py-16 text-center">
              <div className="bg-primary-50 text-primary-600 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <PackageSearch className="h-8 w-8" />
              </div>
              <h3 className="text-text-main mb-2 text-lg font-bold">
                Featured products coming soon
              </h3>
              <p className="text-text-muted mb-6 max-w-xs text-sm">
                We are currently curating our featured product selection. In the
                meantime, browse our full catalogue.
              </p>
              <Link href="/products">
                <Button variant="primary">
                  Browse All Products <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {featuredProducts.map((product: any, i: number) => {
                const primaryImage =
                  product.product_images?.find((img: any) => img.is_primary) ||
                  product.product_images?.[0];
                return (
                  <AnimatedSection
                    key={product.id}
                    animation="fade-up"
                    delay={i * 80}
                  >
                    <ProductCard
                      id={product.id}
                      slug={product.slug}
                      name={product.name}
                      sku={product.sku}
                      price={product.sale_price || product.price}
                      originalPrice={
                        product.sale_price ? product.price : undefined
                      }
                      imageUrl={primaryImage?.url || null}
                      stockStatus={product.stock_status as StockStatus}
                    />
                  </AnimatedSection>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────
          5. HOW IT WORKS
      ───────────────────────────────────────────────── */}
      <section className="bg-background py-12 md:py-24">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up">
            <div className="mb-12 text-center">
              <h2 className="text-text-main text-3xl font-bold md:text-4xl">
                How it works
              </h2>
              <p className="text-text-muted mx-auto mt-3 max-w-2xl text-lg">
                From browsing to delivery — procurement in five simple steps.
              </p>
            </div>
          </AnimatedSection>
          <AnimatedSection animation="fade-up" delay={200}>
            <ProcessTimeline />
          </AnimatedSection>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────
          6. WHY CHOOSE US
      ───────────────────────────────────────────────── */}
      <section className="bg-surface border-border-subtle border-y py-12 md:py-24">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up">
            <div className="mb-12 text-center">
              <h2 className="text-text-main text-3xl font-bold md:text-4xl">
                Why choose Devireen
              </h2>
              <p className="text-text-muted mx-auto mt-3 max-w-2xl text-lg">
                Built for procurement teams, school administrators and business
                owners who need reliability.
              </p>
            </div>
          </AnimatedSection>

          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3">
            {whyCards.map((card, i) => (
              <AnimatedSection
                key={card.title}
                animation="fade-up"
                delay={i * 80}
              >
                <div className="bg-background border-border-subtle hover:border-primary-200 flex h-full flex-col rounded-xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <div className="bg-primary-50 text-primary-600 mb-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                    {card.icon}
                  </div>
                  <h3 className="text-text-main mb-2 text-base font-bold">
                    {card.title}
                  </h3>
                  <p className="text-text-muted text-sm leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* Stats strip */}
          <AnimatedSection animation="fade-up" delay={400}>
            <div className="border-border-subtle mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-6 border-t pt-12 text-center md:grid-cols-4">
              {[
                {
                  value: '500+',
                  label: 'Products',
                  sub: 'Across all categories',
                },
                { value: '98%', label: 'Satisfaction', sub: 'Customer rating' },
                {
                  value: '24hr',
                  label: 'Quote Time',
                  sub: 'Average turnaround',
                },
                { value: '47', label: 'Counties', sub: 'Delivery coverage' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-primary-600 text-3xl font-extrabold tracking-tight md:text-4xl">
                    {stat.value}
                  </div>
                  <div className="text-text-main mt-1.5 text-sm font-semibold tracking-wider uppercase">
                    {stat.label}
                  </div>
                  <div className="text-text-muted mt-0.5 text-xs">
                    {stat.sub}
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────
          7. INDUSTRIES
      ───────────────────────────────────────────────── */}
      <section className="bg-background py-12 md:py-24">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up">
            <div className="mb-12 text-center">
              <h2 className="text-text-main text-3xl font-bold md:text-4xl">
                Industries we serve
              </h2>
              <p className="text-text-muted mx-auto mt-3 max-w-2xl text-lg">
                From classrooms to boardrooms — supplying organizations across
                every sector.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {industries.map((industry, i) => (
              <AnimatedSection
                key={industry.name}
                animation="fade-up"
                delay={i * 80}
              >
                <IndustryCard
                  name={industry.name}
                  description={industry.description}
                  imageUrl={industry.imageUrl}
                />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────
          8. TESTIMONIALS
      ───────────────────────────────────────────────── */}
      <section className="bg-surface border-border-subtle border-y py-12 md:py-24">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up">
            <div className="mb-12 text-center">
              <h2 className="text-text-main text-3xl font-bold md:text-4xl">
                What our clients say
              </h2>
              <p className="text-text-muted mx-auto mt-3 max-w-2xl text-lg">
                Trusted by procurement teams, school administrators and business
                owners across Kenya.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <AnimatedSection key={i} animation="fade-up" delay={i * 100}>
                <TestimonialCard
                  quote={t.quote}
                  name={t.name}
                  role={t.role}
                  company={t.company}
                  rating={t.rating}
                  avatarUrl={t.avatarUrl}
                />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────
          9. BULK PROCUREMENT CTA
      ───────────────────────────────────────────────── */}
      <section className="from-primary-700 via-primary-800 relative flex min-h-[380px] items-center overflow-hidden bg-gradient-to-br to-[#7f1d1d]">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
          aria-hidden="true"
        />
        {/* Decorative circles */}
        <div
          className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-white/5"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/5"
          aria-hidden="true"
        />

        <div className="relative z-10 container mx-auto flex flex-col items-center px-4 py-16 text-center md:py-24">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80">
            <Package className="h-4 w-4" />
            Bulk &amp; Enterprise Procurement
          </div>
          <h2 className="mb-5 max-w-3xl text-3xl leading-tight font-bold text-white md:text-4xl lg:text-5xl">
            Need Procurement Support for Your Organization?
          </h2>
          <p className="mb-6 max-w-2xl text-lg leading-relaxed text-white/80">
            Our dedicated B2B team provides custom quotes, bulk discounts, and
            priority delivery for schools, businesses, hospitals, government
            agencies, and NGOs.
          </p>
          <div className="mb-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/70">
            {[
              'Dedicated account managers',
              'Bulk discounts',
              'Custom sourcing',
              'Fast quotations',
              'Large order handling',
            ].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="text-primary-200 h-4 w-4 shrink-0" />
                {item}
              </span>
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/quote">
              <Button
                size="lg"
                variant="secondary"
                className="text-primary-700 bg-white font-semibold hover:bg-gray-50"
              >
                Request a Quote
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SEO Content Layer */}
      <SeoContentSection
        title="Devireen Enterprise — Stationery, Office & Educational Supplies in Nairobi"
        subtitle="Serving businesses, schools, NGOs, hospitals, and government institutions across Kenya."
        sections={homepageSeoSections}
        faqs={homepageFaqs}
      />
    </div>
  );
}
