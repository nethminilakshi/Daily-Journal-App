import { db } from "@/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
  serverTimestamp,
} from "firebase/firestore";

// TYPES
// ================================================================

export type MoodType =
  | "happy"
  | "sad"
  | "stressed"
  | "relaxed"
  | "excited"
  | "anxious"
  | "neutral";

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: MoodType;
  createdAt: Date;
  updatedAt?: Date;
  userId?: string;
}

export interface CreateJournalEntryData {
  title: string;
  content: string;
  mood: MoodType;
  userId?: string;
}

export interface UpdateJournalEntryData {
  title?: string;
  content?: string;
  mood?: MoodType;
}

// COLLECTION REFERENCE
// ================================================================

export const journalColRef = collection(db, "journalEntry");

// FIREBASE FIRESTORE OPERATIONS
// ================================================================

export const createJournalEntry = async (entry: CreateJournalEntryData) => {
  // Validate input data
  if (!entry.title.trim()) {
    throw new Error("Please enter a title for your journal entry");
  }

  if (!entry.content.trim()) {
    throw new Error("Please write something in your journal entry");
  }

  if (!entry.mood) {
    throw new Error("Please select your mood");
  }

  try {
    const docRef = await addDoc(journalColRef, {
      title: entry.title.trim(),
      content: entry.content.trim(),
      mood: entry.mood,
      ...(entry.userId && { userId: entry.userId }),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding journal entry:", error);
    throw new Error("Failed to save your journal entry. Please try again.");
  }
};

export const updateJournalEntry = async (
  id: string,
  entry: UpdateJournalEntryData
) => {
  try {
    const docRef = doc(db, "journalEntry", id);
    
    // First check if document exists
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error("Journal entry not found");
    }

    const updateData: any = {
      updatedAt: serverTimestamp(),
    };

    if (entry.title !== undefined) {
      if (!entry.title.trim()) {
        throw new Error("Title cannot be empty");
      }
      updateData.title = entry.title.trim();
    }

    if (entry.content !== undefined) {
      if (!entry.content.trim()) {
        throw new Error("Content cannot be empty");
      }
      updateData.content = entry.content.trim();
    }

    if (entry.mood !== undefined) {
      updateData.mood = entry.mood;
    }

    console.log("Updating document with data:", updateData);
    await updateDoc(docRef, updateData);
    console.log("Document successfully updated");
    
    return id;
  } catch (error) {
    console.error("Error updating journal entry:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to update journal entry. Please try again.");
  }
};

export const deleteJournalEntry = async (id: string) => {
  try {
    const docRef = doc(db, "journalEntry", id);
    
    // Check if document exists before deleting
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error("Journal entry not found");
    }
    
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting journal entry:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to delete journal entry. Please try again.");
  }
};

