import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  useGetPostsQuery,
  useSearchPostsQuery,
  useGetCategoriesQuery,
} from "@/store/postApi";
import type { Post } from "@/store/postApi";
import { Plus, Search, Grid3X3, List, Filter, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useInfiniteScroll } from "@/lib/useInfiniteScroll";
import { useDebounce } from "@/lib/useDebounce";
import { PostCard } from "@/components/post-card";
import { PostListItem } from "@/components/post-list-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

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
    // refetch,
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Mobile filter overlay */}
        {showFilters && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setShowFilters(false)}
          />
        )}

        {/* Sidebar filters */}
        <div 
          className={`fixed lg:sticky top-0 left-0 h-screen lg:h-auto z-50 lg:z-auto lg:w-64 flex-shrink-0 transition-transform duration-300 lg:transform-none ${
            showFilters ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
          style={{ width: "16rem" }}
        >
          <Card className="h-full lg:h-auto rounded-none lg:rounded-lg overflow-hidden">
            <CardHeader className="pb-3 sticky top-0 bg-background z-10 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Filters</CardTitle>
                <div className="flex items-center gap-2">
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="px-1.5 py-0">
                      {activeFilterCount}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={() => setShowFilters(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-6 py-4">
              {/* Categories */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Categories</h4>
                <ScrollArea className="h-[120px]">
                  {isCategoriesLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <Skeleton className="h-4 w-4 rounded" />
                          <Skeleton className="h-4 w-24 rounded" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {categories.map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`category-${category.id}`}
                            checked={selectedCategories.includes(category.name)}
                            onCheckedChange={() => toggleCategory(category.name)}
                          />
                          <Label
                            htmlFor={`category-${category.id}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {category.name} ({category.postCount})
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>

              <Separator />

              {/* Tags */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Tags</h4>
                <ScrollArea className="h-[120px]">
                  {isInitialLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <Skeleton className="h-4 w-4 rounded" />
                          <Skeleton className="h-4 w-20 rounded" />
                        </div>
                      ))}
                    </div>
                  ) : allTags.length > 0 ? (
                    <div className="space-y-3">
                      {allTags.map((tag, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`tag-${tag}`}
                            checked={selectedTags.includes(tag)}
                            onCheckedChange={() => toggleTag(tag)}
                          />
                          <Label
                            htmlFor={`tag-${tag}`}
                            className="text-sm font-normal cursor-pointer truncate"
                          >
                            {tag}
                          </Label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-2 text-sm text-muted-foreground">
                      No tags available
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Clear filters */}
              {(selectedTags.length > 0 ||
                selectedCategories.length > 0 ||
                debouncedSearchText) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Clear All Filters
                  </Button>
                )}
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="flex-1 max-w-5xl w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden"
                onClick={() => setShowFilters(true)}
              >
                <Filter className="h-4 w-4" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Posts</h1>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="relative w-full sm:w-auto">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search posts..."
                    className="w-full pl-9 sm:w-[200px] md:w-[300px]"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </form>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="h-9 w-9"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="h-9 w-9"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {currentUser && (
                <Button 
                  onClick={() => navigate("/create-post")}
                  className="whitespace-nowrap"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Post
                </Button>
              )}
            </div>
          </div>

          {/* Active filters display */}
          {(selectedTags.length > 0 ||
            selectedCategories.length > 0 ||
            debouncedSearchText) && (
              <div className="flex flex-wrap gap-2 items-center mt-4">
                <span className="text-sm text-muted-foreground">
                  Filtered by:
                </span>
                {debouncedSearchText && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer flex items-center group"
                    onClick={() => setSearchText("")}
                  >
                    Search: {debouncedSearchText}
                    <X className="ml-1 h-3 w-3 group-hover:scale-110 transition-transform" />
                  </Badge>
                )}
                {selectedCategories.map((category) => (
                  <Badge
                    key={category}
                    variant="secondary"
                    className="cursor-pointer flex items-center group"
                    onClick={() => toggleCategory(category)}
                  >
                    {category}
                    <X className="ml-1 h-3 w-3 group-hover:scale-110 transition-transform" />
                  </Badge>
                ))}
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer flex items-center group"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                    <X className="ml-1 h-3 w-3 group-hover:scale-110 transition-transform" />
                  </Badge>
                ))}
              </div>
            )}

          {isInitialLoading ? (
            <div
              className={`mt-6 ${viewMode === "grid"
                ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                : "space-y-4"}`}
            >
              {Array.from({ length: 6 }).map((_, index) =>
                viewMode === "grid" ? (
                  <Card key={index} className="overflow-hidden">
                    <div className="aspect-video w-full">
                      <Skeleton className="h-full w-full" />
                    </div>
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </Card>
                ) : (
                  <div key={index} className="flex gap-4 p-4 border rounded-lg">
                    <Skeleton className="h-24 w-24 rounded-md flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <>
              {filteredPosts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">
                    {isError
                      ? "Error loading posts. Please try again later."
                      : "No posts found. Try a different search or create a new post."}
                  </p>
                  {!isError && currentUser && (
                    <Button 
                      className="mt-4"
                      onClick={() => navigate("/create-post")}
                    >
                      Create New Post
                    </Button>
                  )}
                </div>
              ) : (
                <div
                  className={`mt-6 ${viewMode === "grid"
                    ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                    : "space-y-4"}`}
                  style={{ minHeight: "200px" }}
                >
                  {filteredPosts.map((post: Post, index) => {
                    const isLastItem = index === filteredPosts.length - 1;

                    return viewMode === "grid" ? (
                      <div
                        key={post.id}
                        ref={
                          isLastItem && !debouncedSearchText
                            ? lastElementRef
                            : null
                        }
                        className="transition-all duration-300 ease-in-out"
                      >
                        <PostCard
                          post={post}
                          className="cursor-pointer h-full hover:shadow-md transition-shadow duration-200"
                          onClick={() => navigate(`/${post.id}`)}
                        />
                      </div>
                    ) : (
                      <div
                        key={post.id}
                        ref={
                          isLastItem && !debouncedSearchText
                            ? lastElementRef
                            : null
                        }
                        className="transition-all duration-300 ease-in-out"
                      >
                        <PostListItem
                          post={post}
                          className="cursor-pointer hover:bg-accent/50 transition-colors duration-200"
                          onClick={() => navigate(`/${post.id}`)}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Loading indicator */}
              {isLoadingMore && (
                <div className="flex justify-center py-8">
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="h-4 w-4 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-4 w-4 rounded-full bg-primary animate-bounce"></div>
                  </div>
                </div>
              )}

              {/* End of posts message */}
              {!postsData?.hasMore &&
                (postsData?.posts?.length || 0) > 0 &&
                !debouncedSearchText &&
                !isLoadingMore && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>You've reached the end of the posts</p>
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}