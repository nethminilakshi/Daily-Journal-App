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
import { db } from "../../../firebase";
import { MoodType } from "../../../services/journalService";

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
      <View
        style={{
          flex: 1,
          backgroundColor: "#1c1c2b",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#B0C4DE" />
        <Text style={{ color: "#B0C4DE", marginTop: 16 }}>
          Loading journal entry...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0f0f1a" }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 48,
          paddingHorizontal: 24,
          paddingBottom: 16,
          backgroundColor: "#1a1a2e",
        }}
      >
        <TouchableOpacity onPress={handleCancel}>
          <Text style={{ fontSize: 28, color: "#E0E0E0" }}>‹</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 18, fontWeight: "600", color: "#F5F5F5" }}>
          {isNew ? "Add Journal Entry" : "Edit Journal Entry"}
        </Text>

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={{
            backgroundColor: "rgba(176, 196, 222, 0.8)",
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "rgba(176, 196, 222, 0.4)",
          }}
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>
              {isNew ? "✓" : "📝"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Date */}
        <View
          style={{
            paddingHorizontal: 24,
            paddingVertical: 20,
            backgroundColor: "rgba(255, 255, 255, 0.06)",
            borderBottomWidth: 1,
            borderBottomColor: "rgba(255, 255, 255, 0.1)",
          }}
        >
          <Text style={{ color: "#B0B0B0", fontSize: 18 }}>
            {getDisplayDate()}
          </Text>
        </View>

        {/* Mood Selector */}
        <View
          style={{
            paddingHorizontal: 24,
            paddingVertical: 24,
            backgroundColor: "rgba(176, 196, 222, 0.08)",
            borderBottomWidth: 1,
            borderBottomColor: "rgba(255, 255, 255, 0.1)",
          }}
        >
          <Text
            style={{
              color: "#E0E0E0",
              fontSize: 16,
              marginBottom: 12,
              fontWeight: "600",
            }}
          >
            How are you feeling?
          </Text>
          <TouchableOpacity
            onPress={handleMoodIconPress}
            style={{
              width: 64,
              height: 64,
              backgroundColor: "rgba(173, 216, 230, 0.15)",
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "rgba(173, 216, 230, 0.3)",
            }}
          >
            <Text style={{ fontSize: 32 }}>{getSelectedMoodEmoji()}</Text>
          </TouchableOpacity>
        </View>

        {/* Title Input */}
        <View
          style={{
            paddingHorizontal: 24,
            paddingVertical: 20,
            backgroundColor: "rgba(255, 255, 255, 0.06)",
            borderBottomWidth: 1,
            borderBottomColor: "rgba(255, 255, 255, 0.1)",
          }}
        >
          <Text
            style={{ color: "#E0E0E0", fontWeight: "600", marginBottom: 8 }}
          >
            Title *
          </Text>
          <TextInput
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (titleError) setTitleError("");
            }}
            placeholder="Enter your journal title"
            style={{
              fontSize: 20,
              fontWeight: "600",
              color: titleError ? "#FF6B6B" : "#F0F0F0",
            }}
            placeholderTextColor="#A0A0A0"
            multiline={false}
            maxLength={100}
          />
          {titleError ? (
            <Text style={{ color: "#FF6B6B", fontSize: 14, marginTop: 4 }}>
              {titleError}
            </Text>
          ) : null}
        </View>

        {/* Content Input */}
        <View
          style={{
            paddingHorizontal: 24,
            paddingVertical: 24,
            backgroundColor: "#1a1a2e",
            flex: 1,
          }}
        >
          <Text
            style={{ color: "#E0E0E0", fontWeight: "600", marginBottom: 12 }}
          >
            Your thoughts
          </Text>
          <View
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.08)",
              padding: 20,
              minHeight: 300,
            }}
          >
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Write your thoughts here..."
              style={{
                fontSize: 16,
                color: "#E0E0E0",
                flex: 1,
                lineHeight: 24,
              }}
              placeholderTextColor="#A0A0A0"
              multiline={true}
              textAlignVertical="top"
              maxLength={1000}
            />
          </View>
          <Text
            style={{
              color: "#A0A0A0",
              fontSize: 14,
              marginTop: 8,
              textAlign: "right",
            }}
          >
            {content.length}/1000
          </Text>
        </View>
      </ScrollView>

      {/* Mood Selection Modal */}
      {showMoodSelector && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#2d1e40",
              borderRadius: 24,
              padding: 32,
              marginHorizontal: 24,
              width: 320,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.1)",
            }}
          >
            <Text
              style={{
                fontSize: 22,
                fontWeight: "700",
                color: "#F5F5F5",
                textAlign: "center",
                marginBottom: 24,
              }}
            >
              How are you feeling?
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              {moodOptions.map((option) => (
                <TouchableOpacity
                  key={option.mood}
                  onPress={() => handleMoodSelect(option.mood)}
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor:
                      selectedMood === option.mood
                        ? `${option.color}30`
                        : "rgba(255, 255, 255, 0.08)",
                    borderWidth: selectedMood === option.mood ? 2 : 1,
                    borderColor:
                      selectedMood === option.mood
                        ? option.color
                        : "rgba(255, 255, 255, 0.15)",
                  }}
                >
                  <Text style={{ fontSize: 24 }}>{option.emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => setShowMoodSelector(false)}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.2)",
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: "#E0E0E0",
                  fontWeight: "600",
                }}
              >
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
