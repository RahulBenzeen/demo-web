"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, TrendingUp, MessageSquare } from "lucide-react"

interface TopPostsProps {
  topPostsByViews: any[]
  topPostsByLikes: any[]
  topPostsByComments: any[]
  categories: any[]
  onViewPost: (postId: string) => void
}

export function TopPosts({
  topPostsByViews,
  topPostsByLikes,
  topPostsByComments,
  categories,
  onViewPost,
}: TopPostsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performing Posts</CardTitle>
        <CardDescription>Your most successful content</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="views" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="views">Most Viewed</TabsTrigger>
            <TabsTrigger value="likes">Most Liked</TabsTrigger>
            <TabsTrigger value="comments">Most Discussed</TabsTrigger>
          </TabsList>

          <TabsContent value="views" className="space-y-4">
            {topPostsByViews.map((post, index) => (
              <div key={post.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{post.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {categories.find((c) => c.name === post.category)?.name || "Uncategorized"}
                  </p>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {post.views || 0}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => onViewPost(post.id)}>
                    View
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="likes" className="space-y-4">
            {topPostsByLikes.map((post, index) => (
              <div key={post.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{post.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {categories.find((c) => c.id === post.category)?.name || "Uncategorized"}
                  </p>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {post.likes || 0}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => onViewPost(post.id)}>
                    View
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            {topPostsByComments.map((post, index) => (
              <div key={post.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{post.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {categories.find((c) => c.id === post.category)?.name || "Uncategorized"}
                  </p>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    {post.comments?.length || 0}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => onViewPost(post.id)}>
                    View
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
