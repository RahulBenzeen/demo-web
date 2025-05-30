"use client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Post } from "@/store/postApi"
import { Calendar, MessageSquare, Eye, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useMemo } from "react"
import { LikeButton } from "./like-button"

interface PostListItemProps {
  post: Post
  className?: string
  onClick?: () => void
}

export function PostListItem({ post, className, onClick }: PostListItemProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false)

  // Extract plain text from HTML content
  const excerpt = useMemo(() => {
    if (!post?.body) return "";
    
    // Create a temporary element to parse HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = post.body;
    
    // Get text content and clean up
    let plainText = tempDiv.textContent || tempDiv.innerText || "";
    
    // Remove extra whitespace and newlines
    plainText = plainText
      .replace(/\s+/g, " ")
      .replace(/\n/g, " ")
      .trim();
    
    // Truncate and add ellipsis if needed
    return plainText.length > 150 
      ? plainText.substring(0, 150) + "..." 
      : plainText;
  }, [post?.body]);

  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-md h-full", className)} onClick={onClick}>
      <div className="flex flex-col md:flex-row gap-4 p-4 h-full">
        {post.coverImage && (
          <div className="relative aspect-video md:aspect-square md:w-48 flex-shrink-0 overflow-hidden rounded-md">
            {!isImageLoaded && <div className="absolute inset-0 bg-muted animate-pulse" />}
            <img
              src={post.coverImage || "/placeholder.svg"}
              alt={post.title}
              className={cn("h-full w-full object-cover", !isImageLoaded && "opacity-0")}
              loading="lazy"
              onLoad={() => setIsImageLoaded(true)}
            />
          </div>
        )}
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold line-clamp-1">{post.title}</h3>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "N/A"}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {post.views || 0}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {post.comments?.length || 0}
                </span>
              </div>
            </div>
            <LikeButton 
              postId={post.id}
              likes={post.likes || 0}
              likedBy={post.likedBy || []}
              author={post.authorId}
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
            />
          </div>

          <p className="text-muted-foreground line-clamp-2 mt-2 flex-grow">{excerpt}</p>

          {post.tags && (
            <div className="mt-3 flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag.trim()}
                </Badge>
              ))}
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <Button variant="ghost" size="sm" className="gap-1">
              Read More <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}