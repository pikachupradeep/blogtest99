// app/page.tsx
"use client";

import InfiniteMovingPosts from "@/components/carousel/carousel";
import { HeroSection } from "@/components/hero/Hero";
import PostCards from "@/components/postGrid/get-all-posts";
import { useState } from "react";

export default function Page() {
  const [filters, setFilters] = useState({
    searchQuery: '',
    category: 'all',
    author: 'all',
    sortBy: 'newest'
  });

  return (
    <div>
      <HeroSection onFilterChange={setFilters} />
      <PostCards filters={filters} />
      <InfiniteMovingPosts />
    </div>
  );
}