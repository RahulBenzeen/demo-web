import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { X, Filter, Sparkles } from 'lucide-react'

interface FilterSidebarProps {
  showFilters: boolean
  setShowFilters: (show: boolean) => void
  activeFilterCount: number
  categories: any[]
  isCategoriesLoading: boolean
  selectedCategories: string[]
  toggleCategory: (category: string) => void
  allTags: string[]
  isInitialLoading: boolean
  selectedTags: string[]
  toggleTag: (tag: string) => void
  clearFilters: () => void
  debouncedSearchText: string
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  showFilters,
  setShowFilters,
  activeFilterCount,
  categories,
  isCategoriesLoading,
  selectedCategories,
  toggleCategory,
  allTags,
  isInitialLoading,
  selectedTags,
  toggleTag,
  clearFilters,
  debouncedSearchText,
}) => {
  return (
    <>
      {/* Mobile filter toggle button */}
      <div className="fixed bottom-6 right-6 z-40 lg:hidden">
        <Button 
          variant="secondary"
          size="icon"
          className="rounded-full shadow-lg w-14 h-14 relative animate-bounce"
          onClick={() => setShowFilters(true)}
        >
          <Filter className="h-6 w-6" />
          {activeFilterCount > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1.5 py-0 animate-pulse">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Mobile filter overlay */}
      {showFilters && (
        <div 
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setShowFilters(false)}
        />
      )}

      {/* Sidebar filters */}
      <div 
        className={`fixed lg:sticky top-0 left-0 h-screen lg:h-[calc(100vh-2rem)] z-50 lg:z-auto lg:w-72 flex-shrink-0 transition-all duration-300 ease-out-expo lg:transform-none ${
          showFilters ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <Card className="h-full lg:h-auto rounded-none lg:rounded-xl overflow-hidden shadow-2xl bg-gradient-to-b from-background to-muted/10 border border-muted/30">
          <CardHeader className="pb-3 sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b border-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-semibold tracking-tight">
                  Filter Content
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="px-2 py-0.5 animate-fade-in">
                    {activeFilterCount} active
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-accent/50 transition-colors"
                  onClick={() => setShowFilters(false)}
                >

                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 py-4">
            {/* Categories */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-foreground flex items-center gap-2">
                <span className="bg-gradient-to-r from-primary to-purple-500 w-1 h-4 rounded-full"></span>
                Categories
              </h4>
              <ScrollArea className="h-[140px] pr-4">
                {isCategoriesLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-3 animate-pulse">
                        <Skeleton className="h-4 w-4 rounded-md" />
                        <Skeleton className="h-4 w-32 rounded" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className={`flex items-center space-x-3 group p-2 rounded-lg transition-all ${
                          selectedCategories.includes(category.name) 
                            ? 'bg-primary/10 border border-primary/20' 
                            : 'hover:bg-accent/30'
                        }`}
                      >
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={selectedCategories.includes(category.name)}
                          onCheckedChange={() => toggleCategory(category.name)}
                          className="transition-transform group-hover:scale-110 data-[state=checked]:bg-primary"
                        />
                        <Label
                          htmlFor={`category-${category.id}`}
                          className="text-sm font-medium cursor-pointer transition-colors group-hover:text-primary flex-1"
                        >
                          {category.name}
                        </Label>
                        <Badge variant="secondary" className="px-1.5 py-0 text-xs">
                          {category.postCount}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            <Separator className="bg-border/30" />

            {/* Tags */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-foreground flex items-center gap-2">
                <span className="bg-gradient-to-r from-blue-500 to-cyan-500 w-1 h-4 rounded-full"></span>
                Tags
              </h4>
              <ScrollArea className="h-[140px] pr-4">
                {isInitialLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-3 animate-pulse">
                        <Skeleton className="h-4 w-4 rounded-md" />
                        <Skeleton className="h-4 w-24 rounded" />
                      </div>
                    ))}
                  </div>
                ) : allTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag, index) => (
                      <div
                        key={index}
                        className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                          selectedTags.includes(tag)
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-muted hover:bg-muted/80 cursor-pointer'
                        }`}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                        {selectedTags.includes(tag) && (
                          <X className="h-3 w-3 ml-1.5" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-2 text-sm text-muted-foreground italic">
                    No tags available
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Clear filters */}
            {(selectedTags.length > 0 ||
              selectedCategories.length > 0 ||
              debouncedSearchText) && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="w-full bg-background hover:bg-destructive/90 hover:text-destructive-foreground transition-all group"
                  >
                    <span className="group-hover:-translate-x-1 transition-transform">Clear All Filters</span>
                    <X className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Button>
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}