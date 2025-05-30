"use client"

import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { LineChart } from "@/components/line-chart"
import { PieChart } from "@/components/pie-chart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Activity,
  TrendingUp,
  Tag,
  MessageSquare,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  RefreshCw,
  AlertTriangle,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { useGetPostsQuery, useGetCategoriesQuery, useDeletePostMutation, useGetCommentsByPostIdQuery } from "@/store/postApi"
import { format, parseISO, subDays, isAfter } from "date-fns"
import { useAuth } from "@/contexts/AuthContext"

interface DashboardStats {
  totalPosts: number
  totalViews: number
  totalLikes: number
  totalComments: number
  avgEngagement: number
  postsThisMonth: number
  viewsThisMonth: number
  topCategory: string
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { userProfile } = useAuth();
  const { toast } = useToast()

  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d")
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"date" | "views" | "likes" | "comments">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
   
  // Fetch data using existing API hooks
  const {
    data: postsData,
    isLoading: postsLoading,
    refetch: refetchPosts,
  } = useGetPostsQuery({
    limit: 1000,
  })

  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery()
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();
  const{data} = useGetCommentsByPostIdQuery()

  const posts = postsData?.posts || []
  const categories = categoriesData || []

  // Check if user is admin (you might want to implement proper role checking)
  const isAdmin = userProfile?.role === "admin" // Replace with your admin logic

  // Memoized calculations for better performance
  const stats = useMemo((): DashboardStats => {
    if (posts.length === 0) {
      return {
        totalPosts: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        avgEngagement: 0,
        postsThisMonth: 0,
        viewsThisMonth: 0,
        topCategory: "None",
      }
    }

    const totalPosts = posts.length
    const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0)
    const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0)
    const totalComments = posts.reduce((sum, post) => sum + (post.comments?.length || 0), 0)

    const avgEngagement = totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0

    // This month's stats - safer date parsing
    const thisMonth = new Date()
    thisMonth.setDate(1)

    const postsThisMonth = posts.filter((post) => {
      try {
        // Handle different date formats safely
        let postDate: Date
        if (post.createdAt instanceof Date) {
          postDate = post.createdAt
        } else if (typeof post.createdAt === "string") {
          postDate = parseISO(post.createdAt)
        } else {
          return false // Skip invalid dates
        }
        return isAfter(postDate, thisMonth)
      } catch (error) {
        console.warn("Invalid date format for post:", post.id, post.createdAt)
        return false
      }
    }).length

    const viewsThisMonth = posts
      .filter((post) => {
        try {
          let postDate: Date
          if (post.createdAt instanceof Date) {
            postDate = post.createdAt
          } else if (typeof post.createdAt === "string") {
            postDate = parseISO(post.createdAt)
          } else {
            return false
          }
          return isAfter(postDate, thisMonth)
        } catch (error) {
          return false
        }
      })
      .reduce((sum, post) => sum + (post.views || 0), 0)

    // Top category
    const categoryCount = new Map<string, number>()
    posts.forEach((post) => {
      const categoryObj = categories.find((c) => c.name === post.category)
      const categoryName = categoryObj ? categoryObj.name : "Uncategorized"
      categoryCount.set(categoryName, (categoryCount.get(categoryName) || 0) + 1)
    })

    const topCategory = Array.from(categoryCount.entries()).sort(([, a], [, b]) => b - a)[0]?.[0] || "None"

