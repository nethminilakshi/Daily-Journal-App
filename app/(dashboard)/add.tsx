import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
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
import journalService, { MoodType } from "../../services/journalService";

const AddJournalEntry = () => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [saving, setSaving] = useState(false);

  // Clear form when screen comes into focus (when navigating to this screen)
  useFocusEffect(
    useCallback(() => {
      // Reset all form fields when screen is focused
      setTitle("");
      setContent("");
      setSelectedMood(null);
      setShowMoodSelector(false);
      setSaving(false);
    }, [])
  );

  // Mood options with emojis
  const moodOptions = [
    { mood: "sad" as MoodType, emoji: "😢", color: "#EC4899" },
    { mood: "stressed" as MoodType, emoji: "😤", color: "#F97316" },
    { mood: "neutral" as MoodType, emoji: "😐", color: "#A855F7" },
    { mood: "happy" as MoodType, emoji: "😊", color: "#3B82F6" },
    { mood: "excited" as MoodType, emoji: "🤩", color: "#06B6D4" },
  ];

  const handleMoodIconPress = () => {
    setShowMoodSelector(!showMoodSelector);
  };

  const handleMoodSelect = (mood: MoodType) => {
    setSelectedMood(mood);
    setShowMoodSelector(false);
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setSelectedMood(null);
    setShowMoodSelector(false);
    setSaving(false);
  };

  const handleSave = async () => {
    // Early return if no mood selected
    if (!selectedMood) {
      Alert.alert("Error", "Please select your mood");
      return;
    }

    try {
      setSaving(true);

      // Use journalService to create the entry
      await journalService.createJournalEntry({
        title: title.trim() || "Untitled", // Provide default title if empty
        content: content.trim(),
        mood: selectedMood,
      });

      // Reset form first
      resetForm();

      // Show success message and navigate back
      Alert.alert("Success", "Your journal entry has been saved!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      // Handle validation errors and other errors
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to save your journal entry. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (title.trim() || content.trim()) {
      Alert.alert(
        "Discard Changes",
        "Are you sure you want to discard your journal entry?",
        [
          { text: "Keep Writing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              resetForm(); // Clear form before going back
              router.back();
            },
          },
        ]
      );
    } else {
      resetForm(); // Clear form before going back
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

  const getSelectedMoodEmoji = () => {
    if (!selectedMood) return "😐";
    const moodOption = moodOptions.find(
      (option) => option.mood === selectedMood
    );
    return moodOption?.emoji || "😐";
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0f0f1a" }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0f0f1a"
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

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={{
            backgroundColor: "rgba(176, 196, 222, 0.8)",
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: "rgba(176, 196, 222, 0.4)",
          }}
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={{ color: "white", fontWeight: "600", fontSize: 18 }}>
              ✓
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Date Section */}
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
            {getCurrentDate()}
          </Text>
        </View>

        {/* Mood Selector Section */}
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

        {/* Title Input Section */}
        <View
          style={{
            paddingHorizontal: 24,
            paddingVertical: 20,
            backgroundColor: "rgba(255, 255, 255, 0.06)",
            borderBottomWidth: 1,
            borderBottomColor: "rgba(255, 255, 255, 0.1)",
          }}
        >
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Entry Title"
            style={{
              fontSize: 20,
              color: "#F0F0F0",
              fontWeight: "600",
            }}
            placeholderTextColor="#A0A0A0"
            multiline={false}
          />
        </View>

        {/* Content Input Section */}
        <View
          style={{
            paddingHorizontal: 24,
            paddingVertical: 24,
            backgroundColor: "#1a1a2e",
            flex: 1,
          }}
        >
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
            />
          </View>
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

export default AddJournalEntry;
