"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
// import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"

export default function Profile() {
  const { currentUser, userProfile, logout, updateUserProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  // const [isUploading, setIsUploading] = useState(false)
  const [displayName, setDisplayName] = useState(userProfile?.displayName || "")
  const [bio, setBio] = useState(userProfile?.bio || "")
  // const fileInputRef = useRef<HTMLInputElement>(null)

  const navigate = useNavigate()
  const { toast } = useToast()

  if (!currentUser || !userProfile) {
    navigate("/sign-in")
    return null
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/sign-in")
    } catch  {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateUserProfile({
        displayName,
        bio,
      })

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })
    } catch  {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // const handleAvatarClick = () => {
  //   if (fileInputRef.current) {
  //     fileInputRef.current.click()
  //   }
  // }

  // const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0]
  //   if (!file) return

  //   setIsUploading(true)
  //   try {
  //     const storage = getStorage()
  //     const storageRef = ref(storage, `avatars/${currentUser.uid}/${Date.now()}-${file.name}`)

  //     await uploadBytes(storageRef, file)
  //     const photoURL = await getDownloadURL(storageRef)

  //     await updateUserProfile({ photoURL })

  //     toast({
  //       title: "Avatar updated",
  //       description: "Your profile picture has been updated successfully",
  //     })
  //   } catch (error) {
  //     toast({
  //       title: "Error",
  //       description: "Failed to upload image. Please try again.",
  //       variant: "destructive",
  //     })
  //   } finally {
  //     setIsUploading(false)
  //   }
  // }

  return (
    <div className="container max-w-4xl py-10">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="relative">
            <Avatar className="h-24 w-24" >
              {/* onClick={handleAvatarClick} */}
              {/* {isUploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : ( */}
                <>
                  <AvatarImage src={userProfile.photoURL || ""} />
                  <AvatarFallback className="text-2xl">
                    {userProfile.displayName?.charAt(0) || userProfile.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </>
              {/* // )} */}
              {/* <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2">
                <Camera className="h-4 w-4" />
              </div> */}
            </Avatar>
            {/* <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} /> */}
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold">{userProfile.displayName || "User"}</h1>
            <p className="text-muted-foreground">{userProfile.email}</p>
            {userProfile.bio && <p className="mt-2">{userProfile.bio}</p>}
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your profile information visible to other users</CardDescription>
              </CardHeader>
              <form onSubmit={handleProfileUpdate}>
                <CardContent className="space-y-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save changes"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>View your account details and membership information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label>Email</Label>
                  <p className="text-sm">{userProfile.email}</p>
                </div>
                <div className="space-y-1">
                  <Label>Account Type</Label>
                  <p className="text-sm capitalize">{userProfile.role || "User"}</p>
                </div>
                <div className="space-y-1">
                  <Label>Member Since</Label>
                  <p className="text-sm">
                    {userProfile.createdAt?.toDate ? userProfile.createdAt.toDate().toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label>Last Login</Label>
                  <p className="text-sm">
                    {userProfile.lastLogin
                      ? typeof userProfile.lastLogin === "string"
                        ? new Date(userProfile.lastLogin).toLocaleDateString()
                        : userProfile.lastLogin && typeof userProfile.lastLogin === "object" && "toDate" in userProfile.lastLogin && typeof userProfile.lastLogin.toDate === "function"
                          ? userProfile.lastLogin.toDate().toLocaleDateString()
                          : "N/A"
                      : "N/A"}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
