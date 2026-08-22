import Link from 'next/link';
import Image from 'next/image';
import {
  PackageOpen,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  MessageCircle,
  Globe,
  Share2,
  ExternalLink,
} from 'lucide-react';

import { siteConfig } from '@/config/site';

export function Footer({ settings }: { settings?: any }) {
  return (
    <footer className="section-dark">
      {/* ─── Main Footer ─── */}
      <div className="container mx-auto px-4 py-10 md:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-6 lg:gap-8">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link href="/" className="mb-8 flex items-center gap-4">
              <Image
                src={settings?.logo_url || '/images/devireen-logo.png'}
                alt="Devireen Logo"
                width={72}
                height={72}
                className="h-16 w-16 object-contain"
              />
              <div className="flex flex-col justify-center">
                <span className="text-[26px] leading-[1.1] font-extrabold tracking-[0.02em] text-white uppercase">
                  DEVIREEN
                </span>
                <span className="text-[26px] leading-[1.1] font-extrabold tracking-[0.02em] text-white uppercase">
                  ENTERPRISE
                </span>
              </div>
            </Link>
            <p className="mb-5 text-sm leading-relaxed text-gray-400">
              {settings?.footer_content ||
                "Kenya's trusted B2B supplier of office supplies, stationery, school supplies and office equipment."}
            </p>

            {/* Quick Quote CTA */}
            <Link href="/quote">
              <button
                type="button"
                className="bg-primary-600 hover:bg-primary-700 mb-5 w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors active:scale-[0.98]"
              >
                Request a Quick Quote
              </button>
            </Link>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {/* Facebook */}
              <a
                href={settings?.facebook_url || '#'}
                aria-label="Facebook"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-gray-400 transition-all hover:bg-blue-600 hover:text-white"
              >
                f
              </a>
              {/* Twitter / X */}
              <a
                href={settings?.twitter_url || '#'}
                aria-label="Twitter"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-gray-400 transition-all hover:bg-sky-500 hover:text-white"
              >
                𝕏
              </a>
              {/* LinkedIn */}
              <a
                href={settings?.linkedin_url || '#'}
                aria-label="LinkedIn"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-gray-400 transition-all hover:bg-blue-700 hover:text-white"
              >
                in
              </a>
              {/* Instagram */}
              <a
                href={
                  settings?.instagram_url ||
                  'https://www.instagram.com/devireenenterprise/'
                }
                aria-label="Instagram"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-gray-400 transition-all hover:bg-pink-600 hover:text-white"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              {/* TikTok */}
              <a
                href={
                  settings?.tiktok_url ||
                  'https://www.tiktok.com/@devireenstationary'
                }
                aria-label="TikTok"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-gray-400 transition-all hover:bg-black hover:text-white"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.23-1.15 4.38-2.92 5.75-1.7 1.34-3.95 1.71-6.02 1.25-2.07-.46-3.83-1.87-4.82-3.71-.97-1.81-1.07-4.04-.3-5.94.75-1.86 2.31-3.26 4.18-3.87 1.25-.41 2.61-.43 3.88-.13v4.11c-.51-.15-1.06-.2-1.58-.1-.95.18-1.78.85-2.18 1.73-.41.87-.33 1.95.19 2.74.52.8 1.44 1.23 2.39 1.21.93-.02 1.8-.52 2.29-1.32.48-.8.61-1.78.58-2.71-.03-5.26-.01-10.51-.02-15.77z" />
                </svg>
              </a>
              {/* WhatsApp */}
              <a
                href={`https://wa.me/${(settings?.phone_numbers?.[0] || '+254708037929').replace(/\D/g, '')}`}
                aria-label="WhatsApp"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-gray-400 transition-all hover:bg-green-600 hover:text-white"
              >
                <MessageCircle className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Newsletter */}
            <div className="mt-6">
              <h4 className="mb-3 text-sm font-semibold text-white">
                Stay updated
              </h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="focus:ring-primary-500 focus:border-primary-500 flex-1 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:ring-1 focus:outline-none"
                  aria-label="Email for newsletter"
                />
                <button
                  type="button"
                  className="bg-primary-600 hover:bg-primary-700 shrink-0 rounded-md px-3 py-2 text-white transition-colors"
                  aria-label="Subscribe to newsletter"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wider text-white uppercase">
              Products
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link
                  href="/products?category=office-supplies"
                  className="transition-colors hover:text-white"
                >
                  Office Supplies
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=stationery"
                  className="transition-colors hover:text-white"
                >
                  Stationery
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=school-accessories"
                  className="transition-colors hover:text-white"
                >
                  School Supplies
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=office-equipment"
                  className="transition-colors hover:text-white"
                >
                  Office Equipment
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=office-furniture"
                  className="transition-colors hover:text-white"
                >
                  Office Furniture
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-primary-400 inline-flex items-center gap-1 transition-colors hover:text-white"
                >
                  View All <ArrowRight className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wider text-white uppercase">
              Company
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link
                  href="/about"
                  className="transition-colors hover:text-white"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/wholesale"
                  className="transition-colors hover:text-white"
                >
                  Wholesale
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="transition-colors hover:text-white"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="transition-colors hover:text-white"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="transition-colors hover:text-white"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wider text-white uppercase">
              Support
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link
                  href="/contact"
                  className="transition-colors hover:text-white"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/quote"
                  className="transition-colors hover:text-white"
                >
                  Request a Quote
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="transition-colors hover:text-white"
                >
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="transition-colors hover:text-white"
                >
                  Returns &amp; Exchanges
                </Link>
              </li>
              <li>
                <Link
                  href="/bulk-orders"
                  className="transition-colors hover:text-white"
                >
                  Bulk &amp; Enterprise
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wider text-white uppercase">
              Contact
            </h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin className="text-primary-500 mt-0.5 h-4 w-4 shrink-0" />
                <a
                  href={
                    settings?.google_maps_url ||
                    'https://www.google.com/maps/place/Devireen+Enterprise./@-1.28181,36.825743,17z/data=!3m1!4b1!4m6!3m5!1s0x182f118fa27150b5:0xe0fb2ec5aa188109!8m2!3d-1.2818154!4d36.8283179!16s%2Fg%2F11nth4f4zs'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                >
                  {settings?.physical_address || 'Nairobi CBD, Kenya'}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-primary-500 h-4 w-4 shrink-0" />
                <a
                  href={`tel:${(settings?.phone_numbers?.[0] || '+254 708 037929').replace(/\s/g, '')}`}
                  className="transition-colors hover:text-white"
                >
                  {settings?.phone_numbers?.[0] || '+254 708 037929'}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-primary-500 h-4 w-4 shrink-0" />
                <a
                  href={`mailto:${settings?.email || 'devireenenterprise@gmail.com'}`}
                  className="transition-colors hover:text-white"
                >
                  {settings?.email || 'devireenenterprise@gmail.com'}
                </a>
              </li>
            </ul>

            {/* Business Hours */}
            <div className="mt-6">
              <h4 className="mb-2 text-sm font-semibold text-white">
                Business Hours
              </h4>
              <div className="space-y-1 text-sm text-gray-400">
                <p>Mon – Fri: 8:00 AM – 6:00 PM</p>
                <p>Saturday: 9:00 AM – 2:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom Bar ─── */}
      <div className="border-t border-white/10">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-5 text-center text-sm text-gray-500 md:flex-row md:text-left">
          <p className="md:w-1/3">
            &copy; {new Date().getFullYear()}{' '}
            {settings?.company_name || siteConfig.name}. All rights reserved.
          </p>
          <p className="text-xs md:w-1/3 md:text-center">
            Powered by{' '}
            <a
              href="https://blackpoolindustry.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 transition-colors hover:text-white"
            >
              Blackpool Industry
            </a>
          </p>
          <p className="hidden text-gray-600 sm:block md:w-1/3 md:text-right">
            Kenya&apos;s trusted B2B procurement platform.
          </p>
        </div>
      </div>
    </footer>
  );
}
