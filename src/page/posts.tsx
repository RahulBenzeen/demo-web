import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  useGetPostsQuery,
  useSearchPostsQuery,
  useGetCategoriesQuery,
} from "@/store/postApi";
import type { Post } from "@/store/postApi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useInfiniteScroll } from "@/lib/useInfiniteScroll";
import { useDebounce } from "@/lib/useDebounce";
import { FilterSidebar } from "@/components/posts/filter-sidebar";
import { PostsHeader } from "@/components/posts/post-header";
import { ActiveFilters } from "@/components/posts/active-filters";
import { PostsGrid } from "@/components/posts/post-grid";

export default function PostsPage() {
  const [searchText, setSearchText] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [lastDocId, setLastDocId] = useState<string | undefined>(undefined);

  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const debouncedSearchText = useDebounce(searchText, 500);

  // Get categories from API
  const { data: categories = [], isLoading: isCategoriesLoading } =
    useGetCategoriesQuery();

  // Base query parameters for fetching posts
  const baseQueryParams = useMemo(() => ({
    limit: 10,
    category: selectedCategories.length === 1 ? selectedCategories[0] : undefined,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
  }), [selectedCategories, selectedTags]);

  // Query arguments with pagination
  const queryArgs = useMemo(() => ({
    ...baseQueryParams,
    lastDocId,
  }), [baseQueryParams, lastDocId]);

  // Fetch posts with pagination
  const {
    data: postsData,
    isLoading,
    isFetching,
    isError,
  } = useGetPostsQuery(queryArgs, {
    skip: debouncedSearchText.length > 0,
    refetchOnMountOrArgChange: true,
  });

  // Reset pagination when filters change
  useEffect(() => {
    setLastDocId(undefined);
  }, [baseQueryParams]);

  // Search posts when search text is entered
  const {
    data: searchResults = [],
    isLoading: isSearchLoading,
  } = useSearchPostsQuery(debouncedSearchText, {
    skip: debouncedSearchText.length === 0,
  });

  // Load more posts function
  const loadMorePosts = useCallback(() => {
    if (postsData?.hasMore && postsData?.lastDocId && !isFetching) {
      setLastDocId(postsData.lastDocId);
    }
  }, [postsData?.hasMore, postsData?.lastDocId, isFetching]);

  // Handle infinite scroll
  const { lastElementRef } = useInfiniteScroll(loadMorePosts, {
    skip: !postsData?.hasMore || isFetching || !!debouncedSearchText,
    rootMargin: "200px",
  });

  // Extract all unique tags from posts
  const allTags = useMemo(() => {
    const postsToProcess = debouncedSearchText
      ? searchResults
      : postsData?.posts || [];
    if (!postsToProcess || postsToProcess.length === 0) return [];

    const tags = postsToProcess
      .filter((post: Post) => post.tags && post.tags.length > 0)
      .flatMap((post: Post) => post.tags);

    return [...new Set(tags)].filter(Boolean) as string[];
  }, [postsData?.posts, searchResults, debouncedSearchText]);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Toggle category selection
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Reset all filters
  const clearFilters = () => {
    setSelectedTags([]);
    setSelectedCategories([]);
    setSearchText("");
    setLastDocId(undefined);
  };

  // Filter posts (client-side filtering for multiple categories or complex tag filtering)
  const filterPosts = useCallback((posts: Post[]) => {
    let filtered = posts;

    if (selectedTags.length > 0) {
      filtered = filtered.filter((post) => {
        if (!post.tags || post.tags.length === 0) return false;
        return selectedTags.some((tag) => post.tags.includes(tag));
      });
    }

    if (selectedCategories.length > 1) {
      filtered = filtered.filter((post) =>
        selectedCategories.includes(post.category)
      );
    }

    return filtered;
  }, [selectedTags, selectedCategories]);

  // Determine which posts to display
  const displayPosts = useMemo(
    () =>
      debouncedSearchText
        ? searchResults
        : postsData?.posts || [],
    [debouncedSearchText, searchResults, postsData?.posts]
  );
  const filteredPosts = useMemo(
    () => filterPosts(displayPosts),
    [displayPosts, filterPosts]
  );

  // Various loading states for UI feedback
  const isInitialLoading = isLoading || (isSearchLoading && debouncedSearchText.length > 0);
  const isLoadingMore = isFetching && !isLoading && !debouncedSearchText;

  // Active filter count for badge
  const activeFilterCount = useMemo(() => 
    selectedTags.length + selectedCategories.length + (debouncedSearchText ? 1 : 0), 
    [selectedTags, selectedCategories, debouncedSearchText]
  );

  const handleCreatePost = () => navigate("/create-post");
  const handlePostClick = (postId: string) => navigate(`/${postId}`);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <FilterSidebar
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            activeFilterCount={activeFilterCount}
            categories={categories}
            isCategoriesLoading={isCategoriesLoading}
            selectedCategories={selectedCategories}
            toggleCategory={toggleCategory}
            allTags={allTags}
            isInitialLoading={isInitialLoading}
            selectedTags={selectedTags}
            toggleTag={toggleTag}
            clearFilters={clearFilters}
            debouncedSearchText={debouncedSearchText}
          />

          {/* Main content */}
          <div className="flex-1 max-w-5xl w-full">
            <PostsHeader
              activeFilterCount={activeFilterCount}
              setShowFilters={setShowFilters}
              searchText={searchText}
              setSearchText={setSearchText}
              handleSearch={handleSearch}
              viewMode={viewMode}
              setViewMode={setViewMode}
              currentUser={currentUser}
              onCreatePost={handleCreatePost}
            />

            <ActiveFilters
              selectedTags={selectedTags}
              selectedCategories={selectedCategories}
              debouncedSearchText={debouncedSearchText}
              setSearchText={setSearchText}
              toggleCategory={toggleCategory}
              toggleTag={toggleTag}
            />

            <PostsGrid
              isInitialLoading={isInitialLoading}
              viewMode={viewMode}
              filteredPosts={filteredPosts}
              isError={isError}
              currentUser={currentUser}
              onCreatePost={handleCreatePost}
              onPostClick={handlePostClick}
              lastElementRef={lastElementRef}
              debouncedSearchText={debouncedSearchText}
              isLoadingMore={isLoadingMore}
              postsData={postsData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
