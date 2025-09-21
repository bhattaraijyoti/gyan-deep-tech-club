import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { app } from "./firebase";

const db = getFirestore(app);

/**
 * Creates or updates a user document in Firestore with roles as an array of progress levels and a roleType.
 * @param uid - Firebase user UID
 * @param email - user email
 * @param displayName - user display name
 * @param provider - auth provider (e.g., "google.com")
 * @param roles - optional array of progress roles, defaults to ["beginner"]
 * @param roleType - "student" or "admin", defaults to "student"
 */
export async function createUserDoc(
  uid: string,
  email: string,
  displayName: string,
  provider: string,
  roles: Array<"beginner" | "intermediate" | "advanced"> = ["beginner"],
  roleType: "student" | "admin" = "student"
): Promise<void> {
  const userRef = doc(db, "users", uid);
  await setDoc(
    userRef,
    {
      email,
      displayName,
      provider,
      role: roles,
      roleType,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
  console.log("✅ Firestore user doc created/updated");
}