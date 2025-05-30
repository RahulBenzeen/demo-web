"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/rich-text-editor"
import { Loader2, Save, ArrowLeft, Link, FileText, Upload, X } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "../contexts/AuthContext"
import { db, storage } from "../lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { sendNotificationToUser } from "@/lib/notifications"
import { useGetCategoriesQuery } from "@/store/postApi"


export default function CreatePost() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [tags, setTags] = useState("")
  const [category, setCategory] = useState("Technology")
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [validationError, setValidationError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null);

  const{data: Categories} = useGetCategoriesQuery();
  console.log({Categories})

  const navigate = useNavigate()
  const { currentUser, userProfile } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear previous errors
    setValidationError("")

    if (!title.trim()) {
      setValidationError("title")
      toast({
        title: "Missing title",
        description: "Please enter a title for your post",
        variant: "destructive",
      })
      return
    }

    if (!content.trim() || content === "<p></p>" || content === "<p><br></p>") {
      setValidationError("content")
      toast({
        title: "Missing content",
        description: "Please enter content for your post",
        variant: "destructive",
      })
      return
    }

    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "You must be signed in to create a post",
        variant: "destructive",
      })
      navigate("/sign-in")
      return
    }

    setIsLoading(true)

    try {
      // Create post in Firestore
      const postData = {
        title,
        body: content,
        excerpt: excerpt || createExcerpt(content),
        coverImage,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        category,
        authorId: currentUser.uid,
        authorName: userProfile?.displayName || "Anonymous",
        authorImage: userProfile?.photoURL || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likes: 0,
        views: 0,
        comments: [],
      }

      const docRef = await addDoc(collection(db, "posts"), postData)

      toast({
        title: "Post created",
        description: "Your post has been created successfully",
        action: (
          <ToastAction altText="View Posts" onClick={() => navigate(`/${docRef.id}`)}>
            View Posts
          </ToastAction>
        ),
      });

      await sendNotificationToUser(
        currentUser.uid,
        "New Post",
        `${currentUser.displayName} posted a new postt`
      );


      navigate(`/${docRef.id}`)
    } catch (err) {
      console.error("Failed to create post:", err)
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createExcerpt = (html: string): string => {
    // Remove HTML tags
    const text = html.replace(/<[^>]*>/g, "")
    // Return first 150 characters
    return text.length > 150 ? text.substring(0, 150) + "..." : text
  }

  const handleCoverImageUpload = async () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 2MB",
        variant: "destructive",
      })
      return
    }

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
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      // Validate file size (max 1MB for content images)
      if (file.size > 1 * 1024 * 1024) {
        throw new Error("Image size exceeds 1MB limit")
      }

      const storageRef = ref(storage, `posts/images/${Date.now()}-${file.name}`)
      await uploadBytes(storageRef, file)
      const imageUrl = await getDownloadURL(storageRef)
      return imageUrl
    } catch (error) {
      console.error("Image upload error:", error)
      throw new Error("Failed to upload image. Please try a smaller file.")
    }
  }

  const removeCoverImage = () => {
    setCoverImage("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Create New Post</h1>
        </div>
        <Button onClick={handleSubmit} disabled={isLoading} className="gap-2">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Post
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6">
        <Card className={validationError === "title" ? "border-destructive" : ""}>
          <CardHeader>
            <CardTitle>Post Details</CardTitle>
            <CardDescription>Enter the basic information about your post</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
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
                placeholder="Brief summary of your post (auto-generated if empty)"
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
                   
                    {Categories?.map((category) => (
                        <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  placeholder="Enter tags separated by commas (e.g., react, javascript, web)"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverImage">Cover Image (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="coverImage"
                  placeholder="Enter image URL or upload an image"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCoverImageUpload}
                  disabled={isUploading}
                  className="flex-shrink-0"
                >
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
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full"
                    onClick={removeCoverImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className={validationError === "content" ? "border-destructive" : ""}>
          <CardHeader>
            <CardTitle>
              Content <span className="text-destructive">*</span>
            </CardTitle>
            <CardDescription>Write your post content using the rich text editor</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="editor">
              <TabsList className="mb-4">
                <TabsTrigger value="editor">
                  <FileText className="mr-2 h-4 w-4" />
                  Editor
                </TabsTrigger>
                <TabsTrigger value="preview">
                  <Link className="mr-2 h-4 w-4" />
                  Preview
                </TabsTrigger>
              </TabsList>
              <TabsContent value="editor">
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  height="500px"
                  placeholder="Write your post content here..."
                  onImageUpload={handleImageUpload}
                  label="Post Content"
                />
              </TabsContent>
              <TabsContent value="preview">
                <Card>
                  <CardContent className="p-6 min-h-[500px]">
                    {content ? (
                      <div
                        className="prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: content }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
                        <FileText className="h-12 w-12 mb-4" />
                        <p className="text-lg">No content to preview yet</p>
                        <p className="text-sm mt-2">Start writing in the editor tab to see a preview here</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between border-t px-6 py-4">
            <Button variant="outline" onClick={() => navigate("/")}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Post
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}