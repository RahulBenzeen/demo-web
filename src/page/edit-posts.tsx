"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/rich-text-editor"
import { Loader2, Save, ArrowLeft, Upload } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "../contexts/AuthContext"
import { useGetCategoriesQuery, useGetPostByIdQuery, useUpdatePostMutation } from "../store/postApi"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "../lib/firebase"
import { useRef } from "react"

export default function EditPost() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [tags, setTags] = useState("")
  const [category, setCategory] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const { data: Categories } = useGetCategoriesQuery();
  // Fetch the post data
  const {
    data: post,
    isLoading: isLoadingPost,
    isError,
    // error,
  } = useGetPostByIdQuery(id || "", {
    skip: !id,
  })

  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation()

  // Populate form when post data is loaded
  useEffect(() => {
    if (post) {
      // Check if current user is the author
      if (post.authorId !== currentUser?.uid) {
        toast({
          title: "Access denied",
          description: "You can only edit your own posts",
          variant: "destructive",
        })
        navigate("/my-posts")
        return
      }

      setTitle(post.title)
      setContent(post.body)
      setExcerpt(post.excerpt || "")
      setCoverImage(post.coverImage || "")
      setTags(post.tags.join(", "))
      setCategory(post.category)
    }
  }, [post, currentUser, navigate, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast({
        title: "Missing title",
        description: "Please enter a title for your post",
        variant: "destructive",
      })
      return
    }

    if (!content.trim()) {
      toast({
        title: "Missing content",
        description: "Please enter content for your post",
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
      await updatePost({
        id,
        post: {
          title,
          body: content,
          excerpt: excerpt || content.substring(0, 150).replace(/<[^>]*>/g, "") + "...",
          coverImage,
          tags: tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          category,
        },
      }).unwrap()

      toast({
        title: "Post updated",
        description: "Your post has been updated successfully",
      })

      navigate(`/${id}`)
    } catch (err) {
      console.error("Failed to update post:", err)
      toast({
        title: "Error",
        description: "Failed to update post. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCoverImageUpload = async () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const storageRef = ref(storage, `posts/covers/${Date.now()}-${file.name}`)
      await uploadBytes(storageRef, file)
      const imageUrl = await getDownloadURL(storageRef)

      setCoverImage(imageUrl)
      toast({
        title: "Image uploaded",
        description: "Cover image has been uploaded successfully",
      })
    } catch  {
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // const handleImageUpload = async (file: File): Promise<string> => {
  //   try {
  //     const storageRef = ref(storage, `posts/images/${Date.now()}-${file.name}`)
  //     await uploadBytes(storageRef, file)
  //     const imageUrl = await getDownloadURL(storageRef)
  //     return imageUrl
  //   } catch (error) {
  //     throw new Error("Failed to upload image")
  //   }
  // }

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
        <p className="text-muted-foreground mb-8">Please sign in to edit posts.</p>
        <Button onClick={() => navigate("/sign-in")}>Sign In</Button>
      </div>
    )
  }

  if (isLoadingPost) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
            <div className="h-64 w-full bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isError || !post) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The post you're trying to edit doesn't exist or you don't have permission to edit it.
        </p>
        <Button onClick={() => navigate("/my-posts")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Posts
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate("/my-posts")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Edit Post</h1>
        </div>
        <Button onClick={handleSubmit} disabled={isUpdating}>
          {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Update Post
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Details</CardTitle>
              <CardDescription>Update the basic information about your post.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter post title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg font-medium"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Input
                  id="excerpt"
                  placeholder="Brief summary of your post"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {
                        Categories?.map((category) => (
                          <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="Enter tags separated by commas"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverImage">Cover Image</Label>
                <div className="flex gap-2">
                  <Input
                    id="coverImage"
                    placeholder="Enter image URL or upload an image"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                  />
                  <Button type="button" variant="outline" onClick={handleCoverImageUpload} disabled={isUploading}>
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
                {coverImage && (
                  <div className="mt-2 relative aspect-video w-full max-w-md overflow-hidden rounded-md border">
                    <img
                      src={coverImage || "/placeholder.svg"}
                      alt="Cover preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>Edit your post content using the rich text editor.</CardDescription>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                value={content}
                onChange={setContent}
                height="400px"
                placeholder="Write your post content here..."
                // onImageUpload={handleImageUpload}
                label="Post Content"
              />
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
