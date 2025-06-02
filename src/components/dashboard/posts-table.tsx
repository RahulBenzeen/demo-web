"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Filter, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"

interface PostsTableProps {
  posts: any[]
  categories: any[]
  isLoading: boolean
  isDeleting: boolean
  onViewPost: (postId: string) => void
  onEditPost: (postId: string) => void
  onDeletePost: (postId: string, postTitle: string) => void
}

export function PostsTable({
  posts,
  categories,
  isLoading,
  isDeleting,
  onViewPost,
  onEditPost,
  onDeletePost,
}: PostsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"date" | "views" | "likes" | "comments">("date")
  const [sortOrder] = useState<"asc" | "desc">("desc")

  // Filtered and sorted posts
  const filteredPosts = (() => {
    let filtered = [...posts] // Create a copy of the array first

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (post.tags || []).some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((post) => post.category === categoryFilter)
    }

    // Sort - now we can safely sort the copied array
    filtered.sort((a, b) => {
      let aValue: number | string
      let bValue: number | string

      switch (sortBy) {
        case "views":
          aValue = a.views || 0
          bValue = b.views || 0
          break
        case "likes":
          aValue = a.likes || 0
          bValue = b.likes || 0
          break
        case "comments":
          aValue = a.comments?.length || 0
          bValue = b.comments?.length || 0
          break
        default:
          // Safe date handling for sorting
          try {
            aValue = isDate(a.createdAt)
              ? a.createdAt.getTime()
              : typeof a.createdAt === "string"
                ? parseISO(a.createdAt).getTime()
                : 0
          } catch {
            aValue = 0
          }

          try {
            bValue = isDate(b.createdAt)
              ? b.createdAt.getTime()
              : typeof b.createdAt === "string"
                ? parseISO(b.createdAt).getTime()
                : 0
          } catch {
            bValue = 0
          }
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  })()

  function isDate(value: unknown): value is Date {
    return value instanceof Date && !isNaN(value.getTime())
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Posts Management</CardTitle>
            <CardDescription>Manage all your blog content</CardDescription>
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Category
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setCategoryFilter("all")}>All Categories</DropdownMenuItem>
                {categories.map((category) => (
                  <DropdownMenuItem key={category.id} onClick={() => setCategoryFilter(category.name)}>
                    {category.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Sort by {sortBy}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy("date")}>Date</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("views")}>Views</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("likes")}>Likes</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("comments")}>Comments</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-center">Views</TableHead>
              <TableHead className="text-center">Engagement</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12 mx-auto" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Skeleton className="h-4 w-32 mx-auto" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredPosts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No posts found matching your criteria
                </TableCell>
              </TableRow>
            ) : (
              filteredPosts.map((post) => {
                const engagement = post.views
                  ? Math.round((((post.likes || 0) + (post.comments?.length || 0)) / post.views) * 100)
                  : 0

                return (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium max-w-[200px]">
                      <div className="truncate" title={post.title}>
                        {post.title}
                      </div>
                    </TableCell>
                    <TableCell>{post.authorName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {categories.find((c) => c.name === post?.category)?.name || "Uncategorized"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        try {
                          const date = post.createdAt
                            ? post.createdAt
                            : typeof post.createdAt === "string"
                              ? parseISO(post.createdAt)
                              : new Date()
                          return format(date, "MMM dd, yyyy")
                        } catch {
                          return "Invalid date"
                        }
                      })()}
                    </TableCell>
                    <TableCell className="text-center">{post.views || 0}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm">{engagement}%</span>
                        <Progress value={Math.min(engagement, 100)} className="w-16" />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewPost(post.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditPost(post.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => onDeletePost(post.id, post.title)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {isDeleting ? "Deleting..." : "Delete"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
