'use client';

import { useTransition } from 'react';
import { deleteCategoryAction } from '@/actions/category-actions';

interface DeleteCategoryButtonProps {
  categoryId: string;
  categoryName: string;
}

export function DeleteCategoryButton({ categoryId, categoryName }: DeleteCategoryButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${categoryName}"?`)) {
      startTransition(async () => {
        const result = await deleteCategoryAction(categoryId);
        if (result.error) {
          alert(result.error);
        }
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
    >
      {isPending ? 'Deleting...' : 'Delete'}
    </button>
  );
}