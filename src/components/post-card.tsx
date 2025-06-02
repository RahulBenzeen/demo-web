"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Post } from "@/store/postApi"
import { Calendar, MessageSquare, Eye } from "lucide-react"
import { cn } from "@/utils/utils"
import { useState, useMemo } from "react"
import { LikeButton } from "@/components/like-button"

interface PostCardProps {
  post: Post
  className?: string
  onClick?: () => void
}

export function PostCard({ post, className, onClick }: PostCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false)

  const excerpt = useMemo(() => {
    if (!post?.body) return ""
    
    // Create a temporary element to parse HTML
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = post.body
    
    // Get text content and clean up
    let plainText = tempDiv.textContent || tempDiv.innerText || ""
    
    // Remove extra whitespace and newlines
    plainText = plainText
      .replace(/\s+/g, " ")
      .replace(/\n/g, " ")
      .trim()
    
    // Truncate and add ellipsis if needed
    return plainText.length > 150 
      ? plainText.substring(0, 150) + "..." 
      : plainText
  }, [post?.body])

  const handleCardClick = () => {
    if (onClick) onClick()
  }

  return (
    <Card
      className={cn("overflow-hidden transition-all hover:shadow-md h-full flex flex-col cursor-pointer", className)}
      onClick={handleCardClick}
    >
      {post.coverImage && (
        <div className="aspect-video w-full overflow-hidden relative">
          {!isImageLoaded && <div className="absolute inset-0 bg-muted animate-pulse" />}
          <img
            src={post.coverImage || "/placeholder.svg"}
            alt={post.title}
            className={cn(
              "h-full w-full object-cover transition-transform hover:scale-105",
              !isImageLoaded && "opacity-0",
            )}
            loading="lazy"
            onLoad={() => setIsImageLoaded(true)}
          />
        </div>
      )}
      <CardHeader className="flex-none">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="capitalize line-clamp-2">{post.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 text-xs mt-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {post.views}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {post.comments?.length || 0}
              </span>
            </CardDescription>
          </div>
          
          {/* Add div wrapper to contain like button interactions */}
          <div onClick={(e) => e.stopPropagation()}>
            <LikeButton
              postId={post.id}
              likes={post.likes}
              likedBy={post.likedBy}
              authorId = {post.authorId}
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground line-clamp-3">{excerpt}</p>
        {post.tags && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag.trim()}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}