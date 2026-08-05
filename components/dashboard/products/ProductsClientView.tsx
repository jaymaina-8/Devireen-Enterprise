'use client';

import { useState, useMemo } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { columns } from './columns';
import { Button } from '@/components/ui/Button';
import {
  Download,
  Upload,
  Filter,
  Trash2,
  Tag,
  Check,
  Star,
} from 'lucide-react';
import {
  deleteProductAction,
  updateProductAction,
} from '@/actions/product.actions';
import { useToastStore } from '@/lib/store/toast-store';

export function ProductsClientView({
  initialProducts,
  categories,
}: {
  initialProducts: any[];
  categories: any[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStock, setSelectedStock] = useState<string>('all');
  const [selectedFeatured, setSelectedFeatured] = useState<string>('all');
  const { addToast } = useToastStore();

  // Filtered dataset
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'all') {
        if (!p.is_all_categories) {
          if (Array.isArray(p.categories)) {
            if (!p.categories.some((c: any) => c.id === selectedCategory))
              return false;
          } else {
            return false;
          }
        }
      }
      if (selectedStock !== 'all' && p.stock_status !== selectedStock)
        return false;
      if (selectedFeatured === 'featured' && !p.is_featured) return false;
      if (selectedFeatured === 'regular' && p.is_featured) return false;
      return true;
    });
  }, [products, selectedCategory, selectedStock, selectedFeatured]);

  // CSV Export handler
  const handleExportCSV = () => {
    if (filteredProducts.length === 0) return;
    const headers = [
      'ID',
      'Name',
      'SKU',
      'Category',
      'Price',
      'Sale Price',
      'Stock Status',
      'Featured',
      'Active',
    ];
    const rows = filteredProducts.map((p) => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.sku || '',
      Array.isArray(p.categories)
        ? `"${p.categories.map((c: any) => c.name).join(', ')}"`
        : '',
      p.price || 0,
      p.sale_price || '',
      p.stock_status,
      p.is_featured ? 'Yes' : 'No',
      p.is_active ? 'Yes' : 'No',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `devireen_products_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      title: 'Export Complete',
      description: `Exported ${filteredProducts.length} products to CSV`,
      variant: 'success',
    });
  };

  // Bulk Delete Handler
  const handleBulkDelete = async (selectedRows: any[]) => {
    if (
      !confirm(
        `Are you sure you want to delete ${selectedRows.length} products?`
      )
    )
      return;

    let deletedCount = 0;
    for (const row of selectedRows) {
      const res = await deleteProductAction(row.id);
      if (res.success) deletedCount++;
    }

    setProducts((prev) =>
      prev.filter((p) => !selectedRows.some((sr) => sr.id === p.id))
    );
    addToast({
      title: 'Bulk Delete Complete',
      description: `Successfully deleted ${deletedCount} products`,
      variant: 'success',
    });
  };

  // Bulk Actions
  const renderBulkActions = (selectedRows: any[]) => {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            for (const row of selectedRows) {
              await updateProductAction(row.id, {
                is_featured: !row.is_featured,
              });
            }
            addToast({
              title: 'Updated',
              description: 'Toggled featured status for selected items',
              variant: 'success',
            });
          }}
          className="h-8 border-slate-700 bg-slate-800 text-xs text-slate-200 hover:bg-slate-700"
        >
          <Star className="mr-1 h-3.5 w-3.5" /> Toggle Featured
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 text-xs shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-slate-700 uppercase">
            <Filter className="h-3.5 w-3.5 text-blue-600" /> Filters:
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-8 rounded-xl border-slate-200 bg-slate-50 px-2.5 text-xs font-medium"
          >
            <option value="all">All Categories ({categories.length})</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={selectedStock}
            onChange={(e) => setSelectedStock(e.target.value)}
            className="h-8 rounded-xl border-slate-200 bg-slate-50 px-2.5 text-xs font-medium"
          >
            <option value="all">All Stock Statuses</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
            <option value="PRE_ORDER">Pre-Order</option>
          </select>

          {/* Featured Filter */}
          <select
            value={selectedFeatured}
            onChange={(e) => setSelectedFeatured(e.target.value)}
            className="h-8 rounded-xl border-slate-200 bg-slate-50 px-2.5 text-xs font-medium"
          >
            <option value="all">All Products</option>
            <option value="featured">Featured Only</option>
            <option value="regular">Standard Only</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="flex h-8 items-center gap-1.5 rounded-xl border-slate-200 text-xs"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Main DataTable */}
      <DataTable
        columns={columns}
        data={filteredProducts}
        searchKey="name"
        searchPlaceholder="Search products by title or SKU..."
        onBulkDelete={handleBulkDelete}
        bulkActions={renderBulkActions}
      />
    </div>
  );
}
