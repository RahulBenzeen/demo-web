import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  limit,
  orderBy,
  startAfter,
  addDoc,
  updateDoc,
  deleteDoc,
  increment,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  setDoc,
} from "firebase/firestore"
import { auth, db } from "./firebase"
import type { BaseQueryFn } from "@reduxjs/toolkit/query"
import type { Post } from "@/store/postApi"

interface FirebaseQueryArgs {
  url: string
  method: string
  body?: any
  params?: Record<string, any>
  id?: string
}

export const firebaseBaseQuery =
  (): BaseQueryFn<FirebaseQueryArgs, unknown, unknown> =>
  async ({ url, method, body, params, id }) => {
    try {
      console.log(`Firebase Query: ${method} ${url}`, {
        params,
        body,
        id,
        user: auth.currentUser?.uid,
      })

      const requiresAuth = ["POST", "PUT", "DELETE"].includes(method)
      if (requiresAuth && !auth.currentUser) {
        throw new Error("Authentication required")
      }

      // Check if post is saved by user
      if (url.startsWith("users/") && url.includes("/savedPosts/") && url.includes("/check")) {
        const parts = url.split("/")
        const userId = parts[1]
        const postId = parts[3]

        if (method === "GET") {
          const savedPostRef = doc(db, "users", userId, "savedPosts", postId)
          const savedPostSnap = await getDoc(savedPostRef)
          return { data: { isSaved: savedPostSnap.exists() } }
        }
      }

      // Get all posts
      if (url === "posts") {
        const postsRef = collection(db, "posts")
        let q = query(postsRef, orderBy("createdAt", "desc"))

        if (params?.category) q = query(q, where("category","==", params.category))
        if (params?.authorId) q = query(q, where("authorId", "==", params.authorId))
        if (params?.tags?.length) q = query(q, where("tags", "array-contains-any", params.tags))

        if (params?.lastDocId) {
          const lastDocRef = doc(db, "posts", params.lastDocId)
          const lastDocSnap = await getDoc(lastDocRef)
          if (lastDocSnap.exists()) {
            q = query(q, startAfter(lastDocSnap))
          }
        }

        if (params?.limit) {
          q = query(q, limit(params.limit))
        }

        const snapshot = await getDocs(q)
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
        }))

        return {
          data: {
            posts: data,
            hasMore: data.length === params?.limit,
            lastDocId: data.length > 0 ? data[data.length - 1].id : null,
          },
        }
      }

      // Saved posts operations
      if (url.startsWith("users/") && url.includes("/savedPosts")) {
        const parts = url.split("/")
        const userId = parts[1]
        const postId = parts[3]
        const savedPostsRef = collection(db, "users", userId, "savedPosts")

        if (method === "GET") {
          const snapshot = await getDocs(savedPostsRef)
          const posts = await Promise.all(
            snapshot.docs.map(async (doc) => {
              const postRef = doc.data().post
              const postSnap = await getDoc(postRef)
              const postData = postSnap.data() || {}
              return {
                ...postData,
                id: postSnap.id,
                savedAt: doc.data().savedAt?.toDate?.().toISOString(),
              }
            }),
          )
          return { data: posts }
        }

        if (method === "POST") {
          const postRef = doc(db, "posts", postId)
          await setDoc(doc(savedPostsRef, postId), {
            post: postRef,
            savedAt: serverTimestamp(),
          })
          return { data: { postId } }
        }

        if (method === "DELETE") {
          await deleteDoc(doc(savedPostsRef, postId))
          return { data: { postId } }
        }
      }

      // Single post operations
      if (url.startsWith("posts/") && !url.includes("/comments") && !url.includes("/like")) {
        const id = url.split("/")[1]
        const postRef = doc(db, "posts", id)

        if (method === "GET") {
          const docSnap = await getDoc(postRef)
          if (!docSnap.exists()) throw new Error("Post not found")

          const data = {
            id: docSnap.id,
            ...docSnap.data(),
            createdAt: docSnap.data().createdAt?.toDate?.() || new Date(),
            updatedAt: docSnap.data().updatedAt?.toDate?.() || new Date(),
          }

          try {
            await updateDoc(postRef, { views: increment(1) })
          } catch (err) {
            console.warn("View increment failed", err)
          }

          return { data }
        }

        if (method === "PUT") {
          await updateDoc(postRef, {
            ...body,
            updatedAt: serverTimestamp(),
          })
          return { data: { id, ...body } }
        }

        if (method === "DELETE") {
          await deleteDoc(postRef)
          return { data: { id } }
        }
      }

      // Likes operations
      if (url.includes("/like")) {
        const parts = url.split("/")
        const postId = parts[1]

        // Post like
        if (parts.length === 3 && parts[2] === "like") {
          const postRef = doc(db, "posts", postId)
          const userId = body?.userId || auth.currentUser?.uid

          const postDoc = await getDoc(postRef)
          if (!postDoc.exists()) throw new Error("Post not found")

          const postData = postDoc.data()
          const likedBy = postData.likedBy || []
          const isLiked = likedBy.includes(userId)

          if (isLiked) {
            await updateDoc(postRef, {
              likes: increment(-1),
              likedBy: arrayRemove(userId),
            })
            return { data: { liked: false, likes: Math.max(0, postData.likes - 1) } }
          } else {
            await updateDoc(postRef, {
              likes: increment(1),
              likedBy: arrayUnion(userId),
            })
            return { data: { liked: true, likes: postData.likes + 1 } }
          }
        }
        // Comment like
        else if (parts.length === 5 && parts[2] === "comments" && parts[4] === "like") {
          const commentId = parts[3]
          const commentRef = doc(db, "posts", postId, "comments", commentId)
          const userId = body?.userId || auth.currentUser?.uid

          const commentDoc = await getDoc(commentRef)
          if (!commentDoc.exists()) throw new Error("Comment not found")

          const commentData = commentDoc.data()
          const likedBy = commentData.likedBy || []
          const isLiked = likedBy.includes(userId)

          if (isLiked) {
            await updateDoc(commentRef, {
              likes: increment(-1),
              likedBy: arrayRemove(userId),
            })
          } else {
            await updateDoc(commentRef, {
              likes: increment(1),
              likedBy: arrayUnion(userId),
            })
          }
          return { data: { liked: !isLiked, likes: commentData.likes + (isLiked ? -1 : 1) } }
        }
        // Reply like
        else if (parts.length === 7 && parts[4] === "replies" && parts[6] === "like") {
          const commentId = parts[3]
          const replyId = parts[5]
          const replyRef = doc(db, "posts", postId, "comments", commentId, "replies", replyId)
          const userId = body?.userId || auth.currentUser?.uid

          const replyDoc = await getDoc(replyRef)
          if (!replyDoc.exists()) throw new Error("Reply not found")

          const replyData = replyDoc.data()
          const likedBy = replyData.likedBy || []
          const isLiked = likedBy.includes(userId)

          if (isLiked) {
            await updateDoc(replyRef, {
              likes: increment(-1),
              likedBy: arrayRemove(userId),
            })
          } else {
            await updateDoc(replyRef, {
              likes: increment(1),
              likedBy: arrayUnion(userId),
            })
          }
          return { data: { liked: !isLiked, likes: replyData.likes + (isLiked ? -1 : 1) } }
        }
      }

      // Comments operations
      if (url.includes("/comments")) {
        const parts = url.split("/")
        const postId = parts[1]

        // Handle replies operations
        if (parts.length >= 5 && parts[4] === "replies") {
          const commentId = parts[3]
          const repliesRef = collection(db, "posts", postId, "comments", commentId, "replies")

          if (method === "GET") {
            const q = query(repliesRef, orderBy("createdAt", "asc"))
            const repliesSnapshot = await getDocs(q)
            const replies = repliesSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate?.() || new Date(),
            }))
            return { data: replies }
          }

          if (method === "POST") {
            const reply = {
              ...body,
              userId: auth.currentUser?.uid,
              createdAt: serverTimestamp(),
              likes: 0,
              likedBy: [],
            }
            const docRef = await addDoc(repliesRef, reply)
            return { data: { id: docRef.id, ...reply } }
          }

          if (method === "DELETE" && parts.length === 6) {
            const replyId = parts[5]
            const replyDoc = doc(db, "posts", postId, "comments", commentId, "replies", replyId)
            await deleteDoc(replyDoc)
            return { data: { replyId } }
          }
        }
        // Handle main comments operations
        else {
          const commentsRef = collection(db, "posts", postId, "comments")

          if (method === "GET") {
            const q = query(commentsRef, orderBy("createdAt", "desc"))
            const commentsSnapshot = await getDocs(q)

            const commentsWithReplies = await Promise.all(
              commentsSnapshot.docs.map(async (commentDoc) => {
                const commentData = commentDoc.data()
                const repliesRef = collection(commentDoc.ref, "replies")
                const repliesSnapshot = await getDocs(query(repliesRef, orderBy("createdAt", "asc")))

                return {
                  id: commentDoc.id,
                  ...commentData,
                  createdAt: commentData.createdAt?.toDate?.() || new Date(),
                  replies: repliesSnapshot.docs.map((replyDoc) => ({
                    id: replyDoc.id,
                    ...replyDoc.data(),
                    createdAt: replyDoc.data().createdAt?.toDate?.() || new Date(),
                  })),
                }
              }),
            )

            return { data: commentsWithReplies }
          }

          if (method === "POST") {
            const comment = {
              ...body,
              userId: auth.currentUser?.uid,
              createdAt: serverTimestamp(),
              likes: 0,
              likedBy: [],
              replies: [],
            }
            const docRef = await addDoc(commentsRef, comment)
            return { data: { id: docRef.id, ...comment } }
          }

          // Update comment (for editing)
          if (method === "PUT" && parts.length === 4) {
            const commentId = parts[3]
            const commentRef = doc(db, "posts", postId, "comments", commentId)
            await updateDoc(commentRef, {
              text: body.text,
              updatedAt: serverTimestamp(),
              isEdited: true,
            })
            return { data: { commentId, text: body.text } }
          }

          if (method === "DELETE" && parts.length === 4) {
            const commentId = parts[3]
            const commentDoc = doc(db, "posts", postId, "comments", commentId)
            await deleteDoc(commentDoc)
            return { data: { commentId } }
          }
        }
      }

      // Categories
      if (url === "categories") {
        if (method === "GET") {
          const snapshot = await getDocs(query(collection(db, "categories"), orderBy("name")))
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          // console.log({data})
          return { data }
        }

        if (method === "POST") {
          const docRef = await addDoc(collection(db, "categories"), {
            ...body,
            createdAt: serverTimestamp(),
            postCount: 0,
          })
          return { data: { id: docRef.id, ...body } }
        }
      }

      // Search
      if (url === "search") {
        const postsRef = collection(db, "posts")
        const searchTerm = params?.q?.toLowerCase()
        const snapshot = await getDocs(query(postsRef, orderBy("createdAt", "desc")))

        const data = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }) as Post)
          .filter(
            (post) =>
              post.title?.toLowerCase().includes(searchTerm) ||
              post.body?.toLowerCase().includes(searchTerm) ||
              post.tags?.some((tag) => tag.toLowerCase().includes(searchTerm)),
          )

        return { data }
      }

      return { error: "Unsupported endpoint or method" }
    } catch (error: any) {
      console.error("Firebase query error:", error)
      if (error.code === "permission-denied") {
        return { error: "Permission denied. Please check your authentication status." }
      }
      return { error: error?.message || "Unknown error occurred" }
    }
  }
