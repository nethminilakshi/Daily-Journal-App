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

  const moodOptions = [
    { mood: "sad" as MoodType, emoji: "😢", color: "#E91E63" },
    { mood: "stressed" as MoodType, emoji: "😤", color: "#9C27B0" },
    { mood: "neutral" as MoodType, emoji: "😐", color: "#673AB7" },
    { mood: "happy" as MoodType, emoji: "😊", color: "#FF4081" },
    { mood: "excited" as MoodType, emoji: "🤩", color: "#E040FB" },
  ];

  useEffect(() => {
    const loadJournalEntry = async () => {
      if (!isNew && id) {
        try {
          setLoading(true);

          if (!id || typeof id !== "string" || id.trim() === "") {
            Alert.alert("Error", "Invalid journal entry ID", [
              { text: "OK", onPress: () => router.replace("/") },
            ]);
            return;
          }

          const docRef = doc(db, "journalEntry", id);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();

            const journalEntry: JournalEntry = {
              id: docSnap.id,
              title: data.title || "",
              content: data.content || "",
              mood: data.mood || null,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            };

            setTitle(journalEntry.title);
            setContent(journalEntry.content);
            setSelectedMood(journalEntry.mood);
            setInitialData(journalEntry);
          } else {
            Alert.alert("Error", "Journal entry not found", [
              { text: "OK", onPress: () => router.replace("/") },
            ]);
          }
        } catch (error) {
          Alert.alert("Error", "Failed to load journal entry", [
            { text: "OK", onPress: () => router.replace("/") },
          ]);
        } finally {
          setLoading(false);
        }
      }
    };

    loadJournalEntry();
  }, [id, isNew, router]);

  const getCurrentDate = (): string => {
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

  const getDisplayDate = (): string => {
    if (isNew || !initialData?.createdAt) {
      return getCurrentDate();
    }

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

  const getSelectedMoodEmoji = (): string => {
    if (!selectedMood) return "😐";
    const moodOption = moodOptions.find(
      (option) => option.mood === selectedMood
    );
    return moodOption?.emoji || "😐";
  };

  const handleMoodIconPress = () => {
    setShowMoodSelector(!showMoodSelector);
  };

  const handleMoodSelect = (mood: MoodType) => {
    setSelectedMood(mood);
    setShowMoodSelector(false);
  };

  const validateForm = (): boolean => {
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

      if (isNew) {
        const journalData = {
          title: title.trim(),
          content: content.trim(),
          mood: selectedMood,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await addDoc(collection(db, "journalEntry"), journalData);
        Alert.alert("Success", "Your journal entry has been saved!");
      } else {
        const journalData = {
          title: title.trim(),
          content: content.trim(),
          mood: selectedMood,
          updatedAt: serverTimestamp(),
        };

        const docRef = doc(db, "journalEntry", id);
        await updateDoc(docRef, journalData);
        Alert.alert("Success", "Your journal entry has been updated!");
      }

      router.replace("/");
    } catch (error) {
      Alert.alert(
        "Error",
        `Failed to ${isNew ? "save" : "update"} your journal entry. Please try again.`
      );
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = (): boolean => {
    if (isNew) {
      return !!(title.trim() || content.trim());
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
            onPress: () => router.replace("/"),
          },
        ]
      );
    } else {
      router.replace("/");
    }
  };

  const renderLoadingState = () => (
    <View
      style={{
        flex: 1,
        backgroundColor: "#F3E5F5",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator size="large" color="#9C27B0" />
      <Text style={{ color: "#7B1FA2", marginTop: 16 }}>
        Loading journal entry...
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 48,
        paddingHorizontal: 24,
        paddingBottom: 16,
        backgroundColor: "#F3E5F5",
      }}
    >
      <TouchableOpacity onPress={handleCancel}>
        <Text style={{ fontSize: 28, color: "#AD1457" }}>‹</Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 18, fontWeight: "600", color: "#AD1457" }}>
        {isNew ? "Add Journal Entry" : "Edit Journal Entry"}
      </Text>

      <TouchableOpacity
        onPress={handleSave}
        disabled={saving}
        style={{
          backgroundColor: "#CE93D8",
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: "#BA68C8",
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
  );

  const renderDateSection = () => (
    <View
      style={{
        paddingHorizontal: 24,
        paddingVertical: 20,
        backgroundColor: "#E1BEE7",
      }}
    >
      <Text style={{ color: "white", fontSize: 18, fontWeight: "500" }}>
        {getDisplayDate()}
      </Text>
    </View>
  );

  const renderMoodSelector = () => (
    <View
      style={{
        paddingHorizontal: 24,
        paddingVertical: 24,
        backgroundColor: "#E7D3D3",
      }}
    >
      <Text
        style={{
          color: "white",
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
          backgroundColor: "rgba(255, 255, 255, 0.5)",
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 2,
          borderColor: "white",
        }}
      >
        <Text style={{ fontSize: 32 }}>{getSelectedMoodEmoji()}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTitleInput = () => (
    <View
      style={{
        paddingHorizontal: 24,
        paddingVertical: 20,
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        borderBottomWidth: 2,
        borderBottomColor: "#D25D5D",
      }}
    >
      <Text style={{ color: "#AD1457", fontWeight: "600", marginBottom: 8 }}>
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
          color: titleError ? "#FF6B6B" : "#AD1457",
        }}
        placeholderTextColor="#BA68C8"
        multiline={false}
        maxLength={100}
      />
      {titleError ? (
        <Text style={{ color: "#EC407A", fontSize: 14, marginTop: 4 }}>
          {titleError}
        </Text>
      ) : null}
    </View>
  );

  const renderContentInput = () => (
    <View
      style={{
        paddingHorizontal: 24,
        paddingVertical: 24,
        backgroundColor: "#F3E5F5",
        flex: 1,
      }}
    >
      <Text style={{ color: "#AD1457", fontWeight: "600", marginBottom: 12 }}>
        Your thoughts
      </Text>
      <View
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.4)",
          borderRadius: 16,
          borderWidth: 2,
          borderColor: "#AD1457",
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
            color: "#7B1FA2",
            flex: 1,
            lineHeight: 24,
          }}
          placeholderTextColor="#BA68C8"
          multiline={true}
          textAlignVertical="top"
          maxLength={1000}
        />
      </View>
      <Text
        style={{
          color: "#9C27B0",
          fontSize: 14,
          marginTop: 8,
          textAlign: "right",
        }}
      >
        {content.length}/1000
      </Text>
    </View>
  );

  const renderMoodSelectionModal = () => (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(243, 229, 245, 0.95)",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 24,
          padding: 32,
          marginHorizontal: 24,
          width: 320,
          borderWidth: 2,
          borderColor: "#E1BEE7",
          shadowColor: "#9C27B0",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: "700",
            color: "#AD1457",
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
                    ? `${option.color}40`
                    : "#F8E1F8",
                borderWidth: selectedMood === option.mood ? 3 : 2,
                borderColor:
                  selectedMood === option.mood ? option.color : "#E1BEE7",
              }}
            >
              <Text style={{ fontSize: 24 }}>{option.emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => setShowMoodSelector(false)}
          style={{
            backgroundColor: "#F3E5F5",
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 16,
            borderWidth: 2,
            borderColor: "#CE93D8",
          }}
        >
          <Text
            style={{
              textAlign: "center",
              color: "#AD1457",
              fontWeight: "600",
            }}
          >
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return renderLoadingState();
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F3E5F5" }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#F3E5F5"
        translucent
      />

      {renderHeader()}

      <ScrollView style={{ flex: 1 }}>
        {renderDateSection()}
        {renderMoodSelector()}
        {renderTitleInput()}
        {renderContentInput()}
      </ScrollView>

      {showMoodSelector && renderMoodSelectionModal()}
    </View>
  );
};

export default JournalEntryScreen;
