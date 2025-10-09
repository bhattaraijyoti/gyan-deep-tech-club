import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  query,
} from "firebase/firestore";

export interface Announcement {
  id?: string;
  title: string;
  message: string;
  createdAt: any;
  createdBy: string; // uid of the admin who created it
  image?: string;
  category?: string;
  isPinned?: boolean;
  isImportant?: boolean;
  updatedAt?: any;
  description?: string;
}

// Create a new announcement
export async function createAnnouncement(announcement: Omit<Announcement, "id" | "createdAt" | "updatedAt">) {
  const announcementsRef = collection(db, "announcements");
  const docRef = await addDoc(announcementsRef, {
    ...announcement,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { ...announcement, id: docRef.id };
}

// Get all announcements (ordered by createdAt descending)
export async function getAnnouncements() {
  const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as Announcement[];
}

// Get a single announcement by id
export async function getAnnouncementById(announcementId: string) {
  const docRef = doc(db, "announcements", announcementId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Announcement;
}

// Update an announcement
export async function updateAnnouncement(announcementId: string, data: Partial<Announcement>) {
  const docRef = doc(db, "announcements", announcementId);
  const validData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
  await setDoc(docRef, { ...validData, updatedAt: serverTimestamp() }, { merge: true });
}

// Delete an announcement
export async function deleteAnnouncement(announcementId: string) {
  const docRef = doc(db, "announcements", announcementId);
  await deleteDoc(docRef);
}