    return {
      totalPosts,
      totalViews,
      totalLikes,
      totalComments,
      avgEngagement,
      postsThisMonth,
      viewsThisMonth,
      topCategory,
    }
  }, [posts, categories])

  // Filtered and sorted posts
  const filteredPosts = useMemo(() => {
    let filtered = [...posts] // Create a copy of the array first

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (post.tags || []).some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
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
            aValue =
              a.createdAt instanceof Date
                ? a.createdAt.getTime()
                : typeof a.createdAt === "string"
                  ? parseISO(a.createdAt).getTime()
                  : 0
          } catch {
            aValue = 0
          }

          try {
            bValue =
              b.createdAt instanceof Date
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
  }, [posts, searchTerm, categoryFilter, sortBy, sortOrder])

  // Chart data
  const getCategoryData = () => {
    const categoryMap = new Map<string, number>()

    categories.forEach((category) => {
      categoryMap.set(category.name, 0)
    })

    posts.forEach((post) => {
      const categoryName = categories.find((c) => c.name === post.category)?.name || "Uncategorized"
      const currentCount = categoryMap.get(categoryName) || 0
      categoryMap.set(categoryName, currentCount + 1)
    })

    return Array.from(categoryMap.entries())
      .map(([name, count]) => ({ name, value: count }))
      .filter((item) => item.value > 0)
  }

  const getTrendData = () => {
    const dateRange = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
    const viewsData = new Array(dateRange).fill(0)
    const likesData = new Array(dateRange).fill(0)
    const commentsData = new Array(dateRange).fill(0)

    const today = new Date()

    posts.forEach((post) => {
      try {
        // Handle different date formats safely
        let postDate: Date
        if (post.createdAt instanceof Date) {
          postDate = post.createdAt
        } else if (typeof post.createdAt === "string") {
          postDate = parseISO(post.createdAt)
        } else {
          return // Skip invalid dates
        }

        const daysAgo = Math.floor((today.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24))

        if (daysAgo >= 0 && daysAgo < dateRange) {
          const index = dateRange - daysAgo - 1
          viewsData[index] += post.views || 0
          likesData[index] += post.likes || 0
          commentsData[index] += post.comments?.length || 0
        }
      } catch (error) {
        console.warn("Invalid date format for post:", post.id, post.createdAt)
      }
    })

    const labels = Array.from({ length: dateRange }, (_, i) => format(subDays(today, dateRange - i - 1), "MMM dd"))

    return {
      labels,
      views: viewsData,
      likes: likesData,
      comments: commentsData,
    }
  }

  const getTopPosts = (sortBy: "views" | "likes" | "comments", limit = 5) => {
    return [...posts] // Create a copy first
      .sort((a, b) => {
        const aValue = sortBy === "views" ? a.views || 0 : sortBy === "likes" ? a.likes || 0 : a.comments?.length || 0
        const bValue = sortBy === "views" ? b.views || 0 : sortBy === "likes" ? b.likes || 0 : b.comments?.length || 0
        return bValue - aValue
      })
      .slice(0, limit)
  }

  const handleDeletePost = async (postId: string, postTitle: string) => {
    if (confirm(`Are you sure you want to delete "${postTitle}"? This action cannot be undone.`)) {
      try {
        await deletePost(postId).unwrap()
        toast({
          title: "Post deleted",
          description: "The post has been successfully deleted.",
        })
        refetchPosts()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete the post. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleViewPost = (postId: string) => {
    navigate(`/${postId}`)
  }

  const handleEditPost = (postId: string) => {
    navigate(`/edit-post/${postId}`)
  }

  const exportData = () => {
    console.log("I am exporting the data !")
    const csvContent = [
      ["Title", "Author", "Category", "Views", "Likes", "Comments", "Created Date"],
      ...filteredPosts.map((post) => [
        post.title,
        post.authorName,
        categories.find((c) => c.id === post.category)?.name || "Uncategorized",
        post.views || 0,
        post.likes || 0,
        post.comments?.length || 0,
        format(parseISO(post.createdAt), "yyyy-MM-dd"),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `blog-posts-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-8">You don't have permission to access the admin dashboard.</p>
        <Button onClick={() => navigate("/")}>Go Back Home</Button>
      </div>
    )
  }

  const categoryData = getCategoryData()
  const trendData = getTrendData()
  const topPostsByViews = getTopPosts("views")
  const topPostsByLikes = getTopPosts("likes")

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Analyze your blog's performance and manage content</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => navigate("/create-post")} className="gap-2">
            <Plus className="h-4 w-4" />
            New Post
          </Button>
          <Button variant="outline" onClick={exportData} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" onClick={() => refetchPosts()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {postsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalPosts}</div>
                <p className="text-xs text-muted-foreground">+{stats.postsThisMonth} this month</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {postsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+{stats.viewsThisMonth.toLocaleString()} this month</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {postsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.avgEngagement.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Likes + Comments / Views</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {postsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold truncate">{stats.topCategory}</div>
                <p className="text-xs text-muted-foreground">Most popular category</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Analytics Overview</CardTitle>
                <CardDescription>Performance metrics over time</CardDescription>
              </div>
              <div className="flex gap-1">
                {(["7d", "30d", "90d"] as const).map((range) => (
                  <Button
                    key={range}
                    variant={timeRange === range ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeRange(range)}
                  >
                    {range.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-80">
            {postsLoading ? (
              <div className="flex items-center justify-center h-full">
                <Skeleton className="h-64 w-full" />
              </div>
            ) : (
              <LineChart
                data={[
                  {
                    name: "Views",
                    data: trendData.views,
                    color: "#3b82f6",
                  },
                  {
                    name: "Likes",
                    data: trendData.likes,
                    color: "#10b981",
                  },
                  {
                    name: "Comments",
                    data: trendData.comments,
                    color: "#f59e0b",
                  },
                ]}
                categories={trendData.labels}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Posts by Category</CardTitle>
            <CardDescription>Content distribution across categories</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {categoriesLoading || postsLoading ? (
              <div className="flex items-center justify-center h-full">
                <Skeleton className="h-64 w-full" />
              </div>
            ) : categoryData.length > 0 ? (
              <PieChart data={categoryData} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Posts Tabs */}
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
                      {categories.find((c) => c.id === post.category)?.name || "Uncategorized"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {post.views || 0}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => handleViewPost(post.id)}>
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
                    <Button variant="ghost" size="sm" onClick={() => handleViewPost(post.id)}>
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="comments" className="space-y-4">
              {getTopPosts("comments").map((post, index) => (
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
                    <Button variant="ghost" size="sm" onClick={() => handleViewPost(post.id)}>
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Posts Management */}
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
              {postsLoading ? (
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
                            const date =
                              (post.createdAt instanceof Date)
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
                            <DropdownMenuItem onClick={() => handleViewPost(post.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditPost(post.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeletePost(post.id, post.title)}
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
    </div>
  )
}
