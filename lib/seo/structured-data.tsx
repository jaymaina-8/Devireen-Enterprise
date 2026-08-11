import React from 'react';
import { siteConfig } from '@/config/site';

const BASE_URL = siteConfig.url || 'https://www.devireenenterprise.com';

/**
 * Organization Schema
 */
export function OrganizationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Devireen Enterprise',
    alternateName: 'Devireen Stationers Wholesale & Retail',
    url: BASE_URL,
    logo: `${BASE_URL}/images/devireen-logo.png`,
    description:
      'Leading supplier of stationery, office supplies, school accessories, books, and bulk business supplies in Nairobi, Kenya.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Nairobi CBD',
      addressRegion: 'Nairobi',
      addressCountry: 'KE',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+254708037929',
      contactType: 'sales & customer support',
      areaServed: 'KE',
      availableLanguage: ['en', 'sw'],
    },
    sameAs: [
      'https://www.google.com/maps/place/Devireen+Enterprise./@-1.28181,36.825743,17z/data=!3m1!4b1!4m6!3m5!1s0x182f118fa27150b5:0xe0fb2ec5aa188109!8m2!3d-1.2818154!4d36.8283179!16s%2Fg%2F11nth4f4zs',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

/**
 * LocalBusiness / Office Equipment Supplier Schema
 */
export function LocalBusinessJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Devireen Enterprise',
    image: [
      `${BASE_URL}/images/storefront.jpg`,
      `${BASE_URL}/images/devireen-logo.png`,
    ],
    '@id': `${BASE_URL}/#localbusiness`,
    url: BASE_URL,
    telephone: '+254708037929',
    priceRange: 'KSh KES',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Nairobi CBD',
      addressLocality: 'Nairobi',
      addressRegion: 'Nairobi County',
      addressCountry: 'KE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -1.2818154,
      longitude: 36.8283179,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '09:00',
        closes: '14:00',
      },
    ],
    hasMap:
      'https://www.google.com/maps/place/Devireen+Enterprise./@-1.28181,36.825743,17z/data=!3m1!4b1!4m6!3m5!1s0x182f118fa27150b5:0xe0fb2ec5aa188109!8m2!3d-1.2818154!4d36.8283179!16s%2Fg%2F11nth4f4zs',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

/**
 * WebSite Sitelinks Search Box Schema
 */
export function WebSiteJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Devireen Enterprise',
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/products?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

/**
 * Product Details Schema
 */
export interface ProductJsonLdProps {
  name: string;
  description?: string | null;
  sku: string;
  slug: string;
  price: number;
  images?: string[];
  category?: string | null;
  brand?: string | null;
  stockStatus?: string;
}

export function ProductJsonLd({
  name,
  description,
  sku,
  slug,
  price,
  images = [],
  brand,
  stockStatus,
}: ProductJsonLdProps) {
  const availability =
    stockStatus === 'OUT_OF_STOCK' || stockStatus === 'DISCONTINUED'
      ? 'https://schema.org/OutOfStock'
      : 'https://schema.org/InStock';

  const productImages = images.length
    ? images
    : [`${BASE_URL}/images/category_office_supplies.png`];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: name,
    image: productImages,
    description: description || `Buy ${name} at Devireen Enterprise.`,
    sku: sku,
    brand: {
      '@type': 'Brand',
      name: brand || 'Devireen Enterprise',
    },
    offers: {
      '@type': 'Offer',
      url: `${BASE_URL}/products/${slug}`,
      priceCurrency: 'KES',
      price: price,
      availability: availability,
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'Devireen Enterprise',
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

/**
 * BreadcrumbList Schema
 */
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

/**
 * FAQPage Schema
 */
export interface FaqItem {
  question: string;
  answer: string;
}

export function FaqPageJsonLd({ faqs }: { faqs: FaqItem[] }) {
  if (!faqs || faqs.length === 0) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
