import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, getDoc, doc, Timestamp, orderBy, query } from "firebase/firestore";

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Timestamp;
}

// Send a new contact message
export async function sendMessage(message: Omit<ContactMessage, "id" | "createdAt">) {
  try {
    const messagesRef = collection(db, "messages");
    const docRef = await addDoc(messagesRef, {
      ...message,
      createdAt: Timestamp.now(),
    });
    return { ...message, id: docRef.id, createdAt: Timestamp.now() } as ContactMessage;
  } catch (error) {
    console.error("Failed to send message:", error);
    throw new Error("Could not send message");
  }
}

// Get all messages
export async function getMessages(): Promise<ContactMessage[]> {
  const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<ContactMessage, "id">),
  })) as ContactMessage[];
}

// Get a single message by ID
export async function getMessageById(messageId: string): Promise<ContactMessage | null> {
  const docRef = doc(db, "messages", messageId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<ContactMessage, "id">) } as ContactMessage;
}
