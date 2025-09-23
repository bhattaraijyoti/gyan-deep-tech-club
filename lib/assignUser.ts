import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Creates or updates a user document in Firestore with a roleType.
 * @param uid - Firebase user UID
 * @param email - user email
 * @param displayName - user display name
 * @param provider - auth provider (e.g., "google.com")
 * @param roleType - "student" or "admin", defaults to "student"
 */
export async function createUserDoc(
  uid: string,
  email: string,
  displayName: string,
  provider: string,
  roleType: "student" | "admin" = "student"
): Promise<void> {
  try {
    const userRef = doc(db, "users", uid);
    await setDoc(
      userRef,
      {
        email,
        displayName,
        provider,
        roleType,
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
    console.log("✅ Firestore user doc created/updated");
  } catch (error) {
    console.error("❌ Error creating Firestore user doc:", error);
  }
}