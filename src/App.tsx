"use client";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { Sidebar } from "./components/sidebar";
import PostsPage from "./page/posts";
import Contact from "./page/contact";
import Dashboard from "./page/dashboard";
import Settings from "./page/setting";
import CreatePost from "./page/create-posts";
import PostDetail from "./page/post-detail";
import SignIn from "./page/login";
import SignUp from "./page/register";
import ForgotPassword from "./page/forgot-password";
import Profile from "./page/profile";
import { useState } from "react";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { Toaster } from "./components/toaster";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/protected-route";
import SavedPosts from "./page/saved-post";
import MyPosts from "./page/my-posts";
import EditPost from "./page/edit-posts";
import { ErrorBoundary } from "./page/errorBoundary";

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
                <main className="flex-1 overflow-auto">
                  <div className="container mx-auto p-4 md:p-6">
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
                      <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                      />
                    </Routes>
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
