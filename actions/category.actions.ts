'use server';

import { CategoryRepository } from '@/lib/supabase/repositories/category.repository';
import { categorySchema } from '@/lib/validation/category.schema';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { verifyAdminServerAction } from '@/lib/auth/authorization';
import { createSafeAction } from '@/lib/actions/withErrorHandling';
import { rateLimit } from '@/lib/rate-limit';

export const fetchCategories = createSafeAction('fetchCategories', async () => {
  return await CategoryRepository.getCategories();
});

export const fetchCategoryById = createSafeAction(
  'fetchCategoryById',
  async (id: string) => {
    return await CategoryRepository.getCategoryById(id);
  }
);

export const createCategoryAction = createSafeAction(
  'createCategoryAction',
  async (formData: FormData) => {
    const user = await verifyAdminServerAction();
    const rateLimitResult = await rateLimit(
      `admin:${user.id}`,
      'ADMIN_MUTATION'
    );
    if (!rateLimitResult.success) {
      throw new Error('Too many requests. Please try again later.');
    }
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
    return true;
  }
);

export const updateCategoryAction = createSafeAction(
  'updateCategoryAction',
  async (id: string, formData: FormData, skipRedirect = false) => {
    const user = await verifyAdminServerAction();
    const rateLimitResult = await rateLimit(
      `admin:${user.id}`,
      'ADMIN_MUTATION'
    );
    if (!rateLimitResult.success) {
      throw new Error('Too many requests. Please try again later.');
    }
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
    return true;
  }
);

export const deleteCategoryAction = createSafeAction(
  'deleteCategoryAction',
  async (id: string) => {
    const user = await verifyAdminServerAction();
    const rateLimitResult = await rateLimit(
      `admin:${user.id}`,
      'ADMIN_MUTATION'
    );
    if (!rateLimitResult.success) {
      throw new Error('Too many requests. Please try again later.');
    }
    const categories = await CategoryRepository.getCategories();
    const targetCategory = categories.find((c) => c.id === id);

    if (targetCategory && targetCategory.productCount > 0) {
      throw new Error(
        'This category contains products. Move or delete those products before deleting the category.'
      );
    }

    await CategoryRepository.deleteCategory(id);
    revalidatePath('/dashboard/categories');
    return true;
  }
);
