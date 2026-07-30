import Image from 'next/image';
import Link from 'next/link';
import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { Button } from '@/components/ui/Button';
import { TrustBadge } from '@/components/shared/TrustBadge';
import { fetchProducts } from '@/actions/product.actions';
import { ProductCard } from '@/components/products/ProductCard';
import {
  Percent,
  Package,
  Truck,
  Shield,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  Download,
} from 'lucide-react';

export const metadata = {
  title: 'Wholesale & Bulk Orders | Devireen Enterprise',
  description: 'Browse our wholesale catalog and enjoy exclusive bulk pricing.',
};

const benefits = [
  {
    icon: <Percent className="h-6 w-6" />,
    title: 'Exclusive Bulk Pricing',
    description:
      'Enjoy special wholesale rates on all items in our wholesale catalog.',
  },
  {
    icon: <Truck className="h-6 w-6" />,
    title: 'Priority Logistics',
    description:
      'Expedited processing and dedicated nationwide delivery for all corporate orders.',
  },
  {
    icon: <UserCheck className="h-6 w-6" />,
    title: 'Account Manager',
    description:
      "A single point of contact dedicated to your organization's procurement needs.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Quality Assured',
    description:
      'Every product is inspected before dispatch to meet strict corporate standards.',
  },
];

export default async function WholesalePage() {
  const { data: products } = await fetchProducts({ context: 'wholesale' });

  // For this page, we display all IN_STOCK products that have a bulk price set
  const availableProducts =
    products?.filter(
      (p: any) => p.stock_status !== 'DISCONTINUED' && p.wholesale_price != null
    ) || [];

  return (
    <div className="bg-background flex min-h-screen flex-col">
      {/* ─── Hero ─── */}
      <section className="bg-hero-gradient border-border-subtle border-b">
        <div className="container mx-auto px-4 py-16 md:py-20 lg:py-24">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left — Copy */}
            <AnimatedSection animation="fade-up">
              {/* Trust badges */}
              <div className="mb-6 flex flex-wrap gap-2">
                <TrustBadge
                  label="B2B Wholesale Portal"
                  icon={<Shield className="h-3.5 w-3.5" />}
                />
                <TrustBadge
                  label="500+ Products"
                  icon={<Package className="h-3.5 w-3.5" />}
                />
                <TrustBadge
                  label="Priority Delivery"
                  icon={<Truck className="h-3.5 w-3.5" />}
                />
              </div>

              {/* Headline */}
              <h1 className="text-text-main text-4xl leading-[1.1] font-extrabold tracking-tight md:text-5xl lg:text-[3.25rem]">
                Exclusive Wholesale Pricing{' '}
                <span className="text-primary-600">for Your Organization</span>
              </h1>

              {/* Description */}
              <p className="text-text-body mt-5 text-lg leading-relaxed">
                Browse our complete catalogue with{' '}
                <strong>exclusive bulk rates</strong> applied — built for
                schools, hospitals, NGOs, corporates and government institutions
                across Kenya.
              </p>

              {/* Industry tags */}
              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  'Schools',
                  'Hospitals',
                  'NGOs',
                  'Corporates',
                  'Government',
                ].map((tag) => (
                  <span
                    key={tag}
                    className="bg-primary-50 text-primary-700 border-primary-100 rounded-full border px-3 py-1 text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTAs */}
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="#catalog">
                  <Button size="lg" variant="primary">
                    View Wholesale Catalog
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <a href="/api/catalog" download>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Full Catalog (PDF)
                  </Button>
                </a>
              </div>
            </AnimatedSection>

            {/* Right — Hero image + floating accent cards */}
            <AnimatedSection
              animation="slide-left"
              delay={200}
              className="relative hidden lg:block"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl">
                <Image
                  src="/images/hero_main.png"
                  alt="Wholesale office supplies and stationery products"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>

              {/* Floating card — bottom left */}
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

              {/* Floating card — top right */}
              <div className="bg-surface border-border-subtle absolute -top-4 -right-4 flex items-center gap-2.5 rounded-xl border p-3 shadow-lg">
                <div className="bg-primary-50 text-primary-600 flex h-8 w-8 items-center justify-center rounded-full">
                  <Percent className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-text-main text-xs font-bold">
                    Up to 40% off
                  </div>
                  <div className="text-text-muted text-xs">
                    vs. retail pricing
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ─── Benefits Banner ─── */}
      <section className="bg-surface border-border-subtle border-b py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b, i) => (
              <AnimatedSection
                key={b.title}
                animation="fade-up"
                delay={i * 100}
              >
                <div className="flex items-start gap-4">
                  <div className="bg-primary-50 text-primary-600 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                    {b.icon}
                  </div>
                  <div>
                    <h3 className="text-text-main mb-1 font-bold">{b.title}</h3>
                    <p className="text-text-muted text-sm leading-relaxed">
                      {b.description}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Wholesale Catalog ─── */}
      <section id="catalog" className="scroll-mt-20 py-12 md:py-24">
        <div className="container mx-auto px-4">
          <div>
            <h2 className="text-text-main text-3xl font-bold tracking-tight">
              Wholesale Products
            </h2>
            <p className="text-text-muted mt-2">
              All items are sold in wholesale units as specified per product.
            </p>
          </div>
          <div className="mb-10 flex flex-col items-end justify-between gap-4 md:flex-row">
            <div className="text-primary-600 bg-primary-50 rounded-lg px-4 py-2 text-sm font-medium">
              {availableProducts.length} Products Available
            </div>
          </div>

          {availableProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
              {availableProducts.map((product: any) => {
                const primaryImage =
                  product.product_images?.find((img: any) => img.is_primary) ||
                  product.product_images?.[0];

                return (
                  <AnimatedSection key={product.id} animation="fade-up">
                    <ProductCard
                      id={product.id}
                      slug={product.slug}
                      name={product.name}
                      sku={product.sku}
                      price={product.wholesale_price}
                      originalPrice={product.price}
                      imageUrl={primaryImage?.url || '/placeholder.svg'}
                      stockStatus={product.stock_status}
                      addQuantity={1}
                      addLabel={`Add 1 ${product.wholesale_unit || 'Dozen'}`}
                    />
                  </AnimatedSection>
                );
              })}
            </div>
          ) : (
            <div className="bg-surface border-border-subtle rounded-2xl border py-20 text-center">
              <Package className="text-border-strong mx-auto mb-4 h-12 w-12" />
              <h3 className="text-text-main text-lg font-semibold">
                No products available
              </h3>
              <p className="text-text-muted mt-1">Please check back later.</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── CTA Bottom ─── */}
      <section className="bg-primary-700 py-12 text-center md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Need something not listed?
          </h2>
          <p className="text-primary-100 mx-auto mb-8 max-w-2xl text-lg">
            Our sourcing team can acquire specific items in bulk tailored to
            your organization&apos;s exact requirements.
          </p>
          <Link href="/contact">
            <Button
              size="lg"
              variant="secondary"
              className="text-primary-700 bg-white px-8 hover:bg-gray-50"
            >
              Contact Procurement Desk
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
