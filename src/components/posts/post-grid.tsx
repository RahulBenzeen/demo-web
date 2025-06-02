import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PostCard } from '@/components/post-card'
import { PostListItem } from '@/components/post-list-item'
import { Post } from '@/utils/types/interfaces'


interface PostsGridProps {
  isInitialLoading: boolean
  viewMode: 'grid' | 'list'
  filteredPosts: Post[]
  isError: boolean
  currentUser: any
  onCreatePost: () => void
  onPostClick: (postId: string) => void
  lastElementRef: (node: HTMLDivElement | null) => void
  debouncedSearchText: string
  isLoadingMore: boolean
  postsData: any
}

export const PostsGrid: React.FC<PostsGridProps> = ({
  isInitialLoading,
  viewMode,
  filteredPosts,
  isError,
  currentUser,
  onCreatePost,
  onPostClick,
  lastElementRef,
  debouncedSearchText,
  isLoadingMore,
  postsData,
}) => {
  if (isInitialLoading) {
    return (
      <div
        className={`${viewMode === "grid"
          ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          : "space-y-4"}`}
      >
        {Array.from({ length: 6 }).map((_, index) =>
          viewMode === "grid" ? (
            <Card key={index} className="overflow-hidden card-hover animate-pulse">
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
            <div key={index} className="flex gap-4 p-4 border rounded-lg card-hover animate-pulse">
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
    )
  }

  if (filteredPosts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="animate-fade-in">
          <p className="text-muted-foreground text-lg mb-4">
            {isError
              ? "Error loading posts. Please try again later."
              : "No posts found. Try a different search or create a new post."}
          </p>
          {!isError && currentUser && (
            <Button 
              className="btn-animate shadow-medium"
              onClick={onCreatePost}
            >
              Create New Post
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        className={`${viewMode === "grid"
          ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          : "space-y-4"}`}
        style={{ minHeight: "200px" }}
      >
        {filteredPosts.map((post: Post, index) => {
          const isLastItem = index === filteredPosts.length - 1

          return viewMode === "grid" ? (
            <div
              key={post.id}
              ref={
                isLastItem && !debouncedSearchText
                  ? lastElementRef
                  : null
              }
              className="animate-fade-in card-hover"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <PostCard
                post={post}
                className="cursor-pointer h-full hover:shadow-large transition-all duration-300"
                onClick={() => onPostClick(post.id)}
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
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <PostListItem
                post={post}
                className="cursor-pointer hover:bg-accent/50 transition-all duration-300 hover:shadow-medium rounded-lg"
                onClick={() => onPostClick(post.id)}
              />
            </div>
          )
        })}
      </div>

      {/* Enhanced loading indicator */}
      {isLoadingMore && (
        <div className="flex justify-center py-8">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-3 w-3 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-3 w-3 rounded-full bg-primary animate-bounce"></div>
          </div>
        </div>
      )}

      {/* End of posts message */}
      {!postsData?.hasMore &&
        (postsData?.posts?.length || 0) > 0 &&
        !debouncedSearchText &&
        !isLoadingMore && (
          <div className="text-center py-8 text-muted-foreground animate-fade-in">
            <p className="text-sm">You've reached the end of the posts</p>
          </div>
        )}
    </>
  )
}
