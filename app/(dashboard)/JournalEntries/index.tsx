import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { BookOpen, Plus } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../../../firebase";
import journalService, { JournalEntry } from "../../../services/journalService";

const HomeScreen = () => {
  const router = useRouter();

  // State for journal data
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load data from Firebase
  const fetchJournalData = async () => {
    try {
      // Check if user is authenticated
      if (!auth.currentUser) {
        throw new Error("User not authenticated");
      }

      setError(null);
      const journalEntries = await journalService.getAllJournalEntries();
      setEntries(journalEntries);
    } catch (err: any) {
      setError(err.message || "Failed to load journal entries");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    setLoading(true);
    fetchJournalData();
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!loading) {
        fetchJournalData();
      }
    }, [loading])
  );

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchJournalData();
    setRefreshing(false);
  };

  // Get mood emoji
  const getMoodEmoji = (mood: string) => {
    const moodEmojis: Record<string, string> = {
      happy: "😊",
      sad: "😢",
      stressed: "😤",
      relaxed: "😌",
      excited: "🤩",
      anxious: "😰",
      neutral: "😐",
    };
    return moodEmojis[mood] || "😐";
  };

  // Group entries by date
  const groupEntriesByDate = (entries: JournalEntry[]) => {
    const grouped: { [key: string]: JournalEntry[] } = {};

    entries.forEach((entry) => {
      const dateKey = new Date(entry.createdAt).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(entry);
    });

    // Sort dates in descending order (newest first)
    const sortedDates = Object.keys(grouped).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    const result = sortedDates.map((date) => ({
      date,
      entries: grouped[date].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    }));

    return result;
  };

  // Format date for display
  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year:
          date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  // Handle navigation to journal entry
  const handleNavigateToEntry = (entry: JournalEntry) => {
    try {
      router.push(`/JournalEntries/${entry.id}`);
    } catch (err) {
      Alert.alert("Navigation Error", "Failed to open journal entry");
    }
  };

  // Handle add new entry
  const handleAddEntry = () => {
    try {
      router.push("/add");
    } catch (err) {
      Alert.alert("Navigation Error", "Failed to open add journal screen");
    }
  };

  // Test data for debugging
  const testEntries: JournalEntry[] = [
    {
      id: "test1",
      title: "Test Entry 1",
      content: "This is a test entry to verify the UI is working",
      mood: "happy",
      createdAt: new Date(),
      userId: "test",
    },
    {
      id: "test2",
      title: "Test Entry 2",
      content: "Another test entry",
      mood: "relaxed",
      createdAt: new Date(Date.now() - 86400000), // Yesterday
      userId: "test",
    },
  ];

  // Get gradient colors for date circles (cycling through beautiful gradients)
  const getDateCircleGradient = (index: number) => {
    const gradients = [
      { bg: "rgba(255, 105, 180, 0.8)", border: "rgba(255, 20, 147, 0.9)" }, // Hot Pink
      { bg: "rgba(138, 43, 226, 0.8)", border: "rgba(75, 0, 130, 0.9)" }, // Purple
      { bg: "rgba(70, 130, 180, 0.8)", border: "rgba(30, 144, 255, 0.9)" }, // Steel Blue
      { bg: "rgba(255, 165, 0, 0.8)", border: "rgba(255, 140, 0, 0.9)" }, // Orange
      { bg: "rgba(50, 205, 50, 0.8)", border: "rgba(34, 139, 34, 0.9)" }, // Lime Green
    ];
    return gradients[index % gradients.length];
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#1c1c2b" }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 48,
            paddingHorizontal: 24,
            paddingBottom: 16,
          }}
        >
          <Text style={{ fontSize: 32, fontWeight: "700", color: "#F5F5F5" }}>
            📖 Diary
          </Text>
          <View
            style={{
              backgroundColor: "rgba(255, 105, 180, 0.9)",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              shadowColor: "#FF1493",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 3,
              borderWidth: 1,
              borderColor: "rgba(255, 20, 147, 0.3)",
            }}
          >
            <Text style={{ color: "white", fontWeight: "600", fontSize: 14 }}>
              PREMIUM
            </Text>
          </View>
        </View>

        {/* Hero Image Card */}
        <View
          style={{
            marginHorizontal: 20,
            marginBottom: 32,
            borderRadius: 24,
            overflow: "hidden",
            shadowColor: "#FF69B4",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <ImageBackground
            source={{
              uri: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
            }}
            style={{
              height: 200,
              justifyContent: "center",
              alignItems: "center",
            }}
            imageStyle={{ borderRadius: 24 }}
          >
            {/* Gradient overlay for hero */}
            <View
              style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: "rgba(255, 105, 180, 0.2)",
                borderRadius: 24,
              }}
            />

            {/* Hero Content */}
            <View
              style={{
                alignItems: "center",
                paddingHorizontal: 24,
                zIndex: 1,
              }}
            >
              <Text
                style={{
                  fontSize: 26,
                  fontWeight: "800",
                  color: "white",
                  textAlign: "center",
                  marginBottom: 8,
                  textShadowColor: "rgba(255, 20, 147, 0.4)",
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 4,
                }}
              >
                Capture Your Journey
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: "white",
                  textAlign: "center",
                  opacity: 0.95,
                  textShadowColor: "rgba(138, 43, 226, 0.3)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 3,
                }}
              >
                Every moment is worth remembering
              </Text>
            </View>
          </ImageBackground>
        </View>

        {/* Main Content */}
        <View style={{ paddingHorizontal: 24 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "700",
              color: "#E6E6FA",
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            Every moment matters
          </Text>

          {/* Loading State */}
          {loading && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                paddingVertical: 32,
              }}
            >
              <ActivityIndicator size="large" color="#FF69B4" />
              <Text style={{ marginLeft: 12, color: "#B0C4DE" }}>
                Loading entries...
              </Text>
            </View>
          )}

          {/* Error State */}
          {error && (
            <View
              style={{
                backgroundColor: "rgba(255, 165, 0, 0.15)",
                borderWidth: 1,
                borderColor: "rgba(255, 140, 0, 0.3)",
                borderRadius: 16,
                padding: 18,
                marginBottom: 24,
                shadowColor: "#FFA500",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Text
                style={{
                  color: "#FFE4B5",
                  textAlign: "center",
                  marginBottom: 12,
                  fontWeight: "600",
                }}
              >
                {error}
              </Text>
              <TouchableOpacity
                onPress={fetchJournalData}
                style={{
                  backgroundColor: "rgba(255, 140, 0, 0.8)",
                  borderRadius: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 18,
                  alignSelf: "center",
                }}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>Retry</Text>
              </TouchableOpacity>

              {/* Debug button to test with dummy data */}
              <TouchableOpacity
                onPress={() => {
                  setEntries(testEntries);
                  setError(null);
                }}
                style={{
                  backgroundColor: "rgba(138, 43, 226, 0.8)",
                  borderRadius: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 18,
                  alignSelf: "center",
                  marginTop: 8,
                }}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>
                  Test with dummy data
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Journal Entries List - Grouped by Date */}
          {!loading && entries.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              {/* Recent Entries Title - Calm & Simple */}
              <View
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 24,
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
                  }}
                >
                  Recent Entries
                </Text>
              </View>

              {groupEntriesByDate(entries).map((group, groupIndex) => {
                return (
                  <View key={group.date} style={{ marginBottom: 28 }}>
                    {/* Date Header - Soft & Minimal */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 16,
                        paddingHorizontal: 4,
                      }}
                    >
                      <View
                        style={{
                          width: 52,
                          height: 52,
                          backgroundColor: "rgba(176, 196, 222, 0.15)",
                          borderRadius: 16,
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 16,
                          borderWidth: 1,
                          borderColor: "rgba(176, 196, 222, 0.3)",
                        }}
                      >
                        <Text
                          style={{
                            color: "#F5F5F5",
                            fontWeight: "700",
                            fontSize: 18,
                          }}
                        >
                          {new Date(group.date).getDate()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 17,
                            fontWeight: "600",
                            color: "#E0E0E0",
                          }}
                        >
                          {formatDateHeader(group.date)}
                        </Text>
                        <Text style={{ fontSize: 14, color: "#B0B0B0" }}>
                          {new Date(group.date).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })}{" "}
                        </Text>
                      </View>
                    </View>

                    {/* Entries - Clean & Peaceful */}
                    {group.entries.map((entry, entryIndex) => {
                      return (
                        <TouchableOpacity
                          key={entry.id}
                          style={{
                            backgroundColor: "rgba(255, 255, 255, 0.06)",
                            borderRadius: 16,
                            padding: 20,
                            marginBottom: 12,
                            marginLeft: 16,
                            borderWidth: 1,
                            borderColor: "rgba(255, 255, 255, 0.1)",
                          }}
                          onPress={() => handleNavigateToEntry(entry)}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "flex-start",
                            }}
                          >
                            {/* Mood emoji - Soft Blue Tint */}
                            <View
                              style={{
                                width: 40,
                                height: 40,
                                backgroundColor: "rgba(173, 216, 230, 0.2)",
                                borderRadius: 12,
                                alignItems: "center",
                                justifyContent: "center",
                                marginRight: 16,
                                marginTop: 2,
                                borderWidth: 1,
                                borderColor: "rgba(173, 216, 230, 0.4)",
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 20,
                                }}
                              >
                                {getMoodEmoji(entry.mood)}
                              </Text>
                            </View>

                            {/* Entry content - Soft Typography */}
                            <View style={{ flex: 1 }}>
                              <Text
                                style={{
                                  fontSize: 17,
                                  fontWeight: "600",
                                  color: "#F0F0F0",
                                  marginBottom: 6,
                                }}
                              >
                                {entry.title}
                              </Text>
                              <Text
                                style={{
                                  color: "#D0D0D0",
                                  fontSize: 14,
                                  marginBottom: 8,
                                  lineHeight: 20,
                                  opacity: 0.9,
                                }}
                                numberOfLines={2}
                              >
                                {entry.content}
                              </Text>

                              {/* Time - Subtle */}
                              <Text
                                style={{
                                  fontSize: 12,
                                  color: "#A0A0A0",
                                  fontWeight: "500",
                                }}
                              >
                                {new Date(entry.createdAt).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                );
              })}
            </View>
          )}

          {/* Empty State with Gradient Design */}
          {!loading && entries.length === 0 && !error && (
            <View style={{ alignItems: "center", paddingVertical: 48 }}>
              <View
                style={{
                  width: 100,
                  height: 100,
                  backgroundColor: "rgba(176, 196, 222, 0.2)",
                  borderRadius: 50,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                  shadowColor: "#87CEEB",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  elevation: 3,
                  borderWidth: 2,
                  borderColor: "rgba(135, 206, 235, 0.4)",
                }}
              >
                <BookOpen size={40} color="#B0C4DE" />
              </View>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "700",
                  color: "#E6E6FA",
                  marginBottom: 12,
                }}
              >
                No entries yet
              </Text>
              <Text
                style={{
                  color: "#B0C4DE",
                  textAlign: "center",
                  marginBottom: 28,
                  paddingHorizontal: 32,
                  lineHeight: 24,
                  fontSize: 16,
                }}
              >
                Start your journaling journey by writing your first entry
              </Text>

              {/* Add Entry Button with Gradient */}
              <TouchableOpacity
                onPress={handleAddEntry}
                style={{
                  backgroundColor: "rgba(255, 105, 180, 0.9)",
                  paddingHorizontal: 28,
                  paddingVertical: 16,
                  borderRadius: 28,
                  flexDirection: "row",
                  alignItems: "center",
                  shadowColor: "#FF69B4",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                  borderWidth: 1,
                  borderColor: "rgba(255, 20, 147, 0.3)",
                }}
              >
                <Plus size={22} color="white" style={{ marginRight: 8 }} />
                <Text
                  style={{ color: "white", fontWeight: "700", fontSize: 16 }}
                >
                  Write First Entry
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
