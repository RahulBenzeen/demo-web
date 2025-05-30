import { createApi, type BaseQueryFn } from "@reduxjs/toolkit/query/react";
import { firebaseBaseQuery } from "../lib/firebaseBaseQuery";

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

function serializeTimestamps(obj: Record<string, any>): Record<string, any> {
  const copy = { ...obj };
  if (copy.createdAt?.toDate) {
    copy.createdAt = copy.createdAt.toDate().toISOString();
  }
  if (copy.updatedAt?.toDate) {
    copy.updatedAt = copy.updatedAt.toDate().toISOString();
  }
  if (Array.isArray(copy.comments)) {
    copy.comments = copy.comments.map((comment: any) => ({
      ...comment,
      createdAt:
        comment.createdAt?.toDate?.().toISOString?.() ?? comment.createdAt,
    }));
  }
  if (Array.isArray(copy.replies)) {
    copy.replies = copy.replies.map((reply: any) => ({
      ...reply,
      createdAt: reply.createdAt?.toDate?.().toISOString?.() ?? reply.createdAt,
    }));
  }
  return copy;
}

export const postsAPI = createApi({
  reducerPath: "postsApi",
  baseQuery: firebaseBaseQuery() as BaseQueryFn<
    {
      url: string;
      method: string;
      body?: any;
      params?: Record<string, any>;
      id?: string;
    },
    unknown,
    unknown
  >,
  tagTypes: ["Post", "Category", "Comment", "SavedPost"],
  endpoints: (builder) => ({
    getPosts: builder.query<
      PostsResponse,
      {
        limit?: number;
        category?: string;
        authorId?: string;
        tags?: string[];
        lastDocId?: string | null;
      }
    >({
      query: ({ limit = 9, category, authorId, tags, lastDocId }) => ({
        url: "posts",
        method: "GET",
        params: { limit, category, authorId, tags, lastDocId },
      }),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { lastDocId, ...filters } = queryArgs;
        return `${endpointName}(${JSON.stringify(filters)})`;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (!arg.lastDocId) {
          return {
            posts: newItems.posts.map(
              (post) => serializeTimestamps(post) as Post
            ),
            hasMore: newItems.hasMore,
            lastDocId: newItems.lastDocId,
          };
        }
        const existingIds = new Set(currentCache.posts.map((post) => post.id));
        const newUniquePosts = newItems.posts
          .filter((post) => !existingIds.has(post.id))
          .map((post) => serializeTimestamps(post) as Post);
        return {
          posts: [...currentCache.posts, ...newUniquePosts],
          hasMore: newItems.hasMore,
          lastDocId: newItems.lastDocId,
        };
      },
      forceRefetch({ currentArg, previousArg }) {
        if (!previousArg) return true;
        const { lastDocId: currentLastDoc, ...currentFilters } =
          currentArg || {};
        const { lastDocId: prevLastDoc, ...prevFilters } = previousArg || {};
        return JSON.stringify(currentFilters) !== JSON.stringify(prevFilters);
      },
      providesTags: (result) =>
        result
          ? [
              ...result.posts.map(({ id }) => ({ type: "Post" as const, id })),
              { type: "Post", id: "LIST" },
            ]
          : [{ type: "Post", id: "LIST" }],
      transformResponse: (response: any): PostsResponse => ({
        posts: response.posts.map(
          (post: any) => serializeTimestamps(post) as Post
        ),
        hasMore: response.hasMore,
        lastDocId: response.lastDocId,
      }),
    }),

    getPostById: builder.query<Post, string>({
      query: (id) => ({
        url: `posts/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Post", id }],
      transformResponse: (response: any) =>
        serializeTimestamps(response) as Post,
    }),

    createPost: builder.mutation<Post, Partial<Post>>({
      query: (newPost) => ({
        url: "posts",
        method: "POST",
        body: newPost,
      }),
      invalidatesTags: [
        { type: "Post", id: "LIST" },
        { type: "Category", id: "LIST" },
      ],
    }),

    updatePost: builder.mutation<Post, { id: string; post: Partial<Post> }>({
      query: ({ id, post }) => ({
        url: `posts/${id}`,
        method: "PUT",
        body: post,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Post", id },
        { type: "Post", id: "LIST" },
      ],
    }),

    deletePost: builder.mutation<void, string>({
      query: (id) => ({
        url: `posts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Post", id: "LIST" }],
    }),

    searchPosts: builder.query<Post[], string>({
      query: (searchTerm) => ({
        url: "search",
        method: "GET",
        params: { q: searchTerm },
      }),
      transformResponse: (response: any[]): Post[] =>
        response.map((post) => serializeTimestamps(post) as Post),
      providesTags: [{ type: "Post", id: "SEARCH" }],
    }),

    getCategories: builder.query<Category[], void>({
      query: () => ({
        url: "categories",
        method: "GET",
      }),
      transformResponse: (response: any[]): Category[] =>
        response.map((cat) => serializeTimestamps(cat) as Category),
      providesTags: [{ type: "Category", id: "LIST" }],
    }),

    createCategory: builder.mutation<Category, Partial<Category>>({
      query: (newCategory) => ({
        url: "categories",
        method: "POST",
        body: newCategory,
      }),
      invalidatesTags: [{ type: "Category", id: "LIST" }],
    }),

    addComment: builder.mutation<
      Comment,
      {
        postId: string;
        text: string;
        userId: string;
        userName: string;
        userImage?: string;
      }
    >({
      query: ({ postId, ...comment }) => ({
        url: `posts/${postId}/comments`,
        method: "POST",
        body: comment,
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "Post", id: postId },
      ],
    }),

    updateComment: builder.mutation<
      Comment,
      { postId: string; commentId: string; text: string }
    >({
      query: ({ postId, commentId, text }) => ({
        url: `posts/${postId}/comments/${commentId}`,
        method: "PUT",
        body: { text },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "Post", id: postId },
      ],
    }),

    getCommentsByPostId: builder.query<Comment[], string>({
      query: (postId) => ({
        url: `posts/${postId}/comments`,
        method: "GET",
      }),
      transformResponse: (res: any[]): Comment[] =>
        res.map((comment) => serializeTimestamps(comment) as Comment),
      providesTags: (result, error, postId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Comment" as const, id })),
              { type: "Comment", id: "LIST" },
            ]
          : [{ type: "Comment", id: "LIST" }],
    }),

    deleteComment: builder.mutation<
      void,
      { postId: string; commentId: string }
    >({
      query: ({ postId, commentId }) => ({
        url: `posts/${postId}/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "Post", id: postId },
      ],
    }),

    toggleLike: builder.mutation<
      { liked: boolean; likes: number },
      { postId: string; userId: string }
    >({
      query: ({ postId, userId }) => ({
        url: `posts/${postId}/like`,
        method: "POST",
        body: { userId },
      }),
      onQueryStarted: async (
        { postId, userId },
        { dispatch, queryFulfilled }
      ) => {
        const patchResult = dispatch(
          postsAPI.util.updateQueryData("getPostById", postId, (draft) => {
            const isLiked = draft.likedBy?.includes(userId);
            if (isLiked) {
              draft.likes -= 1;
              draft.likedBy = draft.likedBy.filter((id) => id !== userId);
            } else {
              draft.likes += 1;
              draft.likedBy.push(userId);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, { postId }) => [
        { type: "Post", id: postId },
      ],
    }),

    toggleCommentLike: builder.mutation<
      { liked: boolean; likes: number },
      { postId: string; commentId: string; userId: string }
    >({
      query: ({ postId, commentId, userId }) => ({
        url: `posts/${postId}/comments/${commentId}/like`,
        method: "POST",
        body: { userId },
      }),
      onQueryStarted: async (
        { postId, commentId, userId },
        { dispatch, queryFulfilled }
      ) => {
        const patchResult = dispatch(
          postsAPI.util.updateQueryData(
            "getCommentsByPostId",
            postId,
            (draft) => {
              const comment = draft.find((c) => c.id === commentId);

              if (comment) {
                if (typeof comment.likes !== "number") {
                  comment.likes = 0;
                }

                if (!Array.isArray(comment.likedBy)) {
                  comment.likedBy = [];
                }

                const isLiked = comment.likedBy.includes(userId);

                if (isLiked) {
                  comment.likes--;
                  comment.likedBy = comment.likedBy.filter(
                    (id) => id !== userId
                  );
                } else {
                  comment.likes++;
                  comment.likedBy.push(userId);
                }
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },

      invalidatesTags: (result, error, { postId }) => [
        { type: "Post", id: postId },
      ],
    }),

    addReply: builder.mutation<
      Reply,
      {
        postId: string;
        commentId: string;
        text: string;
        userId: string;
        userName: string;
        userImage?: string;
      }
    >({
      query: ({ postId, commentId, ...reply }) => ({
        url: `posts/${postId}/comments/${commentId}/replies`,
        method: "POST",
        body: {
          ...reply,
          likes: 0,
          likedBy: [],
          createdAt: new Date().toISOString(),
        },
      }),
      invalidatesTags: (result, error, { postId, commentId }) => [
        { type: "Post", id: postId },
        { type: "Comment", id: commentId },
      ],
    }),

    toggleReplyLike: builder.mutation<
      { liked: boolean; likes: number },
      {
        postId: string;
        commentId: string;
        replyId: string;
        userId: string;
      }
    >({
      query: ({ postId, commentId, replyId, userId }) => ({
        url: `posts/${postId}/comments/${commentId}/replies/${replyId}/like`,
        method: "POST",
        body: { userId },
      }),
      onQueryStarted: async (
        { postId, commentId, replyId, userId },
        { dispatch, queryFulfilled }
      ) => {
        const patchResult = dispatch(
          postsAPI.util.updateQueryData(
            "getCommentsByPostId",
            postId,
            (draft) => {
              const comment = draft.find((c) => c.id === commentId);
              const reply = comment?.replies?.find((r) => r.id === replyId);
              if (reply) {
                const isLiked = reply.likedBy.includes(userId);
                reply.likes += isLiked ? -1 : 1;
                reply.likedBy = isLiked
                  ? reply.likedBy.filter((id) => id !== userId)
                  : [...reply.likedBy, userId];
              }
            }
          )
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, { postId }) => [
        { type: "Post", id: postId },
      ],
    }),

    // Check if post is saved
    checkSavedPost: builder.query<
      { isSaved: boolean },
      { userId: string; postId: string }
    >({
      query: ({ userId, postId }) => ({
        url: `users/${userId}/savedPosts/${postId}/check`,
        method: "GET",
      }),
      providesTags: (result, error, { postId }) => [
        { type: "SavedPost", id: postId },
      ],
    }),

    getSavedPosts: builder.query<Post[], string>({
      query: (userId) => ({
        url: `users/${userId}/savedPosts`,
        method: "GET",
      }),
      transformResponse: (response: any[]): Post[] =>
        response.map((post) => serializeTimestamps(post) as Post),

      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Post" as const, id })),
              { type: "Post", id: "LIST" },
            ]
          : [{ type: "Post", id: "LIST" }],
    }),

    savePost: builder.mutation<void, { userId: string; postId: string }>({
      query: ({ userId, postId }) => ({
        url: `users/${userId}/savedPosts/${postId}`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "SavedPost", id: postId },
        { type: "Post", id: "LIST" },
      ],
    }),

    unsavePost: builder.mutation<void, { userId: string; postId: string }>({
      query: ({ userId, postId }) => ({
        url: `users/${userId}/savedPosts/${postId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "SavedPost", id: postId },
        { type: "Post", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetPostsQuery,
  useGetPostByIdQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useSearchPostsQuery,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useAddCommentMutation,
  useUpdateCommentMutation,
  useGetCommentsByPostIdQuery,
  useDeleteCommentMutation,
  useToggleLikeMutation,
  useToggleCommentLikeMutation,
  useAddReplyMutation,
  useToggleReplyLikeMutation,
  useCheckSavedPostQuery,
  useSavePostMutation,
  useUnsavePostMutation,
  useGetSavedPostsQuery,
} = postsAPI;
