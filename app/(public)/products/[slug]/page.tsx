import { fetchProductBySlug } from '@/actions/product.actions';
import { ProductImageGallery } from '@/components/products/ProductImageGallery';
import { Price } from '@/components/products/Price';
import {
  StockIndicator,
  StockStatus,
} from '@/components/products/StockIndicator';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronRight,
  ArrowLeft,
  Truck,
  ShieldCheck,
  Clock,
  Package,
} from 'lucide-react';
import { AddToQuoteButton } from './AddToQuoteButton';

import type { Metadata } from 'next';
import { ProductJsonLd, BreadcrumbJsonLd } from '@/lib/seo/structured-data';
import { SeoContentSection } from '@/components/seo/SeoContentSection';

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { data: product } = await fetchProductBySlug(params.slug);
  if (!product) return { title: 'Product Not Found | Devireen Enterprise' };

  const allImages = product.product_images || [];
  const primaryImage =
    allImages.find((i: any) => i.is_primary)?.url || allImages[0]?.url || null;

  const description =
    product.description ||
    `Buy ${product.name} at Devireen Enterprise Nairobi. High quality office & school supplies with fast delivery across Kenya.`;

  const canonicalUrl = `/products/${params.slug}`;

  return {
    title: product.name,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${product.name} | Devireen Enterprise`,
      description,
      url: `https://www.devireenenterprise.com${canonicalUrl}`,
      siteName: 'Devireen Enterprise',
      images: primaryImage
        ? [
            {
              url: primaryImage,
              alt: product.name,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | Devireen Enterprise`,
      description,
      images: primaryImage ? [primaryImage] : [],
    },
  };
}

export default async function ProductDetailsPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const { data: product } = await fetchProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const allImages = product.product_images || [];
  const primaryImage =
    allImages.find((i: any) => i.is_primary)?.url || allImages[0]?.url || null;
  const hasMultipleImages = allImages.length > 1;

  // Build attributes from JSON if available
  const attributes =
    product.attributes && typeof product.attributes === 'object'
      ? Object.entries(product.attributes as Record<string, string>)
      : [];

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
    ...(product.categories
      ? [
          {
            name: product.categories.name,
            url: `/products?category=${product.categories.slug}`,
          },
        ]
      : []),
    { name: product.name, url: `/products/${product.slug}` },
  ];

  const imageUrls = allImages.map((img: any) => img.url).filter(Boolean);

  return (
    <div suppressHydrationWarning={true} className="bg-background min-h-screen">
      <ProductJsonLd
        name={product.name}
        description={product.description}
        sku={product.sku}
        slug={product.slug}
        price={product.sale_price || product.price}
        images={imageUrls}
        category={product.categories?.name}
        brand={product.brands?.name}
        stockStatus={product.stock_status}
      />
      <BreadcrumbJsonLd items={breadcrumbItems} />
      {/* Breadcrumbs */}
      <div className="bg-surface border-border-subtle border-b">
        <div className="container mx-auto px-4 py-4">
          <nav
            className="text-text-muted flex items-center text-sm"
            aria-label="Breadcrumb"
          >
            <Link
              href="/products"
              className="hover:text-primary-600 flex items-center transition-colors"
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> Products
            </Link>
            {product.categories && (
              <>
                <ChevronRight className="text-border-strong mx-2 h-3.5 w-3.5" />
                <Link
                  href={`/products?category=${product.categories.slug}`}
                  className="hover:text-primary-600 transition-colors"
                >
                  {product.categories.name}
                </Link>
              </>
            )}
            <ChevronRight className="text-border-strong mx-2 h-3.5 w-3.5" />
            <span className="text-text-main max-w-[200px] truncate font-medium sm:max-w-xs">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          {/* ─── Left Column (Gallery + Description) ─── */}
          <div className="flex flex-col gap-8">
            <ProductImageGallery
              images={allImages}
              productName={product.name}
            />

            {/* ─── Description ─── */}
            <div>
              <h3 className="text-text-main mb-3 text-lg font-semibold">
                Product Description
              </h3>
              <div className="prose prose-sm text-text-body max-w-none text-left">
                {product.description ? (
                  <p className="leading-relaxed">{product.description}</p>
                ) : (
                  <p className="text-text-muted italic">
                    No description available.
                  </p>
                )}
              </div>
            </div>

            {/* ─── Specifications ─── */}
            {attributes.length > 0 && (
              <div>
                <h3 className="text-text-main mb-3 text-lg font-semibold">
                  Specifications
                </h3>
                <div className="border-border-subtle overflow-hidden rounded-xl border">
                  <table className="w-full text-sm">
                    <tbody>
                      {attributes.map(([key, val], i) => (
                        <tr
                          key={key}
                          className={
                            i % 2 === 0 ? 'bg-background' : 'bg-surface'
                          }
                        >
                          <td className="text-text-main w-1/3 px-4 py-3 font-medium capitalize">
                            {key.replace(/_/g, ' ')}
                          </td>
                          <td className="text-text-body px-4 py-3">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* ─── Product Info ─── */}
          <div className="flex flex-col">
            {/* Stock Status */}
            <div className="mb-3">
              <StockIndicator status={product.stock_status as StockStatus} />
            </div>

            {/* Title */}
            <h1 className="text-text-main mb-3 text-3xl leading-tight font-bold md:text-4xl">
              {product.name}
            </h1>

            {/* SKU & Brand */}
            <div className="text-text-muted mb-6 flex items-center gap-4 text-sm">
              <span>
                SKU:{' '}
                <span className="text-text-main font-medium">
                  {product.sku}
                </span>
              </span>
              {product.brands && (
                <span>
                  Brand:{' '}
                  <span className="text-text-main font-medium">
                    {product.brands.name}
                  </span>
                </span>
              )}
            </div>

            {/* ─── Purchase Panel ─── */}
            <div className="bg-surface border-border-subtle mb-8 rounded-2xl border p-6 lg:sticky lg:top-24">
              <div className="mb-6">
                {/* Pricing Display */}
                {product.sale_price ? (
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-3">
                      <span className="text-text-muted text-sm font-medium tracking-wider uppercase">
                        Sale Price
                      </span>
                      <Price
                        amount={product.sale_price}
                        showVat={true}
                        className="text-primary-600 text-3xl"
                      />
                    </div>
                    <div className="flex items-baseline gap-3">
                      <span className="text-text-muted text-sm font-medium tracking-wider uppercase">
                        Regular Price
                      </span>
                      <span className="text-text-muted text-xl font-medium line-through">
                        KSh {product.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-3">
                    <span className="text-text-muted text-sm font-medium tracking-wider uppercase">
                      Price
                    </span>
                    <Price
                      amount={product.price}
                      showVat={true}
                      className="text-3xl"
                    />
                  </div>
                )}
              </div>

              <AddToQuoteButton
                product={{
                  id: product.id,
                  name: product.name,
                  sku: product.sku,
                  price: product.sale_price || product.price,
                  imageUrl: primaryImage,
                }}
                disabled={
                  product.stock_status === 'OUT_OF_STOCK' ||
                  product.stock_status === 'DISCONTINUED'
                }
              />

              <p className="text-text-muted mt-4 text-center text-xs">
                Add to cart, then choose delivery or pickup at checkout.
              </p>

              {/* Trust Indicators */}
              <div className="border-border-subtle mt-6 grid grid-cols-2 gap-4 border-t pt-5">
                <div className="text-text-muted flex items-center gap-2 text-xs">
                  <Truck className="text-primary-500 h-4 w-4 shrink-0" />
                  <span>Nationwide Delivery</span>
                </div>
                <div className="text-text-muted flex items-center gap-2 text-xs">
                  <Clock className="text-primary-500 h-4 w-4 shrink-0" />
                  <span>24hr Quote Turnaround</span>
                </div>
                <div className="text-text-muted flex items-center gap-2 text-xs">
                  <ShieldCheck className="text-primary-500 h-4 w-4 shrink-0" />
                  <span>Quality Guaranteed</span>
                </div>
                <div className="text-text-muted flex items-center gap-2 text-xs">
                  <Package className="text-primary-500 h-4 w-4 shrink-0" />
                  <span>Secure Packaging</span>
                </div>
              </div>
            </div>

            {/* ─── Delivery Info ─── */}
            <div className="bg-primary-50 rounded-xl p-5">
              <h3 className="text-text-main mb-3 text-sm font-semibold">
                Delivery Information
              </h3>
              <ul className="text-text-muted space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Truck className="text-primary-500 mt-0.5 h-4 w-4 shrink-0" />
                  <span>Delivery within Nairobi: 1-2 business days</span>
                </li>
                <li className="flex items-start gap-2">
                  <Truck className="text-primary-500 mt-0.5 h-4 w-4 shrink-0" />
                  <span>Delivery outside Nairobi: 3-5 business days</span>
                </li>
                <li className="flex items-start gap-2">
                  <Package className="text-primary-500 mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Wholesale orders may have custom delivery timelines
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* SEO Content Layer */}
      <SeoContentSection
        title={`Ordering ${product.name} — Devireen Enterprise Supply Information`}
        subtitle="Genuine quality, corporate compliance, and reliable procurement across Kenya."
        sections={[
          {
            heading: `Authentic ${product.name} Sourcing & Quality Standards`,
            content: (
              <p>
                {product.name} is sourced directly from verified manufacturers
                to meet rigorous quality standards for corporate offices,
                schools, and institutional environments. Each item is inspected
                prior to dispatch to ensure reliability and compliance with
                procurement guidelines.
              </p>
            ),
          },
          {
            heading: 'Bulk Quotes & Custom Invoicing Options',
            content: (
              <p>
                Need to procure {product.name} in volume for a school term,
                office restock, or institutional project? Add this product to
                your quote cart to receive customized tier-based bulk pricing
                and formal invoicing.
              </p>
            ),
          },
          {
            heading: 'Packaging & Delivery Timelines',
            content: (
              <p>
                All orders are securely packaged to protect products during
                transit. Deliveries within Nairobi take 1 to 2 business days,
                while nationwide county deliveries are fulfilled within 2 to 4
                business days.
              </p>
            ),
          },
        ]}
        faqs={[
          {
            question: `Is ${product.name} available for immediate delivery?`,
            answer:
              'Current stock indicators reflect real-time inventory. In-stock products are dispatched within 24 hours of order or quote confirmation.',
          },
          {
            question: 'Can I request a sample before making a bulk order?',
            answer:
              'For large corporate or institutional procurement, contact our sales desk directly to discuss product samples and custom bulk terms.',
          },
        ]}
      />
    </div>
  );
}
