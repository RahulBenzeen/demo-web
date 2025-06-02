"use client"

import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/components/ui/use-toast"
import { useGetPostsQuery, useGetCategoriesQuery, useDeletePostMutation } from "@/store/postApi"
import { useAuth } from "@/contexts/AuthContext"
import { parseISO } from "date-fns"
import type { Timestamp } from "firebase/firestore"

// Import components
import { StatsCards } from "@/components/dashboard/stats-cards"
import { AnalyticsCharts } from "@/components/dashboard/analytics-charts"
import { TopPosts } from "@/components/dashboard/top-posts"
import { PostsTable } from "@/components/dashboard/posts-table"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { AccessDenied } from "@/components/dashboard/access-denied"

// Import utilities
import { formatDate, isDateAfter, generateDateLabels } from "@/utils/date-utils"

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
  const { userProfile } = useAuth()
  const { toast } = useToast()

  // Fetch data using existing API hooks
  const {
    data: postsData,
    isLoading: postsLoading,
    refetch: refetchPosts,
  } = useGetPostsQuery({
    limit: 1000,
  })

  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery()
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation()

  const posts = useMemo(() => postsData?.posts || [], [postsData])
  const categories = useMemo(() => categoriesData || [], [categoriesData])

  // Check if user is admin
  const isAdmin = userProfile?.role === "admin"

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

    // This month's stats
    const thisMonth = new Date()
    thisMonth.setDate(1)

    const postsThisMonth = posts.filter((post) => isDateAfter(post.createdAt, thisMonth)).length

    const viewsThisMonth = posts
      .filter((post) => isDateAfter(post.createdAt, thisMonth))
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

  // Chart data functions
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

  const getTrendData = (timeRange: "7d" | "30d" | "90d") => {
    const dateRange = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
    const viewsData = new Array(dateRange).fill(0)
    const likesData = new Array(dateRange).fill(0)
    const commentsData = new Array(dateRange).fill(0)

    const today = new Date()

    posts.forEach((post) => {
      try {
        let postDate: Date

        if (post.createdAt && typeof post.createdAt === "object" && post.createdAt) {
          postDate = post.createdAt
        } else if (typeof post.createdAt === "string") {
          postDate = parseISO(post.createdAt)
        } else if (post.createdAt && typeof (post.createdAt as Timestamp).toDate === "function") {
          postDate = (post.createdAt as Timestamp).toDate()
        } else {
          return // skip invalid dates
        }

        const daysAgo = Math.floor((today.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24))

        if (daysAgo >= 0 && daysAgo < dateRange) {
          const index = dateRange - daysAgo - 1
          viewsData[index] += post.views || 0
          likesData[index] += post.likes || 0
          commentsData[index] += post.comments?.length || 0
        }
      } catch {
        console.warn("Invalid date format for post:", post.id, post.createdAt)
      }
    })

    const labels = generateDateLabels(dateRange)

    return {
      labels,
      views: viewsData,
      likes: likesData,
      comments: commentsData,
    }
  }

  const getTopPosts = (sortBy: "views" | "likes" | "comments", limit = 5) => {
    return [...posts]
      .sort((a, b) => {
        const aValue = sortBy === "views" ? a.views || 0 : sortBy === "likes" ? a.likes || 0 : a.comments?.length || 0
        const bValue = sortBy === "views" ? b.views || 0 : sortBy === "likes" ? b.likes || 0 : b.comments?.length || 0
        return bValue - aValue
      })
      .slice(0, limit)
  }

  // Event handlers
  const handleDeletePost = async (postId: string, postTitle: string) => {
    if (confirm(`Are you sure you want to delete "${postTitle}"? This action cannot be undone.`)) {
      try {
        await deletePost(postId).unwrap()
        toast({
          title: "Post deleted",
          description: "The post has been successfully deleted.",
        })
        refetchPosts()
      } catch {
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

  const handleNewPost = () => {
    navigate("/create-post")
  }

  const exportData = () => {
    const csvContent = [
      ["Title", "Author", "Category", "Views", "Likes", "Comments", "Created Date"],
      ...posts.map((post) => [
        post.title,
        post.authorName,
        categories.find((c) => c.id === post.category)?.name || "Uncategorized",
        post.views || 0,
        post.likes || 0,
        post.comments?.length || 0,
        formatDate(post.createdAt, "yyyy-MM-dd"),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `blog-posts-${formatDate(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (!isAdmin) {
    return <AccessDenied onGoBack={() => navigate("/")} />
  }

  const topPostsByViews = getTopPosts("views")
  const topPostsByLikes = getTopPosts("likes")
  const topPostsByComments = getTopPosts("comments")

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <DashboardHeader onNewPost={handleNewPost} onExport={exportData} onRefresh={refetchPosts} />

      {/* Stats Cards */}
      <StatsCards stats={stats} isLoading={postsLoading} />

      {/* Charts */}
      <AnalyticsCharts
        postsLoading={postsLoading}
        categoriesLoading={categoriesLoading}
        posts={posts}
        categories={categories}
        getCategoryData={getCategoryData}
        getTrendData={getTrendData}
      />

      {/* Top Posts Tabs */}
      <TopPosts
        topPostsByViews={topPostsByViews}
        topPostsByLikes={topPostsByLikes}
        topPostsByComments={topPostsByComments}
        categories={categories}
        onViewPost={handleViewPost}
      />

      {/* Posts Management */}
      <PostsTable
        posts={posts}
        categories={categories}
        isLoading={postsLoading}
        isDeleting={isDeleting}
        onViewPost={handleViewPost}
        onEditPost={handleEditPost}
        onDeletePost={handleDeletePost}
      />
    </div>
  )
}
