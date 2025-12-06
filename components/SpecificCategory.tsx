// app/categories/[name]/page.tsx - DEBUG VERSION
import { getPostsByCategory } from '@/actions/category-actions';
import { getCategoryByName } from '@/data/categories';


interface PageProps {
  params: Promise<{
    name: string;
  }>;
}

export default async function CategoryPostsPage({ params }: PageProps) {
  const { name } = await params;
  const categoryName = decodeURIComponent(name);

  console.log('🔍 Category Page Loaded:', { categoryName });

  try {
    const category = await getCategoryByName(categoryName);
    console.log('📋 Category Data:', category);

    if (!category) {
      return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Category Not Found</h1>
          <p className="text-gray-600">The category "{categoryName}" does not exist.</p>
          <div className="mt-4 p-4 bg-yellow-50 rounded">
            <p className="text-sm">Debug: No category found with name "{categoryName}"</p>
          </div>
        </div>
      );
    }

    const posts = await getPostsByCategory(categoryName);
    console.log('📋 Posts Data:', posts);

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Posts in {category.name}
          </h1>
          <p className="text-gray-600">
            Category ID: {category.$id}
          </p>
        </div>

        {/* DEBUG INFO */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Debug Information:</h3>
          <div className="text-sm text-blue-700">
            <p>Category Name: {category.name}</p>
            <p>Category ID: {category.$id}</p>
            <p>Posts Found: {posts.length}</p>
            <p>Environment: {process.env.NEXT_PRIVATE_POST_COLLECTION_ID ? '✅ Posts Collection Set' : '❌ Posts Collection Missing'}</p>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="text-yellow-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Posts Found</h3>
            <p className="text-gray-600 mb-4">There are no published posts in the "{category.name}" category.</p>
            <div className="text-left bg-gray-50 p-4 rounded text-sm">
              <p className="font-semibold">Possible reasons:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>No posts have been created in this category</li>
                <li>Posts exist but are not published (status ≠ "published")</li>
                <li>Posts have a different category name</li>
                <li>Posts collection is not properly configured</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post: any) => (
              <div key={post.$id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h2 className="text-xl font-semibold mb-3 text-gray-800">{post.title}</h2>
                <p className="text-gray-600 mb-4">{post.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Status: {post.status}</span>
                  <span>Created: {new Date(post.$createdAt).toLocaleDateString()}</span>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  Post ID: {post.$id} | Slug: {post.slug}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  } catch (error: any) {
    console.error('❌ Error in CategoryPostsPage:', error);
    
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Error</h1>
        <p className="text-gray-600 mb-2">{error.message}</p>
        <div className="bg-red-50 p-4 rounded">
          <p className="text-sm text-red-700">
            Check your browser console and server logs for more details.
          </p>
        </div>
      </div>
    );
  }
}