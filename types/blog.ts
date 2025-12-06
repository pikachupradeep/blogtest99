// types/blog.ts
export interface Author {
  name: string;
  image?: string;
  id: string;
  bio?: string;
}

export interface Category {
  name: string;
  id: string;
}

export interface Post {
  $id: string;
  title: string;
  description: string;
  content: string;
  slug: string;
  bg_image?: string;
  thumbnail?: string;
  $createdAt: string;
  author: Author;
  category: Category;
  profile_id: string;
  author_id: string;
  category_id: string;
  category_name: string;
  status: string;
  likes?: number;
  userLiked?: boolean;
}

// Appwrite document type (what we get from the database)
export interface AppwriteDocument {
  $id: string;
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  [key: string]: any;
}

// Type guard to check if an object is a Post
export function isPost(obj: any): obj is Post {
  return (
    obj &&
    typeof obj.$id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.content === 'string' &&
    typeof obj.slug === 'string' &&
    typeof obj.$createdAt === 'string' &&
    obj.author &&
    typeof obj.author.name === 'string' &&
    obj.category &&
    typeof obj.category.name === 'string'
  );
}

// Utility function to safely convert Appwrite documents to Post objects
export function mapDocumentToPost(doc: any): Post {
  return {
    $id: doc.$id || '',
    title: doc.title || '',
    description: doc.description || '',
    content: doc.content || '',
    slug: doc.slug || '',
    bg_image: doc.bg_image,
    thumbnail: doc.thumbnail,
    $createdAt: doc.$createdAt || '',
    author: {
      name: doc.author?.name || 'Unknown Author',
      image: doc.author?.image,
      id: doc.author?.id || doc.author_id || '',
      bio: doc.author?.bio
    },
    category: {
      name: doc.category?.name || 'Uncategorized',
      id: doc.category?.id || doc.category_id || ''
    },
    profile_id: doc.profile_id || '',
    author_id: doc.author_id || '',
    category_id: doc.category_id || '',
    category_name: doc.category_name || '',
    status: doc.status || 'published',
    likes: doc.likes || 0,
    userLiked: doc.userLiked || false
  };
}

// Utility function to safely convert array of Appwrite documents to Post array
export function mapDocumentsToPosts(docs: any[]): Post[] {
  return docs.map(mapDocumentToPost);
}