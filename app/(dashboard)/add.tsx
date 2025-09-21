import { useRouter } from "expo-router";
import React, { useState } from "react";
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
        title,
        content,
        mood: selectedMood,
      });

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

  const getSelectedMoodEmoji = () => {
    if (!selectedMood) return "😐";
    const moodOption = moodOptions.find(
      (option) => option.mood === selectedMood
    );
    return moodOption?.emoji || "😐";
  };

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

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          className="bg-pink-400 px-6 py-2 rounded-full"
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-semibold">Done</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {/* Date */}
        <View className="px-6 py-4 bg-white border-b border-gray-100">
          <Text className="text-gray-600 text-lg">{getCurrentDate()}</Text>
        </View>

        {/* Mood Selector */}
        <View className="px-6 py-6 bg-white border-b border-gray-100">
          <TouchableOpacity
            onPress={handleMoodIconPress}
            className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center"
          >
            <Text className="text-3xl">{getSelectedMoodEmoji()}</Text>
          </TouchableOpacity>
        </View>

        {/* Title Input */}
        <View className="px-6 py-4 bg-white border-b border-gray-100">
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Title"
            className="text-xl text-gray-800 font-medium"
            placeholderTextColor="#9CA3AF"
            multiline={false}
          />
        </View>

        {/* Space between title and content */}
        <View className="h-4 bg-gray-50" />

        {/* Content Input - Now with proper text box styling */}
        <View className="px-6 py-4 bg-white flex-1">
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
            />
          </View>
        </View>
      </ScrollView>

      {/* Mood Selection Modal */}
      {showMoodSelector && (
        <View className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <View className="bg-white rounded-3xl p-6 mx-6 w-80">
            <Text className="text-xl font-semibold text-gray-800 text-center mb-6">
              How are you?
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

export default AddJournalEntry;
