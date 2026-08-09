'use server';

import { CategoryRepository } from '@/lib/supabase/repositories/category.repository';
import { categorySchema } from '@/lib/validation/category.schema';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { verifyAdminServerAction } from '@/lib/auth/authorization';

export async function fetchCategories() {
  try {
    const categories = await CategoryRepository.getCategories();
    return { success: true, data: categories };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchCategoryById(id: string) {
  try {
    const category = await CategoryRepository.getCategoryById(id);
    return { success: true, data: category };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createCategoryAction(formData: FormData) {
  try {
    await verifyAdminServerAction();
    const rawData = {
      name: formData.get('name'),
      slug: formData.get('slug'),
      description: formData.get('description'),
      parent_id: formData.get('parent_id') || null,
      is_active: formData.get('is_active') === 'true',
    };

    const validatedData = categorySchema.parse(rawData);
    await CategoryRepository.createCategory(validatedData);

    revalidatePath('/dashboard/categories');
  } catch (error: any) {
    return { success: false, error: error.message || 'Validation failed' };
  }

  // We handle redirection in the client component now for better UX,
  // but if server-only form we can keep redirect. We'll return success instead.
  return { success: true };
}

export async function updateCategoryAction(
  id: string,
  formData: FormData,
  skipRedirect = false
) {
  try {
    await verifyAdminServerAction();
    const rawData = {
      name: formData.get('name'),
      slug: formData.get('slug'),
      description: formData.get('description'),
      parent_id: formData.get('parent_id') || null,
      is_active: formData.get('is_active') === 'true',
    };

    const validatedData = categorySchema.parse(rawData);
    await CategoryRepository.updateCategory(id, validatedData);

    revalidatePath('/dashboard/categories');
    if (skipRedirect) return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Validation failed' };
  }

  return { success: true };
}

export async function deleteCategoryAction(id: string) {
  try {
    await verifyAdminServerAction();
    const categories = await CategoryRepository.getCategories();
    const targetCategory = categories.find((c) => c.id === id);

    if (targetCategory && targetCategory.productCount > 0) {
      return {
        success: false,
        error:
          'This category contains products. Move or delete those products before deleting the category.',
      };
    }

    await CategoryRepository.deleteCategory(id);
    revalidatePath('/dashboard/categories');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
