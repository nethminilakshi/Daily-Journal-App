import { db } from "@/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";

// Your existing interfaces
export interface JournalEntry {
  id: string;
  //userId: string;
  title: string;
  content: string;
  mood: MoodType;
  createdAt: Date;
}

export type MoodType =
  | "happy"
  | "sad"
  | "stressed"
  | "relaxed"
  | "excited"
  | "anxious"
  | "neutral";

class JournalService {
  private collectionName = "journalEntry";

  async getAllJournalEntries(): Promise<JournalEntry[]> {
    try {
      console.log("Fetching all journal entries..."); // Debug log

      const journalRef = collection(db, this.collectionName);
      const q = query(journalRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      console.log("Query snapshot size:", querySnapshot.size); // Debug log

      const entries: JournalEntry[] = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        console.log("Document data:", data); // Debug log

        // More robust date handling
        let createdAt: Date;
        if (data.createdAt instanceof Timestamp) {
          createdAt = data.createdAt.toDate();
        } else if (data.createdAt && typeof data.createdAt === "string") {
          createdAt = new Date(data.createdAt);
        } else if (data.createdAt && data.createdAt.toDate) {
          // Handle Firebase server timestamp
          createdAt = data.createdAt.toDate();
        } else {
          createdAt = new Date(); // Fallback to current date
        }

        entries.push({
          id: docSnapshot.id,
          title: data.title || "Untitled", // Provide fallback
          content: data.content || "", // Provide fallback
          mood: (data.mood as MoodType) || "neutral", // Provide fallback
          createdAt: createdAt,
        });
      });

      console.log("Processed entries:", entries.length); // Debug log
      return entries;
    } catch (error) {
      console.error("Error getting journal entries:", error);
      throw new Error(`Failed to fetch journal entries: ${error}`);
    }
  }

  async getJournalEntryById(entryId: string): Promise<JournalEntry | null> {
    try {
      console.log("Fetching journal entry by ID:", entryId); // Debug log

      const docRef = doc(db, this.collectionName, entryId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        // More robust date handling
        let createdAt: Date;
        if (data.createdAt instanceof Timestamp) {
          createdAt = data.createdAt.toDate();
        } else if (data.createdAt && typeof data.createdAt === "string") {
          createdAt = new Date(data.createdAt);
        } else if (data.createdAt && data.createdAt.toDate) {
          createdAt = data.createdAt.toDate();
        } else {
          createdAt = new Date();
        }

        return {
          id: docSnap.id,
          title: data.title || "Untitled",
          content: data.content || "",
          mood: (data.mood as MoodType) || "neutral",
          createdAt: createdAt,
        };
      } else {
        console.log("No document found with ID:", entryId);
        return null;
      }
    } catch (error) {
      console.error("Error getting journal entry:", error);
      throw new Error(`Failed to fetch journal entry: ${error}`);
    }
  }

  // Get journal entries by mood
  async getJournalEntriesByMood(mood: MoodType): Promise<JournalEntry[]> {
    try {
      console.log("Fetching entries by mood:", mood);

      const journalRef = collection(db, this.collectionName);
      const q = query(
        journalRef,
        where("mood", "==", mood),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);

      const entries: JournalEntry[] = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();

        let createdAt: Date;
        if (data.createdAt instanceof Timestamp) {
          createdAt = data.createdAt.toDate();
        } else if (data.createdAt && typeof data.createdAt === "string") {
          createdAt = new Date(data.createdAt);
        } else if (data.createdAt && data.createdAt.toDate) {
          createdAt = data.createdAt.toDate();
        } else {
          createdAt = new Date();
        }

        entries.push({
          id: docSnapshot.id,
          title: data.title || "Untitled",
          content: data.content || "",
          mood: (data.mood as MoodType) || "neutral",
          createdAt: createdAt,
        });
      });

      return entries;
    } catch (error) {
      console.error("Error getting journal entries by mood:", error);
      throw new Error(`Failed to fetch entries by mood: ${error}`);
    }
  }

  // Get recent journal entries (last N entries)
  async getRecentJournalEntries(
    limitCount: number = 10
  ): Promise<JournalEntry[]> {
    try {
      console.log("Fetching recent entries, limit:", limitCount);

      const journalRef = collection(db, this.collectionName);
      const q = query(
        journalRef,
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);

      const entries: JournalEntry[] = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();

        let createdAt: Date;
        if (data.createdAt instanceof Timestamp) {
          createdAt = data.createdAt.toDate();
        } else if (data.createdAt && typeof data.createdAt === "string") {
          createdAt = new Date(data.createdAt);
        } else if (data.createdAt && data.createdAt.toDate) {
          createdAt = data.createdAt.toDate();
        } else {
          createdAt = new Date();
        }

        entries.push({
          id: docSnapshot.id,
          title: data.title || "Untitled",
          content: data.content || "",
          mood: (data.mood as MoodType) || "neutral",
          createdAt: createdAt,
        });
      });

      return entries;
    } catch (error) {
      console.error("Error getting recent journal entries:", error);
      throw new Error(`Failed to fetch recent entries: ${error}`);
    }
  }

  // Get journal entries for today
  async getTodayJournalEntries(): Promise<JournalEntry[]> {
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

      console.log("Fetching today's entries:", startOfDay, "to", endOfDay);

      const journalRef = collection(db, this.collectionName);
      const q = query(
        journalRef,
        where("createdAt", ">=", Timestamp.fromDate(startOfDay)),
        where("createdAt", "<", Timestamp.fromDate(endOfDay)),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);

      const entries: JournalEntry[] = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();

        let createdAt: Date;
        if (data.createdAt instanceof Timestamp) {
          createdAt = data.createdAt.toDate();
        } else if (data.createdAt && typeof data.createdAt === "string") {
          createdAt = new Date(data.createdAt);
        } else if (data.createdAt && data.createdAt.toDate) {
          createdAt = data.createdAt.toDate();
        } else {
          createdAt = new Date();
        }

        entries.push({
          id: docSnapshot.id,
          title: data.title || "Untitled",
          content: data.content || "",
          mood: (data.mood as MoodType) || "neutral",
          createdAt: createdAt,
        });
      });

      return entries;
    } catch (error) {
      console.error("Error getting today's journal entries:", error);
      throw new Error(`Failed to fetch today's entries: ${error}`);
    }
  }

  // Get journal entries within a date range
  async getJournalEntriesByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<JournalEntry[]> {
    try {
      console.log("Fetching entries by date range:", startDate, "to", endDate);

      const journalRef = collection(db, this.collectionName);
      const q = query(
        journalRef,
        where("createdAt", ">=", Timestamp.fromDate(startDate)),
        where("createdAt", "<=", Timestamp.fromDate(endDate)),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);

      const entries: JournalEntry[] = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();

        let createdAt: Date;
        if (data.createdAt instanceof Timestamp) {
          createdAt = data.createdAt.toDate();
        } else if (data.createdAt && typeof data.createdAt === "string") {
          createdAt = new Date(data.createdAt);
        } else if (data.createdAt && data.createdAt.toDate) {
          createdAt = data.createdAt.toDate();
        } else {
          createdAt = new Date();
        }

        entries.push({
          id: docSnapshot.id,
          title: data.title || "Untitled",
          content: data.content || "",
          mood: (data.mood as MoodType) || "neutral",
          createdAt: createdAt,
        });
      });

      return entries;
    } catch (error) {
      console.error("Error getting journal entries by date range:", error);
      throw new Error(`Failed to fetch entries by date range: ${error}`);
    }
  }
}

export default new JournalService();
