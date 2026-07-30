'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Menu,
  X,
  PackageOpen,
  ChevronDown,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useQuoteCart } from '@/lib/store/quote-cart';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/config/site';

const links = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products', hasMegaMenu: true },
  { href: '/products', label: 'Categories', hasMegaMenu: true },
  { href: '/wholesale', label: 'Wholesale' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

/* ─── Category imagery mapped by slug ─── */
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

export function Navbar({
  settings,
  categories = [],
}: {
  settings?: any;
  categories?: any[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = React.useState(false);
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const megaMenuTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const { items } = useQuoteCart();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  React.useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMegaMenuOpen(false);
  }, [pathname]);

  const handleMegaMenuEnter = () => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    setIsMegaMenuOpen(true);
  };

  const handleMegaMenuLeave = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
    }, 200);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-surface/95 border-border-subtle sticky top-0 z-30 w-full border-b backdrop-blur-md">
      <div className="container mx-auto px-4">
        {/* Top Utility Bar */}
        <div className="border-border-subtle text-text-muted hidden items-center justify-between border-b py-1.5 text-xs sm:flex">
          <p className="font-medium">
            Kenya&apos;s Trusted B2B Office &amp; School Supplier
          </p>
          <div className="flex items-center space-x-4">
            <span>
              Call us: {settings?.phone_numbers?.[0] || '+254 708 037929'}
            </span>
            <Link
              href="/contact"
              className="hover:text-primary-600 transition-colors"
            >
              Support
            </Link>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="flex h-16 items-center gap-4">
          {/* Col 1 — Logo (left, flex-1 so it takes equal space) */}
          <div className="flex flex-1 items-center">
            <Link
              href="/"
              className="text-primary-600 flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight sm:text-xl"
            >
              {settings?.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt={settings.company_name || siteConfig.name}
                  className="h-8 object-contain"
                />
              ) : (
                <PackageOpen className="h-6 w-6 shrink-0" />
              )}
              <span className="inline-block whitespace-nowrap">
                {settings?.company_name || siteConfig.name}
              </span>
            </Link>
          </div>

          {/* Col 2 — Desktop Nav (true center) */}
          <nav className="hidden shrink-0 items-center gap-1 lg:flex">
            {links.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={
                  link.hasMegaMenu ? handleMegaMenuEnter : undefined
                }
                onMouseLeave={
                  link.hasMegaMenu ? handleMegaMenuLeave : undefined
                }
              >
                <Link
                  href={link.href}
                  className={cn(
                    'nav-link-underline hover:text-primary-600 inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    pathname === link.href
                      ? 'text-primary-600'
                      : 'text-text-muted'
                  )}
                  data-active={pathname === link.href}
                >
                  {link.label}
                  {link.hasMegaMenu && (
                    <ChevronDown
                      className={cn(
                        'h-3.5 w-3.5 transition-transform duration-200',
                        isMegaMenuOpen && 'rotate-180'
                      )}
                    />
                  )}
                </Link>
              </div>
            ))}
          </nav>

          {/* Col 3 — Right actions (flex-1, justified to end) */}
          <div className="flex flex-1 items-center justify-end gap-2">
            {/* Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className={cn(
                'bg-background hidden items-center rounded-lg border transition-all duration-200 md:flex',
                isSearchFocused
                  ? 'border-primary-500 ring-primary-100 w-72 ring-2'
                  : 'border-border-subtle w-56'
              )}
            >
              <Search className="text-text-muted ml-3 h-4 w-4 shrink-0" />
              <input
                type="text"
                placeholder="Search 500+ products..."
                className="text-text-main placeholder:text-text-muted w-full bg-transparent px-2 py-2 text-sm focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                aria-label="Search products"
              />
            </form>

            {/* Request Quote CTA — desktop only */}
            <Link href="/quote" className="hidden shrink-0 lg:block">
              <Button variant="primary" size="sm" className="font-semibold">
                Request Quote
              </Button>
            </Link>

            {/* Quote Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="text-text-main relative"
              onClick={() => useQuoteCart.getState().toggleCart()}
              aria-label="Quote Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {mounted && itemCount > 0 && (
                <span className="bg-primary-500 absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
              <span className="sr-only">Quote Cart</span>
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="text-text-main lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Mega Menu Dropdown ─── */}
      {isMegaMenuOpen && (
        <div
          className="bg-surface border-border-subtle absolute right-0 left-0 z-40 hidden border-b shadow-xl lg:block"
          onMouseEnter={handleMegaMenuEnter}
          onMouseLeave={handleMegaMenuLeave}
        >
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-3 gap-4 lg:grid-cols-6">
              {categories.map((cat: any) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="group hover:bg-background flex cursor-pointer flex-col items-center gap-3 rounded-xl p-3 text-center transition-colors"
                >
                  <div className="bg-background relative aspect-square w-full overflow-hidden rounded-lg">
                    <Image
                      src={categoryImages[cat.slug] || defaultCategoryImage}
                      alt={cat.name}
                      fill
                      className="img-zoom object-cover"
                      sizes="150px"
                    />
                  </div>
                  <span className="text-text-main group-hover:text-primary-600 text-sm font-medium transition-colors">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
            <div className="border-border-subtle mt-4 flex items-center justify-between border-t pt-4">
              <p className="text-text-muted text-sm">
                Can&apos;t find what you need?
              </p>
              <Link href="/products">
                <Button variant="ghost" size="sm">
                  View All Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ─── Mobile Menu (Sidebar) ─── */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop Overlay */}
          <div
            className="animate-in fade-in absolute top-0 left-0 z-[90] h-[100dvh] w-screen bg-black/60 duration-300 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Sidebar */}
          <div className="bg-surface animate-in slide-in-from-left absolute top-0 left-0 z-[100] flex h-[100dvh] w-[280px] flex-col shadow-2xl duration-300 sm:w-[320px] lg:hidden">
            {/* Header */}
            <div className="border-border-subtle flex shrink-0 items-center justify-between border-b p-4">
              <span className="text-primary-600 text-lg font-bold">Menu</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-text-muted hover:text-text-main h-8 w-8"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
              {/* Mobile Search */}
              <form
                onSubmit={(e) => {
                  handleSearchSubmit(e);
                  setIsMobileMenuOpen(false);
                }}
                className="border-border-subtle bg-background flex items-center rounded-lg border"
              >
                <Search className="text-text-muted ml-3 h-4 w-4 shrink-0" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="text-text-main placeholder:text-text-muted w-full bg-transparent px-2 py-3 text-sm focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search products"
                />
              </form>

              <nav className="flex flex-col space-y-1">
                {links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'rounded-md px-4 py-3 text-sm font-medium transition-colors',
                      pathname === link.href
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-text-main hover:bg-background'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Footer CTA */}
            <div className="border-border-subtle shrink-0 border-t p-4">
              <Link
                href="/quote"
                className="block"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Button
                  variant="primary"
                  className="w-full py-6 text-base shadow-md"
                >
                  Request a Quote
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
