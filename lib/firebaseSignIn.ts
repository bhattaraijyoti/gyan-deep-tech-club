// lib/firebaseSignIn.ts
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { app } from "./firebase";
import { createUserDoc } from "./assignUser";

const firebaseAuth = getAuth(app);

export async function firebaseSignIn() {
  try {
    const res = await fetch("/api/firebase-token", { method: "POST" });
    const data = await res.json();
    const token = data.token;
    if (!token) throw new Error("No Firebase token received");

    const cred = await signInWithCustomToken(firebaseAuth, token);
    await createUserDoc(cred.user.uid, cred.user.email || "");
    console.log("✅ Firebase sign-in successful");
  } catch (err: any) {
    console.error("❌ Firebase sign-in error:", err.message);
    throw err;
  }
}