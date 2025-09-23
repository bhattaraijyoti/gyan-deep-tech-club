// lib/getUserRole.ts
import { db } from "./firebase"
import { doc, getDoc } from "firebase/firestore"

export async function getUserRole(uid: string) {
  try {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return { systemRoles: ["user"], learningRoles: ["beginner"] };
    }
    const data = snap.data() || {};
    return {
      systemRoles: Array.isArray(data.systemRoles) ? data.systemRoles : ["user"],
      learningRoles: Array.isArray(data.learningRoles) ? data.learningRoles : ["beginner"],
    };
  } catch (error) {
    console.error("Error fetching user role:", error);
    return { systemRoles: ["user"], learningRoles: ["beginner"] };
  }
}