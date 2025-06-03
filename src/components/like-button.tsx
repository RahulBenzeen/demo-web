"use client"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useToggleLikeMutation } from "@//store/postApi"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/utils/utils"
import { sendNotificationToUser } from "@/lib/notifications"

interface LikeButtonProps {
  postId: string
  likes: number
  likedBy: string[]
  authorId: string
  postTitle?: string  // Add post title for notification context
  showCount?: boolean
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function LikeButton({
  postId,
  likes,
  likedBy = [],
  authorId,
  postTitle = "",  // Default empty string
  showCount = false,
  variant = "outline",
  size = "sm",
  className,
}: LikeButtonProps) {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [toggleLike, { isLoading }] = useToggleLikeMutation()

  // Check if current user has liked this post
  const isLiked = currentUser ? likedBy.includes(currentUser.uid) : false

  const handleLike = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like posts",
        variant: "destructive",
      })
      return
    }

    try {
      const wasLiked = isLiked; // Capture current state before toggling
      
      await toggleLike({
        postId,
        userId: currentUser.uid,
      }).unwrap();

      // Only send notification if:
      // 1. It's a new like (wasn't liked before)
      // 2. Author is not the current user
      if (!wasLiked && authorId !== currentUser.uid) {
        await sendNotificationToUser(
          authorId,
          "New like on your post",
          `${currentUser.displayName} liked your post: ${postTitle || "Untitled"}`
        );
      }
    } catch (error: unknown) {
     
      toast({
        title: "Error",
        description:
          error && typeof error === "object" && "message" in error
            ? (error as { message?: string }).message
            : "Failed to like post. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Button
      variant={isLiked ? "default" : variant}
      size={size}
      onClick={handleLike}
      disabled={isLoading}
      className={cn(className)}
    >
      <Heart className={cn("h-4 w-4", showCount && "mr-2", isLiked && "fill-current")} />
      {showCount && (isLoading ? "..." : likes)}
    </Button>
  )
}