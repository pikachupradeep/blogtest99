///dashboard/posts/edit/[id]/

import { getPostByIdAction } from '@/actions/postActions';
import EditPostForm from '@/components/adminDashboard/postTable/EditPostForm';

interface EditPostPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Transform the raw data to match the Post interface
function transformPostData(rawData: any) {
  return {
    $id: rawData.$id || '',
    title: rawData.title || '',
    slug: rawData.slug || '',
    description: rawData.description || '',
    content: rawData.content || '',
    category_id: rawData.category_id || '',
    category_name: rawData.category_name || '',
    status: rawData.status || 'pending',
    thumbnail: rawData.thumbnail || '',
    bg_image: rawData.bg_image || [],
  };
}

export default async function EditPostPage(props: EditPostPageProps) {
  const params = await props.params;
  const postId = params.id;
  
  const result = await getPostByIdAction(postId);

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 font-mono">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-mono">Post Not Found</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6 font-mono">The post you're trying to edit doesn't exist or you don't have permission to edit it.</p>
              <a
                href="/dashboard/posts"
                className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              >
                Back to Posts
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Transform the data before passing to the form
  const transformedPost = transformPostData(result.data);

  return <EditPostForm post={transformedPost} />;
}