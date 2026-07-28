import Link from "next/link";
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
} from "lucide-react";

import { siteConfig } from "@/config/site";

export function Footer({ settings }: { settings?: any }) {
  return (
    <footer className="section-dark">
      {/* ─── Main Footer ─── */}
      <div className="container mx-auto px-4 py-10 md:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-6 lg:gap-8">

          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-xl text-white tracking-tight mb-4"
            >
              {settings?.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt={settings.company_name || siteConfig.name}
                  className="h-8 object-contain brightness-0 invert"
                />
              ) : (
                <>
                  <PackageOpen className="h-6 w-6 text-primary-500" />
                  <span>{settings?.company_name || siteConfig.name}</span>
                </>
              )}
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              {settings?.footer_content ||
                "Kenya's trusted B2B supplier of office supplies, stationery, school supplies and office equipment."}
            </p>

            {/* Quick Quote CTA */}
            <Link href="/quote">
              <button
                type="button"
                className="w-full mb-5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors active:scale-[0.98]"
              >
                Request a Quick Quote
              </button>
            </Link>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {/* Facebook */}
              <a
                href={settings?.facebook_url || "#"}
                aria-label="Facebook"
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-blue-600 flex items-center justify-center text-gray-400 hover:text-white transition-all font-bold text-xs"
              >
                f
              </a>
              {/* Twitter / X */}
              <a
                href={settings?.twitter_url || "#"}
                aria-label="Twitter"
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-sky-500 flex items-center justify-center text-gray-400 hover:text-white transition-all font-bold text-xs"
              >
                𝕏
              </a>
              {/* LinkedIn */}
              <a
                href={settings?.linkedin_url || "#"}
                aria-label="LinkedIn"
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-blue-700 flex items-center justify-center text-gray-400 hover:text-white transition-all font-bold text-xs"
              >
                in
              </a>
              {/* Instagram */}
              <a
                href={settings?.instagram_url || "#"}
                aria-label="Instagram"
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-pink-600 flex items-center justify-center text-gray-400 hover:text-white transition-all"
              >
                <Share2 className="h-3.5 w-3.5" />
              </a>
              {/* WhatsApp */}
              <a
                href={`https://wa.me/${(settings?.phone_numbers?.[0] || "+254708037929").replace(/\D/g, "")}`}
                aria-label="WhatsApp"
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-green-600 flex items-center justify-center text-gray-400 hover:text-white transition-all"
              >
                <MessageCircle className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Newsletter */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-white mb-3">Stay updated</h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  aria-label="Email for newsletter"
                />
                <button
                  type="button"
                  className="bg-primary-600 text-white px-3 py-2 rounded-md hover:bg-primary-700 transition-colors shrink-0"
                  aria-label="Subscribe to newsletter"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">
              Products
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link href="/products?category=office-supplies" className="hover:text-white transition-colors">
                  Office Supplies
                </Link>
              </li>
              <li>
                <Link href="/products?category=stationery" className="hover:text-white transition-colors">
                  Stationery
                </Link>
              </li>
              <li>
                <Link href="/products?category=school-accessories" className="hover:text-white transition-colors">
                  School Supplies
                </Link>
              </li>
              <li>
                <Link href="/products?category=office-equipment" className="hover:text-white transition-colors">
                  Office Equipment
                </Link>
              </li>
              <li>
                <Link href="/products?category=office-furniture" className="hover:text-white transition-colors">
                  Office Furniture
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors inline-flex items-center gap-1 text-primary-400">
                  View All <ArrowRight className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/bulk-orders" className="hover:text-white transition-colors">
                  Bulk Orders
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/quote" className="hover:text-white transition-colors">
                  Request a Quote
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Returns &amp; Exchanges
                </Link>
              </li>
              <li>
                <Link href="/bulk-orders" className="hover:text-white transition-colors">
                  Bulk &amp; Enterprise
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-primary-500 shrink-0 mt-0.5" />
                <a href={settings?.google_maps_url || "https://www.google.com/maps/place/Devireen+Enterprise./@-1.28181,36.825743,17z/data=!3m1!4b1!4m6!3m5!1s0x182f118fa27150b5:0xe0fb2ec5aa188109!8m2!3d-1.2818154!4d36.8283179!16s%2Fg%2F11nth4f4zs"} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  {settings?.physical_address || "Nairobi CBD, Kenya"}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary-500 shrink-0" />
                <span>{settings?.phone_numbers?.[0] || "+254 708 037929"}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary-500 shrink-0" />
                <span>{settings?.email || "sales@devireen.co.ke"}</span>
              </li>
            </ul>

            {/* Business Hours */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-white mb-2">Business Hours</h4>
              <div className="text-sm text-gray-400 space-y-1">
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
        <div className="container mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500 text-center md:text-left">
          <p className="md:w-1/3">
            &copy; {new Date().getFullYear()} {settings?.company_name || siteConfig.name}. All rights reserved.
          </p>
          <p className="text-xs md:w-1/3 md:text-center">
            Powered by <a href="https://blackpoolindustry.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">Blackpool Industry</a>
          </p>
          <p className="text-gray-600 md:w-1/3 md:text-right hidden sm:block">
            Kenya&apos;s trusted B2B procurement platform.
          </p>
        </div>
      </div>
    </footer>
  );
}
