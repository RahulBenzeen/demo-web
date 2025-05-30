import { useAuth } from "../contexts/AuthContext";
import { useGetSavedPostsQuery } from "@/store/postApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bookmark, BookmarkX, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function SavedPosts() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { data: posts, isLoading, isError, refetch } = useGetSavedPostsQuery(currentUser?.uid || "");

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-4 text-muted-foreground hover:text-primary"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Bookmark className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Saved Posts</h1>
              <p className="text-muted-foreground mt-1">
                Your collection of bookmarked content
              </p>
            </div>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={() => navigate("/")}
        >
          <BookOpen className="h-4 w-4" />
          Browse Posts
        </Button>
      </div>

      <Separator className="my-6" />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="h-full overflow-hidden transition-all hover:shadow-md">
              <div className="aspect-video w-full">
                <Skeleton className="h-full w-full" />
              </div>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <div className="mx-auto bg-destructive/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <BookmarkX className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-xl font-bold mb-2">Failed to load saved posts</h3>
            <p className="text-muted-foreground mb-6">
              We couldn't retrieve your saved posts. Please try again.
            </p>
            <Button onClick={refetch}>Retry</Button>
          </CardContent>
        </Card>
      ) : posts?.length === 0 ? (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Bookmark className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">No saved posts yet</h3>
            <p className="text-muted-foreground mb-6">
              Save interesting posts to find them easily later. Your saved posts will appear here.
            </p>
            <Button onClick={() => navigate("/")}>
              <BookOpen className="mr-2 h-4 w-4" />
              Browse Posts
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts?.map((post) => (
            <Card 
              key={post.id}
              className="h-full overflow-hidden transition-all hover:shadow-md cursor-pointer"
              onClick={() => navigate(`/${post.id}`)}
            >
              {post.coverImage ? (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-r from-blue-50 to-purple-50 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="line-clamp-2 text-lg">{post.title}</CardTitle>
                  <Badge variant="secondary" className="flex-shrink-0">
                    {post.category}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pb-4">
                <p className="text-muted-foreground line-clamp-3 mb-4">
                  {post.excerpt || "No description available"}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {post.tags?.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag.trim()}
                    </Badge>
                  ))}
                  {post.tags?.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{post.tags.length - 3} more
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                  <span>
                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "N/A"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Bookmark className="h-4 w-4 text-primary" />
                      Saved
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}