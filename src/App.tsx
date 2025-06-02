"use client";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/sidebar";
import { useState, lazy, Suspense } from "react";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { Toaster } from "@/components/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/protected-route";
import { ErrorBoundary } from "@/page/helpers/errorBoundary";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import NotFoundPage from "@/page/helpers/page-not-found";

// Lazy load pages
const PostsPage = lazy(() => import("@/page/posts/posts"));
const Contact = lazy(() => import("@/page/admin/contact"));
const Dashboard = lazy(() => import("@/page/admin/dashboard"));
const Settings = lazy(() => import("@/page/user/setting"));
const CreatePost = lazy(() => import("@/page/posts/create-posts"));
const PostDetail = lazy(() => import("@/page/posts/post-detail"));
const SignIn = lazy(() => import("@/page/user/login"));
const SignUp = lazy(() => import("@/page/user/register"));
const ForgotPassword = lazy(() => import("@/page/user/forgot-password"));
const Profile = lazy(() => import("@/page/user/profile"));
const SavedPosts = lazy(() => import("@/page/posts/saved-post"));
const MyPosts = lazy(() => import("@/page/posts/my-posts"));
const EditPost = lazy(() => import("@/page/posts/edit-posts"));
const UserProfilePage = lazy(() => import("@/page/user/user-profile"));

const App = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Provider store={store}>
      <ThemeProvider defaultTheme="system" storageKey="app-theme">
        <ErrorBoundary>
          <AuthProvider>
            <Router>
              <div className="flex h-screen overflow-hidden bg-background">
                <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

                {/* MAIN CONTENT AREA - PRESERVED ORIGINAL STRUCTURE */}
                <main className="flex-1 overflow-auto">
                  <div className="container mx-auto p-4 md:p-6">
                    <Suspense fallback={
                      <div className="flex justify-center items-center h-[80vh]">
                        <LoadingSpinner size="lg" />
                      </div>
                    }>
                      <Routes>
                        <Route path="/" element={<PostsPage />} />
                        <Route path="/:id" element={<PostDetail />} />
                        <Route
                          path="/create-post"
                          element={
                            <ProtectedRoute>
                              <CreatePost />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/edit-post/:id"
                          element={
                            <ProtectedRoute>
                              <EditPost />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/my-posts"
                          element={
                            <ProtectedRoute>
                              <MyPosts />
                            </ProtectedRoute>
                          }
                        />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/user/:userId" element={<UserProfilePage />} />
                        <Route
                          path="/dashboard"
                          element={
                            <ProtectedRoute adminOnly>
                              <Dashboard />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/settings"
                          element={
                            <ProtectedRoute>
                              <Settings />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/profile"
                          element={
                            <ProtectedRoute>
                              <Profile />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/saved"
                          element={
                            <ProtectedRoute>
                              <SavedPosts />
                            </ProtectedRoute>
                          }
                        />
                        <Route path="/sign-in" element={<SignIn />} />
                        <Route path="/sign-up" element={<SignUp />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </Suspense>
                  </div>
                </main>
              </div>
              <Toaster />
            </Router>
          </AuthProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </Provider>
  );
};

export default App;