export const getAllJournalEntries = async () => {
  try {
    const q = query(journalColRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const journalList = snapshot.docs.map((journalRef) => {
      const data = journalRef.data();
      return {
        id: journalRef.id,
        title: data.title,
        content: data.content,
        mood: data.mood,
        createdAt: data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : new Date(data.createdAt),
        updatedAt: data.updatedAt 
          ? (data.updatedAt instanceof Timestamp
              ? data.updatedAt.toDate()
              : new Date(data.updatedAt))
          : undefined,
        ...(data.userId && { userId: data.userId }),
      };
    }) as JournalEntry[];
    return journalList;
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    throw new Error("Failed to fetch journal entries");
  }
};

export const getJournalEntryById = async (id: string) => {
  try {
    const journalDocRef = doc(db, "journalEntry", id);
    const snapshot = await getDoc(journalDocRef);

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data();
    const entry: JournalEntry = {
      id: snapshot.id,
      title: data.title,
      content: data.content,
      mood: data.mood,
      createdAt: data.createdAt instanceof Timestamp
        ? data.createdAt.toDate()
        : new Date(data.createdAt),
      updatedAt: data.updatedAt 
        ? (data.updatedAt instanceof Timestamp
            ? data.updatedAt.toDate()
            : new Date(data.updatedAt))
        : undefined,
      ...(data.userId && { userId: data.userId }),
    };

    return entry;
  } catch (error) {
    console.error("Error fetching journal entry:", error);
    throw new Error("Failed to fetch journal entry");
  }
};

export const getAllJournalEntriesByUserId = async (userId: string) => {
  try {
    const q = query(
      journalColRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const journalList = querySnapshot.docs.map((journalRef) => {
      const data = journalRef.data();
      return {
        id: journalRef.id,
        title: data.title,
        content: data.content,
        mood: data.mood,
        createdAt: data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : new Date(data.createdAt),
        updatedAt: data.updatedAt 
          ? (data.updatedAt instanceof Timestamp
              ? data.updatedAt.toDate()
              : new Date(data.updatedAt))
          : undefined,
        userId: data.userId,
      };
    }) as JournalEntry[];
    return journalList;
  } catch (error) {
    console.error("Error fetching user journal entries:", error);
    throw new Error("Failed to fetch user journal entries");
  }
};

// Additional journal-specific queries
export const getJournalEntriesByMood = async (mood: MoodType) => {
  try {
    const q = query(
      journalColRef,
      where("mood", "==", mood),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const journalList = querySnapshot.docs.map((journalRef) => {
      const data = journalRef.data();
      return {
        id: journalRef.id,
        title: data.title,
        content: data.content,
        mood: data.mood,
        createdAt: data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : new Date(data.createdAt),
        updatedAt: data.updatedAt 
          ? (data.updatedAt instanceof Timestamp
              ? data.updatedAt.toDate()
              : new Date(data.updatedAt))
          : undefined,
        ...(data.userId && { userId: data.userId }),
      };
    }) as JournalEntry[];
    return journalList;
  } catch (error) {
    console.error("Error fetching journal entries by mood:", error);
    throw new Error("Failed to fetch journal entries by mood");
  }
};

export const getRecentJournalEntries = async (limitCount: number = 10) => {
  try {
    const q = query(
      journalColRef,
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    const journalList = querySnapshot.docs.map((journalRef) => {
      const data = journalRef.data();
      return {
        id: journalRef.id,
        title: data.title,
        content: data.content,
        mood: data.mood,
        createdAt: data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : new Date(data.createdAt),
        updatedAt: data.updatedAt 
          ? (data.updatedAt instanceof Timestamp
              ? data.updatedAt.toDate()
              : new Date(data.updatedAt))
          : undefined,
        ...(data.userId && { userId: data.userId }),
      };
    }) as JournalEntry[];
    return journalList;
  } catch (error) {
    console.error("Error fetching recent journal entries:", error);
    throw new Error("Failed to fetch recent journal entries");
  }
};

export const getTodayJournalEntries = async () => {
  try {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    const q = query(
      journalColRef,
      where("createdAt", ">=", Timestamp.fromDate(startOfDay)),
      where("createdAt", "<", Timestamp.fromDate(endOfDay)),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const journalList = querySnapshot.docs.map((journalRef) => {
      const data = journalRef.data();
      return {
        id: journalRef.id,
        title: data.title,
        content: data.content,
        mood: data.mood,
        createdAt: data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : new Date(data.createdAt),
        updatedAt: data.updatedAt 
          ? (data.updatedAt instanceof Timestamp
              ? data.updatedAt.toDate()
              : new Date(data.updatedAt))
          : undefined,
        ...(data.userId && { userId: data.userId }),
      };
    }) as JournalEntry[];
    return journalList;
  } catch (error) {
    console.error("Error fetching today's journal entries:", error);
    throw new Error("Failed to fetch today's journal entries");
  }
};

export const getJournalEntriesByDateRange = async (
  startDate: Date,
  endDate: Date
) => {
  try {
    const q = query(
      journalColRef,
      where("createdAt", ">=", Timestamp.fromDate(startDate)),
      where("createdAt", "<=", Timestamp.fromDate(endDate)),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const journalList = querySnapshot.docs.map((journalRef) => {
      const data = journalRef.data();
      return {
        id: journalRef.id,
        title: data.title,
        content: data.content,
        mood: data.mood,
        createdAt: data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : new Date(data.createdAt),
        updatedAt: data.updatedAt 
          ? (data.updatedAt instanceof Timestamp
              ? data.updatedAt.toDate()
              : new Date(data.updatedAt))
          : undefined,
        ...(data.userId && { userId: data.userId }),
      };
    }) as JournalEntry[];
    return journalList;
  } catch (error) {
    console.error("Error fetching journal entries by date range:", error);
    throw new Error("Failed to fetch journal entries by date range");
  }
};

// ================================================================
// SERVICE CLASS (WRAPPER FOR EASIER USAGE)
// ================================================================

class JournalService {
  // Basic CRUD operations
  async create(data: CreateJournalEntryData): Promise<string> {
    return await createJournalEntry(data);
  }

  async update(id: string, data: UpdateJournalEntryData): Promise<string> {
    return await updateJournalEntry(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return await deleteJournalEntry(id);
  }

  async getAll(): Promise<JournalEntry[]> {
    return await getAllJournalEntries();
  }

  async getById(id: string): Promise<JournalEntry | null> {
    return await getJournalEntryById(id);
  }

  async getByUserId(userId: string): Promise<JournalEntry[]> {
    return await getAllJournalEntriesByUserId(userId);
  }

  // Specialized queries
  async getByMood(mood: MoodType): Promise<JournalEntry[]> {
    return await getJournalEntriesByMood(mood);
  }

  async getRecent(limit: number = 10): Promise<JournalEntry[]> {
    return await getRecentJournalEntries(limit);
  }

  async getToday(): Promise<JournalEntry[]> {
    return await getTodayJournalEntries();
  }

  async getByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<JournalEntry[]> {
    return await getJournalEntriesByDateRange(startDate, endDate);
  }

  // Legacy method names for backward compatibility
  async getAllJournalEntries(): Promise<JournalEntry[]> {
    return await this.getAll();
  }

  async createJournalEntry(data: CreateJournalEntryData): Promise<string> {
    return await this.create(data);
  }
}

// ================================================================
// EXPORT DEFAULT SERVICE INSTANCE
// ================================================================

const journalService = new JournalService();
export default journalService;

// ================================================================
// MOCK API INTEGRATION (if you need it later)
// ================================================================
/*
import api from "./config/api";

export const getAllJournalFromAPI = async () => {
  const res = await api.get("/journal");
  return res.data;
};

export const addJournalToAPI = async (entry: any) => {
  const res = await api.post("/journal", entry);
  return res.data;
};
*/