import {
  LayoutDashboard,
  Package,
  Tags,
  FileText,
  Users,
  ShoppingCart,
  Star,
  Settings,
  LucideIcon,
} from 'lucide-react';

export interface DashboardNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  badgeVariant?: 'default' | 'warning' | 'danger' | 'info';
  shortcut?: string;
}

export interface DashboardNavGroup {
  label: string;
  items: DashboardNavItem[];
}

export const dashboardNavGroups: DashboardNavGroup[] = [
  {
    label: 'Command Center',
    items: [
      {
        label: 'Overview',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: 'Catalog',
    items: [
      {
        label: 'Products',
        href: '/dashboard/products',
        icon: Package,
      },
      {
        label: 'Categories',
        href: '/dashboard/categories',
        icon: Tags,
      },
    ],
  },
  {
    label: 'Sales',
    items: [
      {
        label: 'Quotes',
        href: '/dashboard/quotes',
        icon: FileText,
        badge: 'New',
        badgeVariant: 'info',
      },
      {
        label: 'Orders',
        href: '/dashboard/orders',
        icon: ShoppingCart,
      },
      {
        label: 'Customers',
        href: '/dashboard/customers',
        icon: Users,
      },
    ],
  },
  {
    label: 'Content',
    items: [
      {
        label: 'Testimonials',
        href: '/dashboard/testimonials',
        icon: Star,
      },
    ],
  },
  {
    label: 'System',
    items: [
      {
        label: 'Settings',
        href: '/dashboard/settings',
        icon: Settings,
      },
    ],
  },
];

// Flat list of all dashboard items
export const allDashboardNavItems: DashboardNavItem[] =
  dashboardNavGroups.flatMap((group) => group.items);

// Derivation for mobile bottom navigation (subset of dashboardNavGroups)
const bottomNavHrefs = [
  '/dashboard',
  '/dashboard/products',
  '/dashboard/quotes',
  '/dashboard/orders',
];

export const mobileBottomNavItems: DashboardNavItem[] = bottomNavHrefs
  .map((href) => allDashboardNavItems.find((item) => item.href === href))
  .filter((item): item is DashboardNavItem => Boolean(item));

// Storefront navigation
export const navigation = {
  main: [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Categories', href: '/categories' },
    { name: 'Bulk Orders', href: '/bulk-orders' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ],
  footer: {
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Careers', href: '/careers' },
    ],
    support: [
      { name: 'FAQs', href: '/faqs' },
      { name: 'Shipping & Delivery', href: '/shipping' },
      { name: 'Returns Policy', href: '/returns' },
    ],
    legal: [
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Privacy Policy', href: '/privacy' },
    ],
  },
};
