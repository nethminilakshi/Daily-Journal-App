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

  // Clear form when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      resetForm();
    }, [])
  );

  // Mood options with emojis and colors
  const moodOptions = [
    { mood: "sad" as MoodType, emoji: "😢", color: "#FF9AA2" },
    { mood: "stressed" as MoodType, emoji: "😤", color: "#FFB88C" },
    { mood: "neutral" as MoodType, emoji: "😐", color: "#C5B3E6" },
    { mood: "happy" as MoodType, emoji: "😊", color: "#FFDAC1" },
    { mood: "excited" as MoodType, emoji: "🤩", color: "#B5EAD7" },
  ];

  const resetForm = () => {
    setTitle("");
    setContent("");
    setSelectedMood(null);
    setShowMoodSelector(false);
    setSaving(false);
  };

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

  const handleSave = async () => {
    if (!selectedMood) {
      Alert.alert("Error", "Please select your mood");
      return;
    }

    try {
      setSaving(true);

      await journalService.createJournalEntry({
        title: title.trim() || "Untitled",
        content: content.trim(),
        mood: selectedMood,
      });

      resetForm();

      Alert.alert("Success", "Your journal entry has been saved!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
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
              resetForm();
              router.back();
            },
          },
        ]
      );
    } else {
      resetForm();
      router.back();
    }
  };

  const renderHeader = () => (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 48,
        paddingHorizontal: 24,
        paddingBottom: 16,
        backgroundColor: "#E8D5F2",
      }}
    >
      <TouchableOpacity onPress={handleCancel}>
        <Text style={{ fontSize: 28, color: "#9E1C60" }}>‹</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleSave}
        disabled={saving}
        style={{
          backgroundColor: "#D4A5FF",
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: "#C78EFF",
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
  );

  const renderDateSection = () => (
    <View
      style={{
        paddingHorizontal: 24,
        paddingVertical: 20,
        backgroundColor: "#DDA0DD",
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255, 255, 255, 0.5)",
      }}
    >
      <Text style={{ color: "white", fontSize: 18, fontWeight: "500" }}>
        {getCurrentDate()}
      </Text>
    </View>
  );

  const renderMoodSelector = () => (
    <View
      style={{
        paddingHorizontal: 24,
        paddingVertical: 24,
        backgroundColor: "#E7D3D3",
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255, 255, 255, 0.5)",
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
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Entry Title"
        style={{
          fontSize: 20,
          color: "#9E1C60",
          fontWeight: "600",
        }}
        placeholderTextColor="#B5A6C9"
        multiline={false}
      />
    </View>
  );

  const renderContentInput = () => (
    <View
      style={{
        paddingHorizontal: 24,
        paddingVertical: 24,
        backgroundColor: "#E8D5F2",
        flex: 1,
      }}
    >
      <View
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.4)",
          borderRadius: 16,
          borderWidth: 2,
          borderColor: "#D25D5D",
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
            color: "#8B5A8A",
            flex: 1,
            lineHeight: 24,
          }}
          placeholderTextColor="#B5A6C9"
          multiline={true}
          textAlignVertical="top"
        />
      </View>
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
        backgroundColor: "rgba(232, 213, 242, 0.95)",
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
          borderColor: "#E6D9FF",
          shadowColor: "#C5B3E6",
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
            color: "#9E1C60",
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
                    : "#F5F0FF",
                borderWidth: selectedMood === option.mood ? 3 : 2,
                borderColor:
                  selectedMood === option.mood ? option.color : "#E6D9FF",
              }}
            >
              <Text style={{ fontSize: 24 }}>{option.emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => setShowMoodSelector(false)}
          style={{
            backgroundColor: "#F0E6FF",
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 16,
            borderWidth: 2,
            borderColor: "#D4A5FF",
          }}
        >
          <Text
            style={{
              textAlign: "center",
              color: "#9E1C60",
              fontWeight: "600",
            }}
          >
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#E8D5F2" }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#E8D5F2"
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

export default AddJournalEntry;
