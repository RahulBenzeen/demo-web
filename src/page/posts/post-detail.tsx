"use client"
import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import {
  useGetPostByIdQuery,
  useAddCommentMutation,
  useDeleteCommentMutation,
  useGetCommentsByPostIdQuery,
  useUpdateCommentMutation,
  useToggleCommentLikeMutation,
  useToggleReplyLikeMutation,
  useSavePostMutation,
  useUnsavePostMutation,
  useCheckSavedPostQuery,
} from "@/store/postApi"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { PostHeader } from "@/components/post-detail/post-header"
import { PostContent } from "@/components/post-detail/post-content"
import { CommentForm } from "@/components/post-detail/comment-form"
import { CommentsList } from "@/components/post-detail/comment-list"
import { sendNotificationToUser } from "@/lib/notifications"

export default function PostDetail() {
  const { id } = useParams<{ id: string }>()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [comment, setComment] = useState("")

  const { data: post, isLoading: isPostLoading, isError: isPostError } = useGetPostByIdQuery(id || "", { skip: !id })

  const {
    data: comments = [],
    isLoading: isCommentsLoading,
    refetch: refetchComments,
  } = useGetCommentsByPostIdQuery(id || "", { skip: !id })

  const { data: savedStatus, isLoading: isCheckingSaved } = useCheckSavedPostQuery(
    { userId: currentUser?.uid || "", postId: id || "" },
    { skip: !currentUser?.uid || !id },
  )

  const isSaved = savedStatus?.isSaved || false

  const [toggleCommentLike] = useToggleCommentLikeMutation()
  const [addComment, { isLoading: isAddingComment }] = useAddCommentMutation()
  const [updateComment, { isLoading: isEditingComment }] = useUpdateCommentMutation()
  const [deleteComment, { isLoading: isDeletingComment }] = useDeleteCommentMutation()
  const [toggleReplyLike] = useToggleReplyLikeMutation()
  const [savePost, { isLoading: isSaving }] = useSavePostMutation()
  const [unsavePost, { isLoading: isUnsaving }] = useUnsavePostMutation()

  const handleEditComment = async (commentId: string, newText: string) => {
    if (!id || !commentId) {
      toast({
        title: "Error",
        description: "Missing required information",
        variant: "destructive",
      })
      return
    }

    try {
      await updateComment({
        postId: id,
        commentId,
        text: newText,
      }).unwrap()

      refetchComments()

      toast({
        title: "Comment updated",
        description: "Your comment has been updated successfully",
      })
    } catch (error: any) {
      console.error("Failed to update comment:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to update comment",
        variant: "destructive",
      })
    }
  }

  const handleCommentLike = async (commentId: string) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like comments",
        variant: "destructive",
      })
      return
    }

    try {
      await toggleCommentLike({
        postId: id || "",
        commentId,
        userId: currentUser.uid,
      }).unwrap()
      // Optionally, notify the comment author if not the current user
      const commentObj = comments.find((c: any) => c.id === commentId)
      if (commentObj && commentObj.userId !== currentUser.uid) {
        console.log("sending notifications !")
        sendNotificationToUser(
          commentObj.userId,
          "New like on your comment",
          `${currentUser.displayName || "Someone"} liked your comment: "${commentObj.text?.slice(0, 50) || ""}"`
        )
      }
    } catch (error: any) {
      console.error("Failed to toggle like:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to like comment",
        variant: "destructive",
      })
    }
  }

  const handleReplyLike = async (commentId: string, replyId: string) => {
    if (!currentUser?.uid) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like replies",
        variant: "destructive",
      })
      return
    }

    try {
      await toggleReplyLike({
        postId: id || "",
        commentId,
        replyId,
        userId: currentUser.uid,
      }).unwrap();

      // Find the comment and reply objects
      const commentObj = comments.find((c: any) => c.id === commentId)
      const replyObj = commentObj?.replies?.find((r: any) => r.id === replyId)
      if (replyObj && replyObj.userId !== currentUser.uid) {
        sendNotificationToUser(
          replyObj.userId,
          "New like on your reply",
          `${currentUser.displayName || "Someone"} liked your reply: "${replyObj.text?.slice(0, 50) || ""}"`
        )
      }
    } catch (error: any) {
      console.error("Failed to toggle reply like:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to like reply",
        variant: "destructive",
      })
    }
  }

  const handleSave = async () => {
    if (!currentUser || !id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to bookmark posts",
        variant: "destructive",
      })
      return
    }

    try {
      if (isSaved) {
        await unsavePost({
          userId: currentUser.uid,
          postId: id,
        }).unwrap()
      } else {
        await savePost({
          userId: currentUser.uid,
          postId: id,
        }).unwrap()
      }

      toast({
        title: isSaved ? "Post removed from bookmarks" : "Post bookmarked",
        description: isSaved
          ? "This post has been removed from your bookmarks"
          : "This post has been added to your bookmarks",
      })
    } catch (error: any) {
      console.error("Save/unsave failed:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to update bookmark",
        variant: "destructive",
      })
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!comment.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment",
        variant: "destructive",
      })
      return
    }

    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to comment",
        variant: "destructive",
      })
      return
    }

    if (!id) {
      toast({
        title: "Error",
        description: "Post ID is missing",
        variant: "destructive",
      })
      return
    }

    try {
      await addComment({
        postId: id,
        text: comment.trim(),
        userId: currentUser.uid,
        userName: currentUser.displayName || "Anonymous",
        userImage: currentUser.photoURL || "",
      }).unwrap()

      setComment("")
      refetchComments()

      toast({
        title: "Comment added",
        description: "Your comment has been added successfully",
      })
    } catch (error: any) {
      console.error("Failed to add comment:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to add comment",
        variant: "destructive",
      })
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!id || !commentId) {
      toast({
        title: "Invalid operation",
        description: "Missing post or comment ID",
        variant: "destructive",
      })
      return
    }

    try {
      await deleteComment({ postId: id, commentId }).unwrap()
      refetchComments()

      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted successfully",
      })
    } catch (error: any) {
      console.error("Delete comment failed:", error)
      toast({
        title: "Error deleting comment",
        description: error?.message || "Something went wrong",
        variant: "destructive",
      })
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share && post) {
        await navigator.share({
          title: post.title,
          text: post.excerpt || post.title,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: "Link copied",
          description: "Post link copied to clipboard",
        })
      }
    } catch (error) {
      console.error("Sharing failed:", error)
    }
  }

  if (isPostLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="space-y-8 max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-12 w-full" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-80 w-full rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (isPostError || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <Card className="glass max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4 text-gradient">Post Not Found</h1>
            <p className="text-muted-foreground mb-8">
              {isPostError ? "Error loading post. Please try again later." : "The post doesn't exist or has been removed"}
            </p>
            <Button onClick={() => navigate("/")} className="btn-animate">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Posts
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <div className="space-y-8 max-w-4xl mx-auto px-4 py-8">
        <PostHeader
          post={post}
          currentUser={currentUser}
          isSaved={isSaved}
          isSaving={isSaving}
          isUnsaving={isUnsaving}
          isCheckingSaved={isCheckingSaved}
          onSave={handleSave}
          onShare={handleShare}
        />

        <PostContent
          post={post}
          currentUser={currentUser}
          commentsCount={comments.length}
        />

        <Separator className="my-8" />

        <CommentForm
          currentUser={currentUser}
          comment={comment}
          setComment={setComment}
          onSubmit={handleCommentSubmit}
          isAddingComment={isAddingComment}
        />

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gradient">
            Comments ({comments.length})
          </h2>
          
          <CommentsList
            comments={comments}
            isLoading={isCommentsLoading}
            postId={id || ""}
            currentUser={currentUser}
            onReplyLike={handleReplyLike}
            onCommentLike={handleCommentLike}
            onDeleteComment={handleDeleteComment}
            onEditComment={handleEditComment}
            isDeletingComment={isDeletingComment}
            isEditingComment={isEditingComment}
          />
        </div>
      </div>
    </div>
  )
}
