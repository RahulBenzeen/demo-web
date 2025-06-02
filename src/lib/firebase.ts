import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getMessaging } from "firebase/messaging"; // Add this
import { FIREBASE_CONFIG } from "../utils/firebaseInstance";


// Initialize Firebase
const app = initializeApp(FIREBASE_CONFIG);
const messaging = getMessaging(app); // Initialize messaging

// Initialize services
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)
const provider = new GoogleAuthProvider()

export { auth, db, storage, provider, messaging  }
