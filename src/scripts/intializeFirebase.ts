import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

// Initialize categories collection
export const initializeCategories = async () => {
  console.log("iam called categories ")
  const categories = [
    {
      name: "Technology",
      description: "Latest tech trends and innovations",
      color: "#3B82F6",
      postCount: 0,
    },
    {
      name: "Business",
      description: "Business insights and strategies",
      color: "#10B981",
      postCount: 0,
    },
    {
      name: "Design",
      description: "UI/UX and design principles",
      color: "#F59E0B",
      postCount: 0,
    },
    {
      name: "Development",
      description: "Programming and development tutorials",
      color: "#8B5CF6",
      postCount: 0,
    },
    {
      name: "Lifestyle",
      description: "Life tips and personal development",
      color: "#EF4444",
      postCount: 0,
    },
  ]

  try {
    const categoriesRef = collection(db, "categories")

    for (const category of categories) {
      await addDoc(categoriesRef, {
        ...category,
        createdAt: serverTimestamp(),
      })
    }

    console.log("Categories initialized successfully!")
  } catch (error) {
    console.error("Error initializing categories:", error)
  }
}

// Call this function once to set up your categories
// initializeCategories();
