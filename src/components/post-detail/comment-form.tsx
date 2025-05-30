import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Send } from 'lucide-react'

interface CommentFormProps {
  currentUser: any
  comment: string
  setComment: (comment: string) => void
  onSubmit: (e: React.FormEvent) => void
  isAddingComment: boolean
}

export const CommentForm: React.FC<CommentFormProps> = ({
  currentUser,
  comment,
  setComment,
  onSubmit,
  isAddingComment,
}) => {
  const navigate = useNavigate()

  if (!currentUser) {
    return (
      <Card className="glass border-gradient">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Sign in to comment</p>
          <Button onClick={() => navigate("/sign-in")} className="btn-animate">
            Sign In
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass border-gradient">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4 text-gradient">Leave a comment</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <Textarea
            placeholder="Write your comment here..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[120px] glass"
            maxLength={1000}
          />
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isAddingComment || !comment.trim()}
              className="btn-animate"
            >
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
      </CardContent>
    </Card>
  )
}
