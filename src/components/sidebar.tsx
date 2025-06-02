"use client"

import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "./mode-toggle"
import { cn } from "@/utils/utils"
import {
  ChevronLeft,
  ChevronRight,
  Home,
  FileText,
  Mail,
  Menu,
  Settings,
  LayoutDashboard,
  Bell,
  LogOut,
  PenSquare,
  LogIn,
  UserPlus,
  User,
  Save,
  X,
  CircleDot,
  Loader2
} from "lucide-react"
import { useState, useEffect } from "react"
import { useMediaQuery } from "@/hooks/media-query"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "../contexts/AuthContext"
import { Badge } from "@/components/ui/badge"
import { db } from "@/lib/firebase"
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore"
import { useNavigate } from "react-router-dom"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"

interface Notification {
  id: string;
  title: string;
  timestamp: Date;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'comment';
  link?: string;
  body?: string;
}

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const location = useLocation()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const { toast } = useToast()
  const { currentUser, userProfile, logout} = useAuth();
  const navigate = useNavigate();

  // Fetch notifications from Firestore
  useEffect(() => {
    if (!currentUser?.uid) return

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", currentUser.uid),
      where("read", "==", false)
    )
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notifs: Notification[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        notifs.push({
          id: doc.id,
          title: data.title,
          timestamp: data.timestamp.toDate(),
          read: data.read,
          type: data.type || 'info',
          link: data.link,
          body: data.body
        })
      })
      setNotifications(notifs)
      setUnreadCount(notifs.length)
    })

    return () => unsubscribe()
  }, [currentUser])

  // Handle user profile loading state
  useEffect(() => {
    if (currentUser && userProfile) {
      // Profile data is available
      setIsLoadingProfile(false)
    } else if (currentUser) {
      // User is authenticated but profile hasn't loaded yet
      const timer = setTimeout(() => {
        setIsLoadingProfile(false)
      }, 1500)
      
      return () => clearTimeout(timer)
    } else {
      // No user, no loading needed
      setIsLoadingProfile(false)
    }
  }, [currentUser, userProfile])

  // Handle responsive behavior
  useEffect(() => {
    if (isDesktop) {
      setIsMobileOpen(false)
    }
  }, [isDesktop])

  const toggleSidebar = () => {
    setCollapsed(!collapsed)
  }

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, "notifications", id), {
        read: true
      })
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const batch = notifications.map(notif => 
        updateDoc(doc(db, "notifications", notif.id), { read: true })
      )
      await Promise.all(batch)
      toast({
        title: "Notifications cleared",
        description: "All notifications have been marked as read",
      })
    } catch (error) {
      console.error("Error marking notifications as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive",
      })
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)
    if (notification.link) {
      navigate(notification.link)
    }
  }

  // Navigation items configuration
  const mainNavItems = [
    {
      title: "Home",
      icon: <Home className="h-5 w-5" />,
      path: "/",
    },
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: "/dashboard",
      requiresAuth: true,
      requiresAdmin: true,
    },
    {
      title: "My Posts",
      icon: <FileText className="h-5 w-5" />,
      path: "/my-posts",
      requiresAuth: true,
    },
    {
      title: "Saved Posts",
      icon: <Save className="h-5 w-5" />,
      path: "/saved",
      requiresAuth: true,
    },
    {
      title: "Create Post",
      icon: <PenSquare className="h-5 w-5" />,
      path: "/create-post",
      requiresAuth: true,
    },
  ]

  const secondaryNavItems = [
    {
      title: "Contact",
      icon: <Mail className="h-5 w-5" />,
      path: "/contact",
    },
    {
      title: "Settings",
      icon: <Settings className="h-5 w-5" />,
      path: "/settings",
      requiresAuth: true,
    },
    {
      title: "Profile",
      icon: <User className="h-5 w-5" />,
      path: "/profile",
      requiresAuth: true,
    },
  ]

  const authNavItems = [
    {
      title: "Sign In",
      icon: <LogIn className="h-5 w-5" />,
      path: "/sign-in",
    },
    {
      title: "Sign Up",
      icon: <UserPlus className="h-5 w-5" />,
      path: "/sign-up",
    },
  ]

  const isAuthenticated = !!currentUser
  const isAdmin = userProfile?.role === "admin"

  const notificationTypes = {
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    comment: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && !isDesktop && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" 
          onClick={toggleMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* Mobile menu button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="fixed top-4 left-4 z-50 md:hidden" 
        onClick={toggleMobileSidebar}
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r bg-card transition-all duration-300 md:relative md:z-0",
          collapsed && isDesktop ? "w-[70px]" : "w-[260px]",
          !isDesktop && (isMobileOpen ? "translate-x-0" : "-translate-x-full"),
        )}
      >
        <div className="flex h-14 items-center justify-between border-b px-3 py-4">
          {!collapsed && <h1 className="text-xl font-bold tracking-tight">B'log</h1>}
          {isDesktop && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar} 
              className="ml-auto"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          )}
        </div>

        {/* User profile section */}
        <div className={cn("border-b p-4", collapsed && "flex justify-center p-2")}>
          {isAuthenticated ? (
            collapsed ? (
              <Link to="/profile\" className="relative">
                {isLoadingProfile ? (
                  <div className="relative h-10 w-10">
                    <Skeleton className="h-10 w-10 rounded-full animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={userProfile?.photoURL || ""} />
                      <AvatarFallback>
                        {userProfile?.displayName?.charAt(0) || userProfile?.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </div>
                )}
              </Link>
            ) : (
              <Link to="/profile" className="flex items-center space-x-3">
                <div className="relative">
                  {isLoadingProfile ? (
                    <div className="relative h-10 w-10">
                      <Skeleton className="h-10 w-10 rounded-full animate-pulse" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                      </div>
                      <div className="absolute -inset-1 rounded-full border-2 border-t-transparent border-primary/30 animate-spin"></div>
                    </div>
                  ) : (
                    <Avatar>
                      <AvatarImage src={userProfile?.photoURL || ""} />
                      <AvatarFallback>
                        {userProfile?.displayName?.charAt(0) || userProfile?.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </div>
                {isLoadingProfile ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32 animate-pulse" />
                    <Skeleton className="h-3 w-24 animate-pulse" />
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium">{userProfile?.displayName || "User"}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                      {userProfile?.email}
                    </p>
                  </div>
                )}
              </Link>
            )
          ) : (
            <div className={cn("flex", collapsed ? "justify-center" : "justify-start gap-2")}>
              {collapsed ? (
                <Avatar>
                  <AvatarFallback>G</AvatarFallback>
                </Avatar>
              ) : (
                <div className="flex gap-2 w-full">
                  <Link to="/sign-in" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/sign-up" className="flex-1">
                    <Button size="sm" className="w-full">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main navigation */}
        <nav className="flex-1 overflow-auto p-3">
          <div className="space-y-1">
            {!collapsed && <p className="mb-2 px-2 text-xs font-semibold text-muted-foreground">MAIN</p>}
            {mainNavItems
              .filter((item) => (!item.requiresAuth || isAuthenticated) && (!item.requiresAdmin || isAdmin))
              .map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground group",
                    location.pathname === item.path ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                    collapsed && "justify-center px-0",
                  )}
                >
                  <span className="relative">
                    {item.icon}
                    {item.path === "/saved" && unreadCount > 0 && !collapsed && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
                    )}
                  </span>
                  {!collapsed && <span className="ml-3">{item.title}</span>}
                </Link>
              ))}
          </div>

          <div className="mt-6 space-y-1">
            {!collapsed && <p className="mb-2 px-2 text-xs font-semibold text-muted-foreground">GENERAL</p>}
            {secondaryNavItems
              .filter((item) => !item.requiresAuth || isAuthenticated)
              .map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                    location.pathname === item.path ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                    collapsed && "justify-center px-0",
                  )}
                >
                  {item.icon}
                  {!collapsed && <span className="ml-3">{item.title}</span>}
                </Link>
              ))}
          </div>

          {!isAuthenticated && (
            <div className="mt-6 space-y-1">
              {!collapsed && <p className="mb-2 px-2 text-xs font-semibold text-muted-foreground">ACCOUNT</p>}
              {authNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                    location.pathname === item.path ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                    collapsed && "justify-center px-0",
                  )}
                >
                  {item.icon}
                  {!collapsed && <span className="ml-3">{item.title}</span>}
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* Footer section */}
        <div className="border-t p-3">
          <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-between")}>
            {!collapsed && <span className="text-sm text-muted-foreground">Theme</span>}
            <ModeToggle />
          </div>

          {!collapsed && isAuthenticated && (
            <div className="mt-3">
              <NotificationsDropdown 
                notifications={notifications} 
                unreadCount={unreadCount} 
                markAsRead={markAsRead} 
                markAllAsRead={markAllAsRead}
                handleNotificationClick={handleNotificationClick}
                notificationTypes={notificationTypes}
              />
            </div>
          )}

          {!collapsed && isAuthenticated && (
            <LogoutButton handleLogout={handleLogout} />
          )}
        </div>
      </aside>
    </>
  )
}

