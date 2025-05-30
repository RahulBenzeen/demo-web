import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { X } from 'lucide-react'

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
      {/* Mobile filter overlay */}
      {showFilters && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setShowFilters(false)}
        />
      )}

      {/* Sidebar filters */}
      <div 
        className={`fixed lg:sticky top-0 left-0 h-screen lg:h-auto z-50 lg:z-auto lg:w-64 flex-shrink-0 transition-all duration-300 ease-out-expo lg:transform-none ${
          showFilters ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{ width: "16rem" }}
      >
        <Card className="h-full lg:h-auto rounded-none lg:rounded-lg overflow-hidden shadow-medium glass">
          <CardHeader className="pb-3 sticky top-0 bg-background/90 backdrop-blur-sm z-10 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gradient">Filters</CardTitle>
              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="px-1.5 py-0 animate-fade-in">
                    {activeFilterCount}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden hover:bg-accent/50 transition-colors"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 py-4">
            {/* Categories */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-foreground/80">Categories</h4>
              <ScrollArea className="h-[120px]">
                {isCategoriesLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-2 animate-pulse">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-4 w-24 rounded" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center space-x-2 group"
                      >
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={selectedCategories.includes(category.name)}
                          onCheckedChange={() => toggleCategory(category.name)}
                          className="transition-transform group-hover:scale-110"
                        />
                        <Label
                          htmlFor={`category-${category.id}`}
                          className="text-sm font-normal cursor-pointer transition-colors group-hover:text-primary"
                        >
                          {category.name} ({category.postCount})
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            <Separator className="bg-border/50" />

            {/* Tags */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-foreground/80">Tags</h4>
              <ScrollArea className="h-[120px]">
                {isInitialLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-2 animate-pulse">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-4 w-20 rounded" />
                      </div>
                    ))}
                  </div>
                ) : allTags.length > 0 ? (
                  <div className="space-y-3">
                    {allTags.map((tag, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 group"
                      >
                        <Checkbox
                          id={`tag-${tag}`}
                          checked={selectedTags.includes(tag)}
                          onCheckedChange={() => toggleTag(tag)}
                          className="transition-transform group-hover:scale-110"
                        />
                        <Label
                          htmlFor={`tag-${tag}`}
                          className="text-sm font-normal cursor-pointer truncate transition-colors group-hover:text-primary"
                        >
                          {tag}
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-2 text-sm text-muted-foreground">
                    No tags available
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Clear filters */}
            {(selectedTags.length > 0 ||
              selectedCategories.length > 0 ||
              debouncedSearchText) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="w-full btn-animate hover:bg-destructive hover:text-destructive-foreground transition-all"
                >
                  Clear All Filters
                </Button>
              )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
