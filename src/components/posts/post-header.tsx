import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Grid3X3, List, Filter } from 'lucide-react'

interface PostsHeaderProps {
  activeFilterCount: number
  setShowFilters: (show: boolean) => void
  searchText: string
  setSearchText: (text: string) => void
  handleSearch: (e: React.FormEvent) => void
  viewMode: 'grid' | 'list'
  setViewMode: (mode: 'grid' | 'list') => void
  currentUser: any
  onCreatePost: () => void
}

export const PostsHeader: React.FC<PostsHeaderProps> = ({
  activeFilterCount,
  setShowFilters,
  searchText,
  setSearchText,
  handleSearch,
  viewMode,
  setViewMode,
  currentUser,
  onCreatePost,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="lg:hidden relative hover:bg-accent/50 transition-colors"
          onClick={() => setShowFilters(true)}
        >
          <Filter className="h-4 w-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center animate-pulse">
              {activeFilterCount}
            </span>
          )}
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gradient">
          Posts
        </h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative w-full sm:w-auto">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors" />
            <Input
              type="search"
              placeholder="Search posts..."
              className="w-full pl-9 sm:w-[200px] md:w-[300px] transition-all focus:w-[350px] shadow-soft"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </form>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
            className="h-9 w-9 transition-all hover:scale-105"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
            className="h-9 w-9 transition-all hover:scale-105"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        {currentUser && (
          <Button 
            onClick={onCreatePost}
            className="whitespace-nowrap btn-animate shadow-colored hover:shadow-large"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Button>
        )}
      </div>
    </div>
  )
}
