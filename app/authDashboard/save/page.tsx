import { getSavedPosts } from '@/actions/saved-posts-actions';
import SavedPostsClient from '@/components/saved/SavedPostsClient';

export const dynamic = 'force-dynamic';
export const runtime = 'edge'; // Add this line

export default async function SavedPostsPage() {
  const result = await getSavedPosts();

  if (!result.success) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-8 font-mono">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              ACCESS_DENIED
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {result.error || 'PLEASE_LOGIN_TO_VIEW_SAVED_POSTS'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <SavedPostsClient initialSavedPosts={result.savedPosts} />;
}