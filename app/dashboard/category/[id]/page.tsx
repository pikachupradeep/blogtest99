import { UpdateCategoryForm } from '@/components/UpdateCategoryForm';
import { getCategoryByIdAction } from '@/actions/category-actions';
import { redirect } from 'next/navigation';

interface UpdateCategoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UpdateCategoryPage({ params }: UpdateCategoryPageProps) {
  try {
    // Await the params first
    const { id } = await params;
    
    if (!id) {
      redirect('/dashboard/category');
    }

    const category = await getCategoryByIdAction(id);

    if (!category) {
      redirect('/dashboard/category');
    }

    // Format the category data
    const formattedCategory = {
      $id: category.$id,
      name: category.name,
      image: category.image || undefined
    };

    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <UpdateCategoryForm 
            category={formattedCategory}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in UpdateCategoryPage:', error);
    redirect('/dashboard/category');
  }
}