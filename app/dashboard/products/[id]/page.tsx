import { fetchCategories } from '@/actions/category.actions';
import { ProductForm } from '@/components/dashboard/products/ProductForm';
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Edit Product | Devireen CMS',
};

async function getProductById(id: string) {
  const supabase = await createAdminClient();
  const { data } = await supabase
    .from('products')
    .select(
      '*, product_images(*), product_categories(category_id, categories(id, name, slug))'
    )
    .eq('id', id)
    .single();

  if (!data) return null;

  return {
    ...data,
    categories: (data.product_categories || [])
      .map((pc: any) => pc.categories)
      .filter(Boolean),
  };
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const result = await fetchCategories();
  const categories = result.success ? result.data : [];
  const brands: any[] = [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-gray-500">Update {product.name}</p>
      </div>

      <ProductForm
        initialData={product}
        categories={categories || []}
        brands={brands || []}
      />
    </div>
  );
}
