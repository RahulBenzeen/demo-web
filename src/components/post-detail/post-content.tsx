import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Calendar, Eye, MessageSquare } from 'lucide-react'
import type { Post } from '@/store/postApi'

interface PostContentProps {
  post: Post
  currentUser: any
  commentsCount: number
}

export const PostContent: React.FC<PostContentProps> = ({
  post,
  currentUser,
  commentsCount,
}) => {
  const renderBodyContent = useMemo(() => {
    if (!post?.body) return null

    const hasHtmlTags = /<[a-z][\s\S]*>/i.test(post.body)

    if (hasHtmlTags) {
      return (
        <div
          className="prose dark:prose-invert max-w-none prose-headings:text-gradient prose-links:text-primary hover:prose-links:text-primary/80"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />
      )
    } else {
      return (
        <div className="whitespace-pre-wrap leading-relaxed text-foreground/90">
          {post.body}
        </div>
      )
    }
  }, [post?.body])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="px-3 py-1 bg-gradient-primary text-primary-foreground">
          {post.category}
        </Badge>
      </div>

      <h1 className="text-4xl font-bold tracking-tight md:text-5xl text-gradient float">
        {post.title}
      </h1>

      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-3">
          <Link to={`/user/${post.authorId}`}>
            <Avatar className="h-10 w-10 ring-2 ring-primary/20">
              <AvatarImage src={post.authorImage || "/placeholder.svg"} />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                {post.authorName?.charAt(0) || "A"}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <span className="font-medium text-foreground text-gradient" title={post.authorId === currentUser?.uid ? `${post.authorName} (You)` : post.authorName}>
              {post.authorId === currentUser?.uid ? `${post.authorName} (You)` : post.authorName}
            </span>
          </div>
        </div>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-full">
          <Calendar className="h-4 w-4" />
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-full">
          <Eye className="h-4 w-4" />
          <span>{post.views} views</span>
        </div>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-full">
          <MessageSquare className="h-4 w-4" />
          <span>{commentsCount} comments</span>
        </div>
      </div>

      {post.coverImage && (
        <div className="aspect-video w-full overflow-hidden rounded-xl shadow-large">
          <img
            src={post.coverImage || "/placeholder.svg"}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
        </div>
      )}

      <Card className="glass border-gradient">
        <CardContent className="p-8">
          {renderBodyContent}
        </CardContent>
      </Card>

      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag: string) => (
            <Badge
              key={tag}
              variant="outline"
              className="px-3 py-1 hover:bg-accent/50 transition-colors duration-200 cursor-pointer"
            >
              #{tag.trim()}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
