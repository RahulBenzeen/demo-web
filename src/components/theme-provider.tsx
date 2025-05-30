import { createContext, useContext, useEffect, useState } from "react"

export type Theme = "dark" | "light" | "system"
export type ColorTheme = "blue" | "emerald" | "rose" | "violet"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  defaultColor?: ColorTheme
  storageKey?: string
  colorStorageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  colorTheme: ColorTheme
  setTheme: (theme: Theme) => void
  setColorTheme: (color: ColorTheme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  colorTheme: "blue",
  setTheme: () => null,
  setColorTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultColor = "blue",
  storageKey = "vite-ui-theme",
  colorStorageKey = "vite-ui-color-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )
  
  const [colorTheme, setColorTheme] = useState<ColorTheme>(
    () => (localStorage.getItem(colorStorageKey) as ColorTheme) || defaultColor
  )

  useEffect(() => {
    const root = window.document.documentElement
    
    // Remove all color theme classes
    root.classList.remove("theme-blue", "theme-emerald", "theme-rose", "theme-violet")
    
    // Add current color theme
    root.classList.add(`theme-${colorTheme}`)
    
    // Handle light/dark/system theme
    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches ? "dark" : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme, colorTheme])

  const value = {
    theme,
    colorTheme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
    setColorTheme: (color: ColorTheme) => {
      localStorage.setItem(colorStorageKey, color)
      setColorTheme(color)
    }
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")
  return context
}