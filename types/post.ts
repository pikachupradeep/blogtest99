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
  category_id: string;
  category_name: string;
  profile_id: string;
  author_id: string;
  status: string;
  author: Author;
  category: Category;
  likes: number;
  userLiked: boolean;
  $createdAt: string;
  $updatedAt: string;
  $permissions?: string[];
}

export interface PostsResponse {
  success: boolean;
  data?: Post[];
  message?: string;
}