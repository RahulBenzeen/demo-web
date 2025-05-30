import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CommentItem } from './comment-item'
import type { Comment } from '@/store/postApi'

interface CommentsListProps {
  comments: Comment[]
  isLoading: boolean
  postId: string
  currentUser: any
  onReplyLike: (commentId: string, replyId: string) => void
  onCommentLike: (commentId: string) => void
  onDeleteComment: (commentId: string) => void
  onEditComment: (commentId: string, newText: string) => void
  isDeletingComment: boolean
  isEditingComment: boolean
}

export const CommentsList: React.FC<CommentsListProps> = ({
  comments,
  isLoading,
  postId,
  currentUser,
  onReplyLike,
  onCommentLike,
  onDeleteComment,
  onEditComment,
  isDeletingComment,
  isEditingComment,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="glass">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <Card className="glass border-gradient">
        <CardContent className="p-8">
          <p className="text-center text-muted-foreground py-8">
            No comments yet. Be the first to share your thoughts!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment: Comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          postId={postId}
          currentUser={currentUser}
          handleReplyLike={onReplyLike}
          handleCommentLike={onCommentLike}
          handleDeleteComment={onDeleteComment}
          handleEditComment={onEditComment}
          isDeletingComment={isDeletingComment}
          isEditingComment={isEditingComment}
        />
      ))}
    </div>
  )
}
