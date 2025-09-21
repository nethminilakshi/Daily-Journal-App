import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { BookOpen, Plus } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
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

  // Debug current user
  useEffect(() => {
    console.log("=== HOME SCREEN DEBUG ===");
    console.log("Current user:", auth.currentUser?.email);
    console.log("User ID:", auth.currentUser?.uid);
  }, []);

  // Debug state changes
  useEffect(() => {
    console.log("=== STATE DEBUG ===");
    console.log("Loading:", loading);
    console.log("Entries count:", entries.length);
    console.log("Error:", error);
    console.log(
      "Entries data:",
      entries.map((e) => ({
        id: e.id,
        title: e.title,
        createdAt: e.createdAt,
      }))
    );
  }, [loading, entries, error]);

  // Load data from Firebase
  const fetchJournalData = async () => {
    try {
      console.log("=== FETCH DEBUG ===");
      console.log("Starting to fetch journal data...");

      // Check if user is authenticated
      if (!auth.currentUser) {
        throw new Error("User not authenticated");
      }

      setError(null);
      const journalEntries = await journalService.getAllJournalEntries();

      console.log("Raw journal entries received:", journalEntries.length);
      console.log("First 3 entries:", journalEntries.slice(0, 3));

      setEntries(journalEntries);

      if (journalEntries.length === 0) {
        console.log("No entries found - showing empty state");
      }
    } catch (err: any) {
      console.error("=== ERROR FETCHING ===");
      console.error("Error details:", err);
      console.error("Error message:", err.message);
      console.error("Error code:", err.code);

      setError(err.message || "Failed to load journal entries");

      // Show alert for debugging
      Alert.alert("Debug Error", `Failed to load entries: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    console.log("=== INITIAL LOAD ===");
    setLoading(true);
    fetchJournalData();
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log("=== FOCUS EFFECT ===");
      if (!loading) {
        console.log("Screen focused, refreshing data...");
        fetchJournalData();
      }
    }, [loading])
  );

  // Pull to refresh
  const onRefresh = async () => {
    console.log("=== PULL TO REFRESH ===");
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
    console.log("=== GROUPING ENTRIES ===");
    console.log("Entries to group:", entries.length);

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

    console.log("Grouped result:", result.length, "date groups");
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
    console.log("=== NAVIGATION DEBUG ===");
    console.log("Navigating to entry with ID:", entry.id);
    console.log("Entry details:", {
      id: entry.id,
      title: entry.title,
      mood: entry.mood,
      createdAt: entry.createdAt,
    });

    try {
      // Navigate to the journal entry screen with the actual ID
      router.push(`/JournalEntries/${entry.id}`);
    } catch (err) {
      console.error("Navigation error:", err);
      Alert.alert("Navigation Error", "Failed to open journal entry");
    }
  };

  // Handle add new entry
  const handleAddEntry = () => {
    console.log("=== ADD ENTRY ===");
    try {
      router.push("/add");
    } catch (err) {
      console.error("Add navigation error:", err);
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

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <StatusBar
        barStyle="dark-content"
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
          <Text style={{ fontSize: 30, fontWeight: "bold", color: "#1f2937" }}>
            Diary
          </Text>
          <View
            style={{
              backgroundColor: "#f472b6",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
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
            marginBottom: 32,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              width: "auto",
              height: 160,
              borderRadius: 24,
              overflow: "hidden",
            }}
          >
            {/* <Image
              source={require("@/assets/images/hq720.jpg")}
              style={{ width: "100%", height: "100%", resizeMode: "cover" }}
            /> */}
          </View>
        </View>

        {/* Main Content */}
        <View style={{ paddingHorizontal: 24 }}>
          <Text
            style={{
              fontSize: 30,
              fontWeight: "bold",
              color: "#1f2937",
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            Every moment matters
          </Text>
          <Text
            style={{
              fontSize: 18,
              color: "#6b7280",
              textAlign: "center",
              lineHeight: 28,
              paddingHorizontal: 16,
              marginBottom: 32,
            }}
          >
            Start journaling your thoughts and feelings{"\n"}
            in your private, secure diary
          </Text>

          {/* Debug Info */}
          <View
            style={{
              backgroundColor: "#e5e7eb",
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 12, color: "#374151" }}>
              Debug: Loading={loading ? "true" : "false"}, Entries=
              {entries.length}, User={auth.currentUser?.email || "none"}
            </Text>
          </View>

          {/* Loading State */}
          {loading && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                paddingVertical: 32,
              }}
            >
              <ActivityIndicator size="large" color="#F472B6" />
              <Text style={{ marginLeft: 12, color: "#6b7280" }}>
                Loading entries...
              </Text>
            </View>
          )}

          {/* Error State */}
          {error && (
            <View
              style={{
                backgroundColor: "#fef2f2",
                borderWidth: 1,
                borderColor: "#fecaca",
                borderRadius: 12,
                padding: 16,
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  color: "#dc2626",
                  textAlign: "center",
                  marginBottom: 8,
                }}
              >
                {error}
              </Text>
              <TouchableOpacity
                onPress={fetchJournalData}
                style={{
                  backgroundColor: "#fee2e2",
                  borderRadius: 8,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  alignSelf: "center",
                }}
              >
                <Text style={{ color: "#dc2626", fontWeight: "500" }}>
                  Retry
                </Text>
              </TouchableOpacity>

              {/* Debug button to test with dummy data */}
              <TouchableOpacity
                onPress={() => {
                  console.log("Using test data");
                  setEntries(testEntries);
                  setError(null);
                }}
                style={{
                  backgroundColor: "#ddd6fe",
                  borderRadius: 8,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  alignSelf: "center",
                  marginTop: 8,
                }}
              >
                <Text style={{ color: "#7c3aed", fontWeight: "500" }}>
                  Test with dummy data
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Journal Entries List - Grouped by Date */}
          {!loading && entries.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "#1f2937",
                  marginBottom: 16,
                }}
              >
                Recent Entries ({entries.length})
              </Text>

              {groupEntriesByDate(entries).map((group, groupIndex) => (
                <View key={group.date} style={{ marginBottom: 24 }}>
                  {/* Date Header */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        backgroundColor: "#f472b6",
                        borderRadius: 16,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                      }}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontWeight: "bold",
                          fontSize: 18,
                        }}
                      >
                        {new Date(group.date).getDate()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "600",
                          color: "#1f2937",
                        }}
                      >
                        {formatDateHeader(group.date)}
                      </Text>
                      <Text style={{ fontSize: 14, color: "#6b7280" }}>
                        {new Date(group.date).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        • {group.entries.length} entries
                      </Text>
                    </View>
                  </View>

                  {/* Entries for this date */}
                  {group.entries.map((entry, entryIndex) => (
                    <TouchableOpacity
                      key={entry.id}
                      style={{
                        backgroundColor: "white",
                        borderRadius: 16,
                        padding: 16,
                        marginBottom: 12,
                        marginLeft: 16,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 2,
                        elevation: 1,
                        borderWidth: 1,
                        borderColor: "#f3f4f6",
                      }}
                      onPress={() => handleNavigateToEntry(entry)}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-start",
                        }}
                      >
                        {/* Mood emoji */}
                        <Text
                          style={{
                            fontSize: 24,
                            marginRight: 12,
                            marginTop: 4,
                          }}
                        >
                          {getMoodEmoji(entry.mood)}
                        </Text>

                        {/* Entry content */}
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: 18,
                              fontWeight: "600",
                              color: "#1f2937",
                              marginBottom: 4,
                            }}
                          >
                            {entry.title}
                          </Text>
                          <Text
                            style={{
                              color: "#6b7280",
                              fontSize: 14,
                              marginBottom: 8,
                              lineHeight: 20,
                            }}
                            numberOfLines={2}
                          >
                            {entry.content}
                          </Text>

                          {/* Time */}
                          <Text style={{ fontSize: 12, color: "#9ca3af" }}>
                            {new Date(entry.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          )}

          {/* Empty State */}
          {!loading && entries.length === 0 && !error && (
            <View style={{ alignItems: "center", paddingVertical: 48 }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  backgroundColor: "#e5e7eb",
                  borderRadius: 40,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <BookOpen size={32} color="#9CA3AF" />
              </View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "600",
                  color: "#1f2937",
                  marginBottom: 8,
                }}
              >
                No entries yet
              </Text>
              <Text
                style={{
                  color: "#6b7280",
                  textAlign: "center",
                  marginBottom: 24,
                  paddingHorizontal: 32,
                  lineHeight: 20,
                }}
              >
                Start your journaling journey by writing your first entry
              </Text>

              {/* Add Entry Button in Empty State */}
              <TouchableOpacity
                onPress={handleAddEntry}
                style={{
                  backgroundColor: "#f472b6",
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 24,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Plus size={20} color="white" style={{ marginRight: 8 }} />
                <Text style={{ color: "white", fontWeight: "600" }}>
                  Write First Entry
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        onPress={handleAddEntry}
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          width: 56,
          height: 56,
          backgroundColor: "#f472b6",
          borderRadius: 28,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Plus size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;
