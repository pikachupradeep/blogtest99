// components/BlogPostCard.tsx
import Link from 'next/link';
import { FiEye, FiCalendar } from 'react-icons/fi';

interface BlogPost {
  $id: string;
  title: string;
  description: string;
  category_name: string;
  thumbnail?: string;
  views: number;
  author_id: string;
  profile_id: string;
  slug: string;
  $createdAt: string;
  author: {
    name: string;
    image?: string;
    bio?: string;
  } | null;
}

interface BlogPostCardProps {
  post: BlogPost;
  className?: string;
}

export default function BlogPostCard({ post, className = '' }: BlogPostCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Link href={`/blog/${post.slug}`} className={`block group hover:no-underline ${className}`}>
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 h-full flex flex-col">
        {/* Thumbnail */}
        <div className="aspect-video bg-gray-100 overflow-hidden">
          {post.thumbnail ? (
            <img
              src={post.thumbnail}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center">
              <div className="text-gray-400 text-center">
                <FiEye className="w-12 h-12 mx-auto mb-2" />
                <span className="text-sm">No Image</span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Category */}
          <div className="mb-3">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {post.category_name}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {post.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
            {post.description}
          </p>

          {/* Author and Meta Info */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            {/* Author */}
            <div className="flex items-center space-x-3">
              {post.author?.image ? (
                <img
                  src={post.author.image}
                  alt={post.author.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    {post.author?.name?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {post.author?.name || 'Unknown Author'}
                </p>
              </div>
            </div>

            {/* Meta Info */}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <FiEye className="w-4 h-4" />
                <span>{post.views}</span>
              </div>
              <div className="flex items-center space-x-1">
                <FiCalendar className="w-4 h-4" />
                <span>{formatDate(post.$createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}