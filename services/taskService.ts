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
} from "firebase/firestore";
import { JournalEntry } from "../types/JournalEntry";

// Collection reference
export const journalColRef = collection(db, "journalEntry");

// ================================================================
// FIREBASE FIRESTORE OPERATIONS
// ================================================================

export const createJournalEntry = async (entry: Omit<JournalEntry, "id">) => {
  const docRef = await addDoc(journalColRef, {
    ...entry,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const updateJournalEntry = async (id: string, entry: JournalEntry) => {
  const docRef = doc(db, "journalEntry", id);
  const { id: _id, ...entryData } = entry;
  return await updateDoc(docRef, entryData);
};

export const deleteJournalEntry = async (id: string) => {
  const docRef = doc(db, "journalEntry", id);
  return await deleteDoc(docRef);
};

export const getAllJournalEntries = async () => {
  const q = query(journalColRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  const journalList = snapshot.docs.map((journalRef) => ({
    id: journalRef.id,
    ...journalRef.data(),
    createdAt:
      journalRef.data().createdAt instanceof Timestamp
        ? journalRef.data().createdAt.toDate()
        : new Date(journalRef.data().createdAt),
  })) as JournalEntry[];
  return journalList;
};

export const getJournalEntryById = async (id: string) => {
  const journalDocRef = doc(db, "journalEntry", id);
  const snapshot = await getDoc(journalDocRef);
  const entry = snapshot.exists()
    ? ({
        id: snapshot.id,
        ...snapshot.data(),
        createdAt:
          snapshot.data().createdAt instanceof Timestamp
            ? snapshot.data().createdAt.toDate()
            : new Date(snapshot.data().createdAt),
      } as JournalEntry)
    : null;
  return entry;
};

export const getAllJournalEntriesByUserId = async (userId: string) => {
  const q = query(
    journalColRef,
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  const journalList = querySnapshot.docs.map((journalRef) => ({
    id: journalRef.id,
    ...journalRef.data(),
    createdAt:
      journalRef.data().createdAt instanceof Timestamp
        ? journalRef.data().createdAt.toDate()
        : new Date(journalRef.data().createdAt),
  })) as JournalEntry[];
  return journalList;
};

// Additional journal-specific queries
export const getJournalEntriesByMood = async (mood: string) => {
  const q = query(
    journalColRef,
    where("mood", "==", mood),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  const journalList = querySnapshot.docs.map((journalRef) => ({
    id: journalRef.id,
    ...journalRef.data(),
    createdAt:
      journalRef.data().createdAt instanceof Timestamp
        ? journalRef.data().createdAt.toDate()
        : new Date(journalRef.data().createdAt),
  })) as JournalEntry[];
  return journalList;
};

export const getRecentJournalEntries = async (limitCount: number = 10) => {
  const q = query(
    journalColRef,
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  const journalList = querySnapshot.docs.map((journalRef) => ({
    id: journalRef.id,
    ...journalRef.data(),
    createdAt:
      journalRef.data().createdAt instanceof Timestamp
        ? journalRef.data().createdAt.toDate()
        : new Date(journalRef.data().createdAt),
  })) as JournalEntry[];
  return journalList;
};

export const getTodayJournalEntries = async () => {
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
  const journalList = querySnapshot.docs.map((journalRef) => ({
    id: journalRef.id,
    ...journalRef.data(),
    createdAt:
      journalRef.data().createdAt instanceof Timestamp
        ? journalRef.data().createdAt.toDate()
        : new Date(journalRef.data().createdAt),
  })) as JournalEntry[];
  return journalList;
};

export const getJournalEntriesByDateRange = async (
  startDate: Date,
  endDate: Date
) => {
  const q = query(
    journalColRef,
    where("createdAt", ">=", Timestamp.fromDate(startDate)),
    where("createdAt", "<=", Timestamp.fromDate(endDate)),
    orderBy("createdAt", "desc")
  );

  const querySnapshot = await getDocs(q);
  const journalList = querySnapshot.docs.map((journalRef) => ({
    id: journalRef.id,
    ...journalRef.data(),
    createdAt:
      journalRef.data().createdAt instanceof Timestamp
        ? journalRef.data().createdAt.toDate()
        : new Date(journalRef.data().createdAt),
  })) as JournalEntry[];
  return journalList;
};

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
