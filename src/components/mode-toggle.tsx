"use client"

import { Moon, Sun, Palette } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup,
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
  const { theme, setTheme, colorTheme, setColorTheme } = useTheme();

  const colorThemes = [
    { id: "blue", name: "Blue", color: "oklch(0.58 0.15 255)" },
    { id: "emerald", name: "Emerald", color: "oklch(0.52 0.18 160)" },
    { id: "rose", name: "Rose", color: "oklch(0.62 0.22 10)" },
    { id: "violet", name: "Violet", color: "oklch(0.60 0.20 280)" }
  ];

  const themeModes = [
    { id: "light", name: "Light", icon: <Sun className="h-4 w-4" /> },
    { id: "dark", name: "Dark", icon: <Moon className="h-4 w-4" /> },
    { id: "system", name: "System", icon: <Palette className="h-4 w-4" /> }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-background"
      >
        {/* Theme Modes */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>Appearance</DropdownMenuLabel>
          {themeModes.map((mode) => (
            <DropdownMenuItem
              key={mode.id}
              onClick={() => setTheme(mode.id as "light" | "dark" | "system")}
              className={`flex items-center gap-3 ${
                theme === mode.id ? "bg-accent" : ""
              }`}
            >
              <span className="text-muted-foreground">{mode.icon}</span>
              <span>{mode.name}</span>
              {theme === mode.id && (
                <span className="ml-auto h-2 w-2 rounded-full bg-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        {/* Color Themes */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>Color Theme</DropdownMenuLabel>
          {colorThemes.map((color) => (
            <DropdownMenuItem
              key={color.id}
              onClick={() => setColorTheme(color.id as "blue" | "emerald" | "rose" | "violet")}
              className={`flex items-center gap-3 ${
                colorTheme === color.id ? "bg-accent" : ""
              }`}
            >
              <span 
                className="h-4 w-4 rounded-full border border-foreground/20" 
                style={{ backgroundColor: color.color }}
              />
              <span>{color.name}</span>
              {colorTheme === color.id && (
                <span className="ml-auto h-2 w-2 rounded-full bg-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}