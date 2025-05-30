import React from 'react'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface ActiveFiltersProps {
  selectedTags: string[]
  selectedCategories: string[]
  debouncedSearchText: string
  setSearchText: (text: string) => void
  toggleCategory: (category: string) => void
  toggleTag: (tag: string) => void
}

export const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  selectedTags,
  selectedCategories,
  debouncedSearchText,
  setSearchText,
  toggleCategory,
  toggleTag,
}) => {
  const hasActiveFilters = selectedTags.length > 0 || selectedCategories.length > 0 || debouncedSearchText

  if (!hasActiveFilters) return null

  return (
    <div className="flex flex-wrap gap-2 items-center mb-6 p-4 rounded-lg glass animate-fade-in">
      <span className="text-sm text-muted-foreground font-medium">
        Filtered by:
      </span>
      {debouncedSearchText && (
        <Badge
          variant="secondary"
          className="cursor-pointer flex items-center group hover:bg-destructive hover:text-destructive-foreground transition-colors"
          onClick={() => setSearchText("")}
        >
          Search: {debouncedSearchText}
          <X className="ml-1 h-3 w-3 group-hover:scale-110 transition-transform" />
        </Badge>
      )}
      {selectedCategories.map((category) => (
        <Badge
          key={category}
          variant="secondary"
          className="cursor-pointer flex items-center group hover:bg-destructive hover:text-destructive-foreground transition-colors"
          onClick={() => toggleCategory(category)}
        >
          {category}
          <X className="ml-1 h-3 w-3 group-hover:scale-110 transition-transform" />
        </Badge>
      ))}
      {selectedTags.map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className="cursor-pointer flex items-center group hover:bg-destructive hover:text-destructive-foreground transition-colors"
          onClick={() => toggleTag(tag)}
        >
          {tag}
          <X className="ml-1 h-3 w-3 group-hover:scale-110 transition-transform" />
        </Badge>
      ))}
    </div>
  )
}
