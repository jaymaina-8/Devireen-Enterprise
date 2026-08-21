import { fetchCategories } from '@/actions/category.actions';
import { CategoriesClientView } from '@/components/dashboard/categories/CategoriesClientView';

export const metadata = {
  title: 'Categories | Devireen Enterprise',
};

export default async function CategoriesPage() {
  const result = await fetchCategories();
  const categories = result.success ? result.data : [];

  return <CategoriesClientView initialCategories={categories || []} />;
}
