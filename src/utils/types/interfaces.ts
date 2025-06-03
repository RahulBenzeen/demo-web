export interface Post {
  id: string;
  title: string;
  body: string;
  excerpt?: string;
  coverImage?: string;
  tags: string[];
  category: string;
  authorId: string;
  authorName: string;
  authorImage?: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  views: number;
  likedBy: string[];
  comments: Comment[];
}

export interface Reply {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  text: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  text: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
  replies?: Reply[];
  isEdited?: boolean;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  postCount: number;
  createdAt: string;
}

export interface PostsResponse {
  posts: Post[];
  hasMore: boolean;
  lastDocId: string | null;
}

// Add to your existing interfaces
export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  location?: string;
  website?: string;
  username?: string;
  createdAt: string;
  postCount: number;
  followerCount: number;
  followingCount: number;
}

export interface FirebaseQueryArgs {
  url: string
  method: string
  body?: any
  params?: Record<string, any>
  id?: string
}


export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  error?: string;
  height?: string;
  maxHeight?: string;
}

export interface Command {
  icon: React.ReactNode;
  title: string;
  command: string;
  value?: string;
  shortcut?: string;
}
