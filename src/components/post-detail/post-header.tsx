import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Share2, Bookmark, Edit } from 'lucide-react'
import { LikeButton } from '@/components/like-button'
import { cn } from '@/utils/utils'
import { Post } from '@/utils/types/interfaces'


interface PostHeaderProps {
  post: Post
  currentUser: any
  isSaved: boolean
  isSaving: boolean
  isUnsaving: boolean
  isCheckingSaved: boolean
  onSave: () => void
  onShare: () => void
}

export const PostHeader: React.FC<PostHeaderProps> = ({
  post,
  currentUser,
  isSaved,
  isSaving,
  isUnsaving,
  isCheckingSaved,
  onSave,
  onShare,
}) => {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-between glass p-4 rounded-lg border-gradient">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => navigate("/")}
        className="hover:scale-105 transition-transform duration-200"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <div className="flex gap-2">
        <LikeButton
          postId={post.id}
          likes={post.likes}
          likedBy={post.likedBy || []}
          authorId={post.authorId}
          postTitle={post.title}
          showCount={true}
          className="btn-animate"
        />
        <Button
          variant={isSaved ? "default" : "outline"}
          size="sm"
          onClick={onSave}
          disabled={isSaving || isUnsaving || isCheckingSaved}
          className="btn-animate"
        >
          <Bookmark className={cn("h-4 w-4 mr-2 transition-all", isSaved && "fill-current scale-110")} />
          {isSaving || isUnsaving ? "..." : "Save"}
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onShare}
          className="hover:scale-105 transition-transform duration-200"
        >
          <Share2 className="h-4 w-4" />
        </Button>
        {currentUser?.uid === post.authorId && (
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate(`/edit-post/${post.id}`)}
            className="hover:scale-105 transition-transform duration-200"
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
