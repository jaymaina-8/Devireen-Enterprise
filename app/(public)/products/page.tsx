import { fetchProducts } from '@/actions/product.actions';
import { fetchCategories } from '@/actions/category.actions';
import { ProductCard } from '@/components/products/ProductCard';
import { SectionHeading } from '@/components/layout/SectionHeading';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { SearchBar } from '@/components/navigation/SearchBar';
import { StockStatus } from '@/components/products/StockIndicator';
import { PackageSearch, ChevronRight } from 'lucide-react';

export const metadata = {
  title: 'Product Catalogue',
  description:
    'Browse our complete range of office supplies, stationery, and equipment.',
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === 'string' ? params.q : undefined;
  const category =
    typeof params.category === 'string' ? params.category : undefined;

  const { data: products = [], error } = await fetchProducts({
    query: q,
    categorySlug: category,
    context: 'retail',
  });
  const { data: categoriesData = [] } = await fetchCategories();
  const categories = categoriesData || [];

  const activeCategory = categories.find((c: any) => c.slug === category);

  return (
    <div className="bg-background min-h-screen">
      {/* Page Header */}
      <div className="bg-surface border-border-subtle border-b">
        <div className="container mx-auto px-4 py-6 md:py-8">
          {/* Breadcrumbs */}
          <nav
            className="text-text-muted mb-4 flex items-center text-sm"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-primary-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="text-border-strong mx-1.5 h-3.5 w-3.5" />
            <Link
              href="/products"
              className={
                category
                  ? 'hover:text-primary-600 transition-colors'
                  : 'text-text-main font-medium'
              }
            >
              Products
            </Link>
            {activeCategory && (
              <>
                <ChevronRight className="text-border-strong mx-1.5 h-3.5 w-3.5" />
                <span className="text-text-main font-medium">
                  {activeCategory.name}
                </span>
              </>
            )}
          </nav>

          <SectionHeading
            title={activeCategory?.name || 'All Products'}
            subtitle={`Showing ${products.length} results${q ? ` for "${q}"` : ''}`}
            className="mb-0"
          />

          {/* Category Filter Pills */}
          {categories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/products">
                <span
                  className={`inline-block cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    !category
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'bg-surface text-text-muted border-border-subtle hover:border-border-strong'
                  }`}
                >
                  All
                </span>
              </Link>
              {categories.map((c: any) => (
                <Link
                  key={c.slug}
                  href={`/products?category=${c.slug}${q ? `&q=${q}` : ''}`}
                >
                  <span
                    className={`inline-block cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      category === c.slug
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : 'bg-surface text-text-muted border-border-subtle hover:border-border-strong'
                    }`}
                  >
                    {c.name}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* Search Form */}
          <form
            action="/products"
            method="GET"
            className="mt-6 flex w-full max-w-md gap-2"
          >
            {category && (
              <input type="hidden" name="category" value={category} />
            )}
            <SearchBar
              name="q"
              defaultValue={q}
              placeholder="Search products..."
            />
            <Button type="submit">Search</Button>
          </form>
        </div>
      </div>

      <div className="container mx-auto flex flex-col gap-8 px-4 py-8 md:flex-row md:py-12">
        {/* Sidebar Filters */}
        <aside className="w-full shrink-0 md:w-56 lg:w-64">
          <div className="sticky top-24 space-y-8">
            <div className="bg-surface border-border-subtle rounded-xl border p-5">
              <h3 className="text-text-main mb-4 text-sm font-semibold tracking-wider uppercase">
                Categories
              </h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/products"
                    className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                      !category
                        ? 'bg-primary-50 text-primary-600 font-medium'
                        : 'text-text-muted hover:bg-background hover:text-text-main'
                    }`}
                  >
                    All Products
                  </Link>
                </li>
                {categories.map((c: any) => (
                  <li key={c.slug}>
                    <Link
                      href={`/products?category=${c.slug}${q ? `&q=${q}` : ''}`}
                      className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                        category === c.slug
                          ? 'bg-primary-50 text-primary-600 font-medium'
                          : 'text-text-muted hover:bg-background hover:text-text-main'
                      }`}
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {error ? (
            <div className="border-error/20 bg-error/5 text-error rounded-xl border p-8 text-center">
              Failed to load products. Please try again later.
            </div>
          ) : products.length === 0 ? (
            <div className="border-border-subtle bg-surface flex flex-col items-center justify-center rounded-xl border px-4 py-20 text-center">
              <PackageSearch className="text-text-muted mb-5 h-14 w-14" />
              <h3 className="text-text-main mb-2 text-lg font-semibold">
                No products found
              </h3>
              <p className="text-text-muted mb-6 max-w-md">
                We couldn&apos;t find any products matching your current
                filters. Try adjusting your search or category.
              </p>
              <Link href="/products">
                <Button variant="outline">Clear Filters</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 md:gap-6 lg:grid-cols-3">
              {products.map((product: any) => {
                const primaryImage =
                  product.product_images?.find((i: any) => i.is_primary) ||
                  product.product_images?.[0];
                return (
                  <ProductCard
                    key={product.id}
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
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