// Extracted components for better maintainability
interface NotificationsDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  handleNotificationClick: (notification: Notification) => void;
  notificationTypes: Record<string, string>;
}

function NotificationsDropdown({ 
  notifications, 
  unreadCount, 
  markAsRead, 
  markAllAsRead,
  handleNotificationClick,
  notificationTypes
}: NotificationsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start relative"
        >
          <Bell className="mr-2 h-4 w-4" />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center animate-pulse"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[280px] max-h-[400px] overflow-y-auto">
        <div className="flex justify-between items-center px-2 py-1">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          {notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-6"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="py-4 text-center">
            <Bell className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No new notifications</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <DropdownMenuItem 
              key={notif.id}
              className={cn(
                "py-3 border-b last:border-b-0 transition-colors",
                !notif.read && "bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/40"
              )}
              onClick={() => handleNotificationClick(notif)}
            >
              <div className="flex items-start gap-3">
                <div className={`rounded-full p-2 ${notificationTypes[notif.type]}`}>
                  <CircleDot className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-medium">{notif.title}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 ml-2 opacity-70 hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        markAsRead(notif.id)
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  {notif.body && (
                    <p className="text-sm text-muted-foreground mt-1">{notif.body}</p>
                  )}
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-muted-foreground">
                      {notif.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!notif.read && (
                      <span className="inline-block h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                    )}
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface LogoutButtonProps {
  handleLogout: () => Promise<void>;
}

function LogoutButton({ handleLogout }: LogoutButtonProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 w-full justify-start text-muted-foreground hover:text-destructive transition-colors"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to log out? You'll need to sign in again to access your account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleLogout}>
            Logout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}