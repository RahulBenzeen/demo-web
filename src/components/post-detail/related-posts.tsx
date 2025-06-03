import React, { useState, useCallback, useEffect, useRef, useMemo, memo } from "react"
import { useNavigate } from "react-router-dom"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useGetRelatedPostsQuery } from "@/store/postApi"
import { Post } from "@/utils/types/interfaces"
import { useInfiniteScroll } from "@/utils/useInfiniteScroll"
import { format } from "date-fns"

interface RelatedPostsProps {
  currentPostId: string
  category: string
}

const RelatedPosts: React.FC<RelatedPostsProps> = memo(({
  currentPostId,
  category,
}) => {
  const navigate = useNavigate()
  const [startAfter, setStartAfter] = useState<string | null>(null)
  const [allPosts, setAllPosts] = useState<Post[]>([])
  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({})
  const contentRef = useRef<HTMLDivElement>(null)
  const isFirstLoad = useRef(true)

  // Reset state when dependencies change
  useEffect(() => {
    setAllPosts([])
    setStartAfter(null)
    setImageLoading({})
    isFirstLoad.current = true
  }, [currentPostId, category])

  const {
    data: response,
    isFetching,
    isError,
    isSuccess,
    isUninitialized,
  } = useGetRelatedPostsQuery(
    {
      category,
      excludeId: currentPostId,
      limit: 5,
      startAfter,
    },
    { skip: !currentPostId || !category }
  )

  // Append new posts and handle duplicates
  useEffect(() => {
    if (isSuccess && response?.posts) {
      setAllPosts(prev => {
        const existingIds = new Set(prev.map(p => p.id))
        const newPosts = response.posts.filter(p => !existingIds.has(p.id))
        return [...prev, ...newPosts]
      })
      isFirstLoad.current = false
    }
  }, [response, isSuccess])

  const fetchMore = useCallback(() => {
    if (response?.hasMore && !isFetching && response.lastDocId) {
      setStartAfter(response.lastDocId)
    }
  }, [response, isFetching])

  const { lastElementRef } = useInfiniteScroll(fetchMore, {
    skip: !response?.hasMore || isFetching,
    // root: contentRef.current
  })

  const handlePostClick = useCallback((id: string) => {
    navigate(`/${id}`, { replace: true, state: { fromRelated: true } })
    window.scrollTo(0, 0)
  }, [navigate])

  const handleImageLoad = useCallback((id: string) => {
    setImageLoading(prev => ({ ...prev, [id]: false }))
  }, [])

  const handleImageError = useCallback((id: string) => {
    setImageLoading(prev => ({ ...prev, [id]: false }))
  }, [])

  // Memoize post items to prevent unnecessary re-renders
  const postItems = useMemo(() => {
    if (allPosts.length === 0) return null
    
    return allPosts.map((post, index) => {
      const isLast = index === allPosts.length - 1
      const isLoading = imageLoading[post.id] === undefined || imageLoading[post.id]
      
      return (
        <RelatedPostItem
          key={post.id}
          post={post}
          isLast={isLast}
          isLoading={isLoading}
          onImageLoad={() => handleImageLoad(post.id)}
          onImageError={() => handleImageError(post.id)}
          onClick={() => handlePostClick(post.id)}
          ref={isLast ? lastElementRef : null}
        />
      )
    })
  }, [allPosts, imageLoading, handleImageLoad, handleImageError, handlePostClick, lastElementRef])

  // Loading skeletons
  const loadingSkeletons = useMemo(() => (
    Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="flex items-start space-x-3">
        <Skeleton className="h-16 w-16 rounded-md" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    ))
  ), [])

  if (isError) return null

  const isEmptyState = !isFetching && !isUninitialized && allPosts.length === 0

  return (
    <Card className="w-full max-w-md bg-background/90 backdrop-blur-sm border border-border/50 sticky top-24">
      <CardHeader className="pb-3 sticky top-0 bg-background/95 z-10 border-b">
        <h3 className="text-xl font-bold text-gradient">Related Posts</h3>
      </CardHeader>

      <CardContent 
        ref={contentRef}
        className="space-y-4 max-h-[calc(100vh-150px)] overflow-y-auto pr-2"
        aria-busy={isFetching}
      >
        {isFirstLoad.current && isFetching ? (
          loadingSkeletons
        ) : postItems ? (
          <>
            {postItems}
            
            {/* Loading spinner when fetching more */}
            {isFetching && (
              <div className="flex justify-center py-4">
                <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            )}
          </>
        ) : isEmptyState ? (
          <p className="text-muted-foreground text-sm py-4 text-center">
            No related posts found
          </p>
        ) : null}

        {/* Fallback Load More button */}
        {!isFetching && response?.hasMore && (
          <div className="flex justify-center pt-4">
            <button
              onClick={fetchMore}
              className="text-sm font-medium px-4 py-2 rounded-lg bg-muted hover:bg-muted/70 transition"
              aria-label="Load more posts"
              disabled={isFetching}
            >
              Load More
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
})

interface RelatedPostItemProps {
  post: Post
  isLast: boolean
  isLoading: boolean
  onImageLoad: () => void
  onImageError: () => void
  onClick: () => void
}

const RelatedPostItem = React.forwardRef<HTMLDivElement, RelatedPostItemProps>(
  ({ post, isLoading, onImageLoad, onImageError, onClick }, ref) => {
    const formattedDate = useMemo(
      () => format(new Date(post.createdAt), "MMM dd, yyyy"),
      [post.createdAt]
    )
    
    return (
      <div
        ref={ref}
        onClick={onClick}
        className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50 transition cursor-pointer group"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onClick()}
        aria-label={`View post: ${post.title}`}
      >
        {post.coverImage ? (
          <div className="relative">
            {isLoading && (
              <Skeleton className="absolute inset-0 h-16 w-16 rounded-md" />
            )}
            <img
              src={post.coverImage}
              alt={post.title}
              className={`h-16 w-16 object-cover rounded-md transition-transform group-hover:scale-105 ${
                isLoading ? "invisible" : ""
              }`}
              onLoad={onImageLoad}
              onError={onImageError}
              loading="lazy"
            />
          </div>
        ) : (
          <div className="bg-muted border-2 border-dashed rounded-md w-16 h-16 flex items-center justify-center">
            <span className="text-2xl">📝</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            {formattedDate}
          </p>
        </div>
      </div>
    )
  }
)

RelatedPostItem.displayName = "RelatedPostItem"

export default RelatedPosts