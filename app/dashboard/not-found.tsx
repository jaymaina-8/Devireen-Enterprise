import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  FileQuestion,
  LayoutDashboard,
  ShoppingCart,
  Package,
} from 'lucide-react';

export default function DashboardNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 shadow-xs">
        <FileQuestion className="h-8 w-8" />
      </div>
      <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-900">
        Record Not Found
      </h1>
      <p className="mb-8 max-w-md text-sm text-slate-500">
        The requested administrative record could not be found. It may have been
        archived, deleted, or you might have followed an outdated link.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/dashboard">
          <Button variant="primary" size="sm" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard Home
          </Button>
        </Link>
        <Link href="/dashboard/orders">
          <Button variant="outline" size="sm" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Orders
          </Button>
        </Link>
        <Link href="/dashboard/products">
          <Button variant="outline" size="sm" className="gap-2">
            <Package className="h-4 w-4" />
            Products
          </Button>
        </Link>
      </div>
    </div>
  );
}
