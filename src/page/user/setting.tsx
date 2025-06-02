"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Theme, useTheme } from "@/components/theme-provider";
import { useAuth } from "@/contexts/AuthContext";

export default function Settings() {
  const { theme: currentTheme, setTheme } = useTheme();
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("account");
  const [isLoading, setIsLoading] = useState(true);

  // Initialize state with default values
  const [account, setAccount] = useState({
    name: "",
    username: "",
    email: ""
  });

  const [appearance, setAppearance] = useState({
    theme: currentTheme,
    density: "comfortable"
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: true
  });

  const [display, setDisplay] = useState({
    language: "en",
    timezone: "utc"
  });

  // Load user data and settings
  useEffect(() => {
    try {
      // Load account data from user profile
      if (userProfile) {
        setAccount({
          name: userProfile.displayName || "",
          username:  userProfile.displayName || "",
          email: userProfile.email || ""
        });
      }

      // Load appearance settings
      const savedAppearance = localStorage.getItem("appearanceSettings");
      if (savedAppearance) {
        const parsedAppearance = JSON.parse(savedAppearance);
        setAppearance(prev => ({
          ...prev,
          ...parsedAppearance,
          // Keep current theme instead of overriding
          theme: currentTheme
        }));
      }

      // Load notification settings
      const savedNotifications = localStorage.getItem("notificationSettings");
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }

      // Load display settings
      const savedDisplay = localStorage.getItem("displaySettings");
      if (savedDisplay) {
        setDisplay(JSON.parse(savedDisplay));
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
      toast.error("Settings Error", {
        description: "Could not load your saved preferences",
      });
    } finally {
      setIsLoading(false);
    }
  }, [userProfile, currentTheme]);

  // Apply density preferences
  useEffect(() => {
    document.documentElement.classList.toggle("compact", appearance.density === "compact");
  }, [appearance.density]);

  // Theme change handler
  const handleAppearanceChange = useCallback((field: keyof typeof appearance, value: string) => {
    if (field === "theme") {
      // Add transition class for smooth theme change
      document.documentElement.classList.add("theme-transition");
      
      setTimeout(() => {
        if (value !== "system") {
          setTheme(value as Theme);
        } else {
          // Handle system theme
          const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          setTheme(systemDark ? "dark" : "light");
        }
        
        setAppearance(prev => ({
          ...prev,
          theme: value as Theme
        }));
        
        // Remove transition class after change is complete
        setTimeout(() => {
          document.documentElement.classList.remove("theme-transition");
        }, 300);
      }, 10);
    } else {
      setAppearance(prev => ({ ...prev, [field]: value }));
    }
  }, [setTheme]);

  const handleAccountChange = (field: keyof typeof account, value: string) => {
    setAccount(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (type: keyof typeof notifications, checked: boolean) => {
    setNotifications(prev => ({ ...prev, [type]: checked }));
  };

  const handleDisplayChange = (field: keyof typeof display, value: string) => {
    setDisplay(prev => ({ ...prev, [field]: value }));
  };

  const saveAccountSettings = async () => {
    if (!account.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error("Invalid email format");
      return;
    }
    
    setIsSaving(true);

    try {
      if (currentUser && userProfile) {
        await updateUserProfile({
          displayName: account.name,
          email: account.email
        });

        toast.success("Account updated", {
          description: "Your profile information has been saved",
        });
      } else {
        // For demo purposes without auth
        localStorage.setItem("accountSettings", JSON.stringify(account));
        toast.success("Account settings saved", {
          description: "Your preferences have been updated",
        });
      }
    } catch (error: any) {
      toast.error("Error saving account", {
        description: error.message || "Could not update your profile",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const saveAppearanceSettings = () => {
    setIsSaving(true);
    localStorage.setItem("appearanceSettings", JSON.stringify(appearance));

    setTimeout(() => {
      setIsSaving(false);
      toast.success("Appearance saved", {
        description: "Your preferences have been updated",
      });
    }, 800);
  };

  const saveNotificationSettings = () => {
    setIsSaving(true);
    localStorage.setItem("notificationSettings", JSON.stringify(notifications));

    setTimeout(() => {
      setIsSaving(false);
      toast.success("Notifications saved", {
        description: "Your preferences have been updated",
      });
    }, 800);
  };

  const saveDisplaySettings = () => {
    setIsSaving(true);
    localStorage.setItem("displaySettings", JSON.stringify(display));

    setTimeout(() => {
      setIsSaving(false);
      toast.success("Display settings saved", {
        description: "Your preferences have been updated",
      });
    }, 800);
  };

  const resetAllSettings = () => {
    localStorage.removeItem("appearanceSettings");
    localStorage.removeItem("notificationSettings");
    localStorage.removeItem("displaySettings");
    localStorage.removeItem("accountSettings");
    
    toast.info("Settings reset", {
      description: "All preferences restored to defaults",
    });
    
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <div className="text-sm text-muted-foreground">
          Manage your account preferences
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
        </TabsList>

        {/* Account Settings */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                Manage your account details. Changes will be reflected across all devices.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={account.name}
                  onChange={(e) => handleAccountChange("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={account.username}
                  onChange={(e) => handleAccountChange("username", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={account.email}
                  onChange={(e) => handleAccountChange("email", e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button
                onClick={saveAccountSettings}
                disabled={isSaving}
              >
                {isSaving && activeTab === "account" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Save Account Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how this app looks on your device.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-1">
                    <Label>Theme</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose between light, dark, or system theme
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant={appearance.theme === "light" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleAppearanceChange("theme", "light")}
                    >
                      Light
                    </Button>
                    <Button
                      variant={appearance.theme === "dark" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleAppearanceChange("theme", "dark")}
                    >
                      Dark
                    </Button>
                    <Button
                      variant={appearance.theme === "system" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleAppearanceChange("theme", "system")}
                    >
                      System
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4">
                  <div className="space-y-1">
                    <Label>Interface Density</Label>
                    <p className="text-sm text-muted-foreground">
                      Adjust the spacing of interface elements
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={appearance.density === "comfortable" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleAppearanceChange("density", "comfortable")}
                    >
                      Comfortable
                    </Button>
                    <Button
                      variant={appearance.density === "compact" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleAppearanceChange("density", "compact")}
                    >
                      Compact
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button
                onClick={saveAppearanceSettings}
                disabled={isSaving}
              >
                {isSaving && activeTab === "appearance" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Save Appearance Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive important account notifications via email
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notifications.email}
                    onCheckedChange={(checked) => handleNotificationChange("email", checked)}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get real-time updates on your device
                    </p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={notifications.push}
                    onCheckedChange={(checked) => handleNotificationChange("push", checked)}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketing-emails">Marketing Communications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive newsletters and promotional emails
                    </p>
                  </div>
                  <Switch
                    id="marketing-emails"
                    checked={notifications.marketing}
                    onCheckedChange={(checked) => handleNotificationChange("marketing", checked)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button
                onClick={saveNotificationSettings}
                disabled={isSaving}
              >
                {isSaving && activeTab === "notifications" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Save Notification Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Display Settings */}
        <TabsContent value="display">
          <Card>
            <CardHeader>
              <CardTitle>Display</CardTitle>
              <CardDescription>
                Customize display settings for your region.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <div className="relative">
                    <select
                      id="language"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      value={display.language}
                      onChange={(e) => handleDisplayChange("language", e.target.value)}
                    >
                      <option value="en">English</option>
                      <option value="fr">Français (French)</option>
                      <option value="de">Deutsch (German)</option>
                      <option value="es">Español (Spanish)</option>
                      <option value="zh">中文 (Chinese)</option>
                      <option value="ja">日本語 (Japanese)</option>
                    </select>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    This changes the language of the interface
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <div className="relative">
                    <select
                      id="timezone"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      value={display.timezone}
                      onChange={(e) => handleDisplayChange("timezone", e.target.value)}
                    >
                      <option value="utc">Coordinated Universal Time (UTC)</option>
                      <option value="est">Eastern Time (EST/EDT)</option>
                      <option value="cst">Central Time (CST/CDT)</option>
                      <option value="mst">Mountain Time (MST/MDT)</option>
                      <option value="pst">Pacific Time (PST/PDT)</option>
                      <option value="gmt">Greenwich Mean Time (GMT)</option>
                      <option value="cet">Central European Time (CET)</option>
                      <option value="ist">Indian Standard Time (IST)</option>
                    </select>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Affects how dates and times are displayed
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button
                onClick={saveDisplaySettings}
                disabled={isSaving}
              >
                {isSaving && activeTab === "display" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Save Display Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="text-center text-sm text-muted-foreground">
        <p>Settings are saved to your browser's local storage</p>
        <p className="mt-1">
          <button
            onClick={resetAllSettings}
            className="text-primary underline hover:text-primary/80"
          >
            Reset all settings to defaults
          </button>
        </p>
      </div>
    </div>
  );
}