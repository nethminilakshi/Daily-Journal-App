import { db } from "@/firebase";
import { MoodType } from "@/services/journalService";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: MoodType;
  createdAt: any;
  updatedAt?: any;
}

const JournalEntryScreen = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isNew = !id || id === "new";
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [titleError, setTitleError] = useState("");
  const [initialData, setInitialData] = useState<JournalEntry | null>(null);

  // Mood options with emojis
  const moodOptions = [
    { mood: "sad" as MoodType, emoji: "😢", color: "#EC4899" },
    { mood: "stressed" as MoodType, emoji: "😤", color: "#F97316" },
    { mood: "neutral" as MoodType, emoji: "😐", color: "#A855F7" },
    { mood: "happy" as MoodType, emoji: "😊", color: "#3B82F6" },
    { mood: "excited" as MoodType, emoji: "🤩", color: "#06B6D4" },
  ];

  // Load existing journal entry if editing
  useEffect(() => {
    const loadJournalEntry = async () => {
      if (!isNew && id) {
        try {
          setLoading(true);

          // Enhanced debugging
          console.log("=== LOADING JOURNAL ENTRY DEBUG ===");
          console.log("isNew:", isNew);
          console.log("id:", id);
          console.log("id type:", typeof id);
          console.log("id length:", id?.length);

          // Check if ID is valid
          if (!id || typeof id !== "string" || id.trim() === "") {
            console.error("Invalid ID provided:", id);
            Alert.alert("Error", "Invalid journal entry ID", [
              { text: "OK", onPress: () => router.back() },
            ]);
            return;
          }

          const docRef = doc(db, "journalEntry", id);
          console.log("Document reference path:", docRef.path);
          console.log("Document reference id:", docRef.id);

          const docSnap = await getDoc(docRef);
          console.log("Document exists:", docSnap.exists());
          console.log("Document metadata:", docSnap.metadata);

          if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("Document data:", data);

            const journalEntry: JournalEntry = {
              id: docSnap.id,
              title: data.title || "",
              content: data.content || "",
              mood: data.mood || null,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            };

            // Set form data
            setTitle(journalEntry.title);
            setContent(journalEntry.content);
            setSelectedMood(journalEntry.mood);
            setInitialData(journalEntry);

            console.log("Form data set successfully:", {
              title: journalEntry.title,
              content: journalEntry.content,
              mood: journalEntry.mood,
            });
          } else {
            console.error("=== DOCUMENT NOT FOUND DEBUG ===");
            console.error("Document ID:", id);
            console.error("Collection: journalEntry");
            console.error("Full path:", `journalEntry/${id}`);
            console.error("Document reference:", docRef);

            // Check if it might be a collection name issue
            console.error("Possible issues:");
            console.error("1. Document doesn't exist in Firestore");
            console.error(
              "2. Collection name might be 'journalEntries' instead of 'journalEntry'"
            );
            console.error("3. Security rules blocking access");
            console.error("4. Document ID is incorrect");

            Alert.alert("Error", "Journal entry not found", [
              { text: "OK", onPress: () => router.back() },
            ]);
          }
        } catch (error) {
          console.error("=== ERROR LOADING JOURNAL ENTRY ===");
          console.error("Error:", error);

          Alert.alert("Error", "Failed to load journal entry", [
            { text: "OK", onPress: () => router.back() },
          ]);
        } finally {
          setLoading(false);
        }
      } else {
        console.log(
          "Creating new journal entry (isNew:",
          isNew,
          ", id:",
          id,
          ")"
        );
      }
    };

    loadJournalEntry();
  }, [id, isNew, router]);

  const handleMoodIconPress = () => {
    setShowMoodSelector(!showMoodSelector);
  };

  const handleMoodSelect = (mood: MoodType) => {
    setSelectedMood(mood);
    setShowMoodSelector(false);
  };

  const validateForm = () => {
    let isValid = true;
    setTitleError("");

    if (!title.trim()) {
      setTitleError("Title is required");
      isValid = false;
    } else if (title.trim().length < 3) {
      setTitleError("Title must be at least 3 characters");
      isValid = false;
    }

    if (!content.trim()) {
      Alert.alert("Error", "Please write something in your journal entry");
      isValid = false;
    }

    if (!selectedMood) {
      Alert.alert("Error", "Please select your mood");
      isValid = false;
    }

    return isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      console.log("=== SAVING JOURNAL ENTRY ===");
      console.log("isNew:", isNew, ", id:", id);

      if (isNew) {
        // Create new journal entry
        const journalData = {
          title: title.trim(),
          content: content.trim(),
          mood: selectedMood,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        console.log("Creating new document with data:", journalData);
        const docRef = await addDoc(
          collection(db, "journalEntry"),
          journalData
        );
        console.log("✅ NEW DOCUMENT CREATED WITH ID:", docRef.id);
        console.log("🔗 Use this ID to test editing:", docRef.id);
        Alert.alert("Success", "Your journal entry has been saved!");
      } else {
        // Update existing journal entry
        const journalData = {
          title: title.trim(),
          content: content.trim(),
          mood: selectedMood,
          updatedAt: serverTimestamp(),
        };

        console.log("Updating document with ID:", id);
        console.log("Update data:", journalData);
        const docRef = doc(db, "journalEntry", id);
        await updateDoc(docRef, journalData);
        console.log("✅ DOCUMENT UPDATED WITH ID:", id);
        Alert.alert("Success", "Your journal entry has been updated!");
      }

      router.back();
    } catch (error) {
      console.error("=== ERROR SAVING DOCUMENT ===");
      console.error("Error:", error);
      console.error("isNew:", isNew, ", id:", id);

      Alert.alert(
        "Error",
        `Failed to ${isNew ? "save" : "update"} your journal entry. Please try again.`
      );
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = () => {
    if (isNew) {
      return title.trim() || content.trim();
    }

    if (!initialData) return false;

    return (
      title.trim() !== initialData.title ||
      content.trim() !== initialData.content ||
      selectedMood !== initialData.mood
    );
  };

  const handleCancel = () => {
    if (hasChanges()) {
      Alert.alert(
        "Discard Changes",
        `Are you sure you want to discard your ${isNew ? "journal entry" : "changes"}?`,
        [
          { text: "Keep Writing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const getCurrentDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };
    return now.toLocaleDateString("en-US", options);
  };

  const getDisplayDate = () => {
    if (isNew || !initialData?.createdAt) {
      return getCurrentDate();
    }

    // Handle Firestore Timestamp
    let date: Date;
    if (initialData.createdAt instanceof Timestamp) {
      date = initialData.createdAt.toDate();
    } else if (initialData.createdAt?.toDate) {
      date = initialData.createdAt.toDate();
    } else {
      date = new Date(initialData.createdAt);
    }

    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };
    return date.toLocaleDateString("en-US", options);
  };

  const getSelectedMoodEmoji = () => {
    if (!selectedMood) return "😐";
    const moodOption = moodOptions.find(
      (option) => option.mood === selectedMood
    );
    return moodOption?.emoji || "😐";
  };

  // Show loading spinner while loading existing entry
  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#EC4899" />
        <Text className="text-gray-600 mt-4">Loading journal entry...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <View className="flex-row justify-between items-center pt-12 px-6 pb-4 bg-white">
        <TouchableOpacity onPress={handleCancel}>
          <Text className="text-2xl text-gray-700">‹</Text>
        </TouchableOpacity>

        <Text className="text-lg font-semibold text-gray-800">
          {isNew ? "Add Journal Entry" : "Edit Journal Entry"}
        </Text>

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          className="bg-pink-400 px-6 py-2 rounded-full"
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-semibold">
              {isNew ? "Save" : "Update"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {/* Date */}
        <View className="px-6 py-4 bg-white border-b border-gray-100">
          <Text className="text-gray-600 text-lg">{getDisplayDate()}</Text>
        </View>

        {/* Mood Selector */}
        <View className="px-6 py-6 bg-white border-b border-gray-100">
          <Text className="text-gray-700 font-medium mb-3">
            How are you feeling?
          </Text>
          <TouchableOpacity
            onPress={handleMoodIconPress}
            className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center"
          >
            <Text className="text-3xl">{getSelectedMoodEmoji()}</Text>
          </TouchableOpacity>
        </View>

        {/* Title Input */}
        <View className="px-6 py-4 bg-white border-b border-gray-100">
          <Text className="text-gray-700 font-medium mb-2">Title *</Text>
          <TextInput
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (titleError) setTitleError("");
            }}
            placeholder="Enter your journal title"
            className={`text-xl font-medium ${
              titleError ? "text-red-600" : "text-gray-800"
            }`}
            placeholderTextColor="#9CA3AF"
            multiline={false}
            maxLength={100}
          />
          {titleError ? (
            <Text className="text-red-500 text-sm mt-1">{titleError}</Text>
          ) : null}
        </View>

        {/* Space between title and content */}
        <View className="h-4 bg-gray-50" />

        {/* Content Input */}
        <View className="px-6 py-4 bg-white flex-1">
          <Text className="text-gray-700 font-medium mb-3">Your thoughts</Text>
          <View className="bg-gray-50 rounded-xl border border-gray-200 p-4 min-h-[250px]">
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Write your thoughts here..."
              className="text-base text-gray-700 flex-1"
              placeholderTextColor="#9CA3AF"
              multiline={true}
              textAlignVertical="top"
              style={{ minHeight: 200 }}
              maxLength={1000}
            />
          </View>
          <Text className="text-gray-400 text-sm mt-2 text-right">
            {content.length}/1000
          </Text>
        </View>
      </ScrollView>

      {/* Mood Selection Modal */}
      {showMoodSelector && (
        <View className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <View className="bg-white rounded-3xl p-6 mx-6 w-80">
            <Text className="text-xl font-semibold text-gray-800 text-center mb-6">
              How are you feeling?
            </Text>

            <View className="flex-row justify-between items-center mb-6">
              {moodOptions.map((option) => (
                <TouchableOpacity
                  key={option.mood}
                  onPress={() => handleMoodSelect(option.mood)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    selectedMood === option.mood ? "ring-2 ring-blue-400" : ""
                  }`}
                  style={{
                    backgroundColor:
                      selectedMood === option.mood ? option.color : "#F3F4F6",
                  }}
                >
                  <Text className="text-2xl">{option.emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => setShowMoodSelector(false)}
              className="bg-gray-100 py-3 px-6 rounded-2xl"
            >
              <Text className="text-center text-gray-700 font-medium">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default JournalEntryScreen;
