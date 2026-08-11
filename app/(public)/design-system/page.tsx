import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { EmptyState } from '@/components/ui/EmptyState';
import { Search } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import { CategoryCard } from '@/components/products/CategoryCard';
import { SearchBar } from '@/components/navigation/SearchBar';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { Pagination } from '@/components/navigation/Pagination';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';

export const metadata = {
  title: 'Design System | Devireen Enterprise',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DesignSystemPage() {
  return (
    <div className="container mx-auto space-y-12 p-8 pb-24">
      <h1 className="text-text-main mb-8 text-3xl font-bold">
        Design System Component Library
      </h1>

      <section>
        <h2 className="border-border-subtle text-text-main mb-4 border-b pb-2 text-xl font-semibold">
          Typography & Colors
        </h2>
        <div className="flex gap-4">
          <div className="bg-primary text-primary-50 flex h-24 w-24 items-center justify-center rounded-md font-medium">
            Primary
          </div>
          <div className="bg-surface border-border-strong text-text-main flex h-24 w-24 items-center justify-center rounded-md border font-medium">
            Surface
          </div>
          <div className="bg-success flex h-24 w-24 items-center justify-center rounded-md font-medium text-white">
            Success
          </div>
          <div className="bg-warning flex h-24 w-24 items-center justify-center rounded-md font-medium text-white">
            Warning
          </div>
        </div>
      </section>

      <section>
        <h2 className="border-border-subtle text-text-main mb-4 border-b pb-2 text-xl font-semibold">
          Buttons
        </h2>
        <div className="flex items-center gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button isLoading>Loading</Button>
        </div>
      </section>

      <section>
        <h2 className="border-border-subtle text-text-main mb-4 border-b pb-2 text-xl font-semibold">
          Badges
        </h2>
        <div className="flex items-center gap-4">
          <Badge>Default</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
          <Badge variant="info">Info</Badge>
        </div>
      </section>

      <section>
        <h2 className="border-border-subtle text-text-main mb-4 border-b pb-2 text-xl font-semibold">
          Forms
        </h2>
        <div className="grid max-w-3xl grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Standard Input</Label>
              <Input placeholder="Placeholder..." />
            </div>
            <div className="space-y-1">
              <Label>Error Input</Label>
              <Input error defaultValue="Invalid Data" />
            </div>
            <div className="space-y-1">
              <Label>Select</Label>
              <Select>
                <option>Option 1</option>
                <option>Option 2</option>
              </Select>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Textarea</Label>
              <Textarea placeholder="Type your message here..." />
            </div>
            <div className="mt-4 flex items-center space-x-2">
              <Checkbox id="terms" />
              <Label htmlFor="terms">Accept terms and conditions</Label>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="border-border-subtle text-text-main mb-4 border-b pb-2 text-xl font-semibold">
          Domain Components
        </h2>
        <div className="space-y-8">
          <SearchBar />

          <Breadcrumbs
            items={[
              { label: 'Products', href: '#' },
              { label: 'Office Supplies', href: '#' },
              { label: 'Paper' },
            ]}
          />

          <div className="grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
            <CategoryCard name="Office Equipment" count={120} />
            <CategoryCard name="Stationery" count={45} />
          </div>

          <div className="w-64">
            <ProductCard
              id="1"
              name="Premium A4 Printing Paper - 500 Sheets"
              sku="PAP-A4-500"
              price={750}
              stockStatus="IN_STOCK"
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="border-border-subtle text-text-main mb-4 border-b pb-2 text-xl font-semibold">
          Feedback & Table
        </h2>
        <div className="max-w-4xl space-y-8">
          <EmptyState
            icon={Search}
            title="No results found"
            description="Try adjusting your search filters to find what you're looking for."
            action={<Button variant="outline">Clear Filters</Button>}
          />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>PEN-001</TableCell>
                <TableCell>Bic Ballpoint Pen</TableCell>
                <TableCell>KSh 20</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>PAP-002</TableCell>
                <TableCell>A4 Ream</TableCell>
                <TableCell>KSh 750</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Pagination currentPage={1} totalPages={5} />
        </div>
      </section>
    </div>
  );
}
