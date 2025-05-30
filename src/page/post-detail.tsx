"use client"
import type React from "react"
import { useState, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowLeft,
  Calendar,
  Eye,
  MessageSquare,
  Share2,
  Bookmark,
  Edit,
  Send,
  MoreHorizontal,
  ThumbsUp,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  useGetPostByIdQuery,
  useAddCommentMutation,
  useDeleteCommentMutation,
  useGetCommentsByPostIdQuery,
  useUpdateCommentMutation,
  useToggleCommentLikeMutation,
  useAddReplyMutation,
  useToggleReplyLikeMutation,
  useSavePostMutation,
  useUnsavePostMutation,
  useCheckSavedPostQuery,
} from "../store/postApi"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "../contexts/AuthContext"
import { cn } from "../lib/utils"
import { LikeButton } from "../components/like-button"

interface CommentItemProps {
  comment: any
  postId: string
  currentUser: any
  handleReplyLike: (commentId: string, replyId: string) => void
  handleDeleteComment: (commentId: string) => void
  handleCommentLike: (commentId: string) => void
  handleEditComment: (commentId: string, newText: string) => void
  isDeletingComment: boolean
  isEditingComment: boolean
}

const CommentItem = ({
  comment,
  postId,
  currentUser,
  handleReplyLike,
  handleDeleteComment,
  handleCommentLike,
  handleEditComment,
  isDeletingComment,
  isEditingComment,
}: CommentItemProps) => {
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(comment.text)
  const [addReply, { isLoading: isAddingReply }] = useAddReplyMutation()
  const { toast } = useToast()

  const handleSubmitReply = async () => {
    if (!replyText.trim() || !currentUser) return

    try {
      await addReply({
        postId,
        commentId: comment.id,
        userId: currentUser.uid,
        userName: currentUser.displayName || "Anonymous",
        userImage: currentUser.photoURL || undefined,
        text: replyText,
      }).unwrap()

      setReplyText("")
      setShowReplyInput(false)
      setShowReplies(true)

      toast({
        title: "Reply posted",
        description: "Your reply has been posted successfully",
      })
    } catch (error) {
      console.error("Failed to post reply:", error)
      toast({
        title: "Error",
        description: "Failed to post reply. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSaveEdit = () => {
    if (!editText.trim()) {
      toast({
        title: "Error",
        description: "Comment cannot be empty",
        variant: "destructive",
      })
      return
    }

    handleEditComment(comment.id, editText.trim())
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditText(comment.text)
    setIsEditing(false)
  }

  return (
    <Card key={comment.id}>
      <CardContent className="p-4">
        <div className="flex justify-between">
          <div className="flex items-start gap-4 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarImage src={comment.userImage || "/placeholder.svg"} />
              <AvatarFallback>{comment.userName?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">
                  {comment.userId === currentUser?.uid ? `${comment.userName} (You)` : comment.userName}
                </h4>
                <span className="text-xs text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                {comment.isEdited && <span className="text-xs text-muted-foreground italic">(edited)</span>}
              </div>

              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="min-h-[80px]"
                    maxLength={1000}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveEdit} disabled={isEditingComment || !editText.trim()}>
                      {isEditingComment ? "Saving..." : "Save"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCancelEdit} disabled={isEditingComment}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{comment.text}</p>
              )}

              {!isEditing && (
                <div className="flex items-center gap-4 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => handleCommentLike(comment.id)}
                    disabled={!currentUser}
                  >
                    <ThumbsUp
                      className={cn(
                        "h-4 w-4 mr-1",
                        (comment.likedBy ?? []).includes(currentUser?.uid ?? "") && "fill-primary text-primary",
                      )}
                    />
                    {comment.likes || 0}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => setShowReplyInput(!showReplyInput)}
                    disabled={!currentUser}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Reply
                  </Button>

                  {comment.replies?.length > 0 && (
                    <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => setShowReplies(!showReplies)}>
                      {showReplies
                        ? "Hide replies"
                        : `View ${comment.replies.length} ${comment.replies.length === 1 ? "reply" : "replies"}`}
                    </Button>
                  )}
                </div>
              )}

              {showReplyInput && !isEditing && (
                <div className="mt-4 pl-6">
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your reply..."
                    className="mb-2"
                    maxLength={500}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSubmitReply} disabled={!replyText.trim() || isAddingReply}>
                      {isAddingReply ? "Posting..." : "Post Reply"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowReplyInput(false)
                        setReplyText("")
                      }}
                      disabled={isAddingReply}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {showReplies && comment.replies?.length > 0 && (
                <div className="mt-4 ml-6 space-y-4 border-l-2 pl-4">
                  {comment.replies.map((reply: any) => (
                    <div key={reply.id} className="space-y-2">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={reply.userImage || "/placeholder.svg"} />
                          <AvatarFallback>{reply.userName?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium">
                              {reply.userId === currentUser?.uid ? `${reply.userName} (You)` : reply.userName}
                            </h4>
                            <span className="text-xs text-muted-foreground">
                              {new Date(reply.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{reply.text}</p>
                          <div className="flex items-center gap-4 pt-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2"
                              onClick={() => handleReplyLike(comment.id, reply.id)}
                              disabled={!currentUser}
                            >
                              <ThumbsUp
                                className={cn(
                                  "h-4 w-4 mr-1",
                                  (reply.likedBy || []).includes(currentUser?.uid ?? "") && "fill-primary text-primary",
                                )}
                              />
                              {reply.likes || 0}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {comment.userId === currentUser?.uid && !isEditing && (
            <div className="flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>Edit</DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => handleDeleteComment(comment.id)}
                    disabled={isDeletingComment}
                  >
                    {isDeletingComment ? "Deleting..." : "Delete"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

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

  // Check if post is saved
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
      }).unwrap();

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
      }).unwrap()
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

  // Render HTML content safely
  const renderBodyContent = useMemo(() => {
    if (!post?.body) return null;

    // Check if the body contains HTML tags
    const hasHtmlTags = /<[a-z][\s\S]*>/i.test(post.body);

    if (hasHtmlTags) {
      return (
        <div
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />
      );
    } else {
      return (
        <div className="whitespace-pre-wrap">
          {post.body}
        </div>
      );
    }
  }, [post?.body]);

  // Loading and error states remain the same...
  if (isPostLoading) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (isPostError || !post) {
    return (
      <div className="flex flex-col items-center justify-center py-20 max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
        <p className="text-muted-foreground mb-8">
          {isPostError ? "Error loading post. Please try again later." : "The post doesn't exist or has been removed"}
        </p>
        <Button onClick={() => navigate("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Posts
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex gap-2">
          <LikeButton
            postId={post.id}
            likes={post.likes}
            likedBy={post.likedBy || []}
            authorId={post.authorId}
            postTitle={post.title}
            showCount={true} />
          <Button
            variant={isSaved ? "default" : "outline"}
            size="sm"
            onClick={handleSave}
            disabled={isSaving || isUnsaving || isCheckingSaved}
          >
            <Bookmark className={cn("h-4 w-4 mr-2", isSaved && "fill-current")} />
            {isSaving || isUnsaving ? "..." : "Save"}
          </Button>
          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
          {currentUser?.uid === post.authorId && (
            <Button variant="outline" size="icon" onClick={() => navigate(`/edit-post/${post.id}`)}>
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{post.category}</Badge>
        </div>

        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{post.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.authorImage || "/placeholder.svg"} />
              <AvatarFallback>{post.authorName?.charAt(0) || "A"}</AvatarFallback>
            </Avatar>
            <div>
              <span className="font-medium text-foreground">
                {post.authorId === currentUser?.uid ? `${post.authorName} (You)` : post.authorName}
              </span>
            </div>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{post.views} views</span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{comments.length} comments</span>
          </div>
        </div>

        {post.coverImage && (
          <div className="aspect-video w-full overflow-hidden rounded-lg">
            <img
              src={post.coverImage || "/placeholder.svg"}
              alt={post.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        <Card>
          <CardContent className="p-6">
            {renderBodyContent}
          </CardContent>
        </Card>

        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag: string) => (
              <Badge key={tag} variant="outline">
                {tag.trim()}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {currentUser ? (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Leave a comment</h2>
          <form onSubmit={handleCommentSubmit} className="space-y-4">
            <Textarea
              placeholder="Write your comment here..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px]"
              maxLength={1000}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isAddingComment || !comment.trim()}>
                {isAddingComment ? (
                  "Posting..."
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Post Comment
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Sign in to comment</p>
          <Button onClick={() => navigate("/sign-in")}>Sign In</Button>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Comments ({comments.length})</h2>
        {isCommentsLoading ? (
          <div className="space-y-4">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : comments.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground py-8">No comments yet. Be the first!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {comments.map((comment: any) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                postId={id || ""}
                currentUser={currentUser}
                handleReplyLike={handleReplyLike}
                handleCommentLike={handleCommentLike}
                handleDeleteComment={handleDeleteComment}
                handleEditComment={handleEditComment}
                isDeletingComment={isDeletingComment}
                isEditingComment={isEditingComment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}