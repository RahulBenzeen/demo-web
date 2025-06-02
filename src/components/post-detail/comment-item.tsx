import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ThumbsUp, MessageSquare, MoreHorizontal } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useAddReplyMutation } from '@/store/postApi'
import { cn } from '@/utils/utils'
import type { Comment } from '@/store/postApi'
import { Link } from 'react-router-dom'
import { Reply } from '@/store/postApi'

interface CommentItemProps {
  comment: Comment
  postId: string
  currentUser: any
  handleReplyLike: (commentId: string, replyId: string) => void
  handleDeleteComment: (commentId: string) => void
  handleCommentLike: (commentId: string) => void
  handleEditComment: (commentId: string, newText: string) => void
  isDeletingComment: boolean
  isEditingComment: boolean
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  postId,
  currentUser,
  handleReplyLike,
  handleDeleteComment,
  handleCommentLike,
  handleEditComment,
  isDeletingComment,
  isEditingComment,
}) => {
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
    <Card className="glass border-gradient transition-all duration-300 hover:shadow-medium">
      <CardContent className="p-6">
        <div className="flex justify-between">
          <div className="flex items-start gap-4 flex-1">
            <Link to={`/user/${comment.userId}`} className='hover:cursor-pointer'>
              <Avatar className="h-12 w-12 ring-2 ring-primary/20">

                <AvatarImage src={comment.userImage || "/placeholder.svg"} />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                  {comment.userName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <h4 className="font-semibold text-gradient">
                  {comment.userId === currentUser?.uid ? `${comment.userName} (You)` : comment.userName}
                </h4>
                <span className="text-xs text-muted-foreground px-2 py-1 bg-muted/50 rounded-full">
                  {new Date(comment.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                {comment.isEdited && (
                  <Badge variant="outline" className="text-xs px-2 py-0">
                    edited
                  </Badge>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <Textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="min-h-[100px] glass"
                    maxLength={1000}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      disabled={isEditingComment || !editText.trim()}
                      className="btn-animate"
                    >
                      {isEditingComment ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      disabled={isEditingComment}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{comment.text}</p>
              )}

              {!isEditing && (
                <div className="flex items-center gap-4 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 hover:bg-primary/10 transition-colors duration-200"
                    onClick={() => handleCommentLike(comment.id)}
                    disabled={!currentUser}
                  >
                    <ThumbsUp
                      className={cn(
                        "h-4 w-4 mr-2 transition-all duration-200",
                        (comment.likedBy ?? []).includes(currentUser?.uid ?? "") && "fill-primary text-primary scale-110",
                      )}
                    />
                    {comment.likes || 0}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 hover:bg-accent/50 transition-colors duration-200"
                    onClick={() => setShowReplyInput(!showReplyInput)}
                    disabled={!currentUser}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Reply
                  </Button>

                  {(comment.replies ?? []).length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 text-primary hover:bg-primary/10"
                      onClick={() => setShowReplies(!showReplies)}
                    >
                      {showReplies
                        ? "Hide replies"
                        : `View ${(comment.replies ?? []).length} ${(comment.replies ?? []).length === 1 ? "reply" : "replies"}`}
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

              {showReplies && (comment.replies?.length ?? 0) > 0 && (
                <div className="mt-4 ml-6 space-y-4 border-l-2 pl-4">
                  {comment.replies?.map((reply: Reply) => (
                    <div key={reply.id} className="space-y-2">
                      <div className="flex items-start gap-3">
                        <Link to={`/user/${reply.userId}`}>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={reply.userImage || "/placeholder.svg"} />
                          <AvatarFallback>{reply.userName?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        </Link>
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
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent/50">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass">
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
