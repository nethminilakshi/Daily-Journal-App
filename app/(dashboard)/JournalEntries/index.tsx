import journalService, { JournalEntry } from "@/services/journalService";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { BookOpen } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
      setError(null);
      const journalEntries = await journalService.getAllJournalEntries();
      console.log(
        "Fetched journal entries:",
        journalEntries.map((e) => ({ id: e.id, title: e.title }))
      );
      setEntries(journalEntries);
    } catch (err) {
      console.error("Error fetching journal entries:", err);
      setError("Failed to load journal entries");
    } finally {
      setLoading(false);
    }
  };

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

    return sortedDates.map((date) => ({
      date,
      entries: grouped[date].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    }));
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

    // Navigate to the journal entry screen with the actual ID
    router.push(`/JournalEntries/${entry.id}`);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center pt-12 px-6 pb-4">
          <Text className="text-3xl font-bold text-gray-800">Diary</Text>
          <View className="bg-pink-400 px-4 py-2 rounded-full">
            <Text className="text-white font-semibold text-sm">PREMIUM</Text>
          </View>
        </View>

        {/* Hero Image Card - Wider and Centered */}
        <View className="mb-8 flex items-center justify-center">
          <View className="w-auto h-100 rounded-3xl overflow-hidden">
            {/* Background Image */}
            <Image
              source={require("@/assets/images/hq720.jpg")}
              className="w-full h-full"
              style={{ resizeMode: "cover" }}
            />
          </View>
        </View>

        {/* Main Content */}
        <View className="px-6">
          <Text className="text-3xl font-bold text-gray-800 text-center mb-4">
            Every moment matters
          </Text>
          <Text className="text-lg text-gray-600 text-center leading-relaxed px-4 mb-8">
            Start journaling your thoughts and feelings{"\n"}
            in your private, secure diary
          </Text>

          {/* Loading State */}
          {loading && (
            <View className="flex-row justify-center py-8">
              <ActivityIndicator size="large" color="#F472B6" />
            </View>
          )}

          {/* Error State */}
          {error && (
            <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <Text className="text-red-600 text-center mb-2">{error}</Text>
              <TouchableOpacity
                onPress={fetchJournalData}
                className="bg-red-100 rounded-lg py-2 px-4 self-center"
              >
                <Text className="text-red-600 font-medium">Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Journal Entries List - Grouped by Date */}
          {!loading && entries.length > 0 && (
            <View className="mb-6">
              <Text className="text-xl font-bold text-gray-800 mb-4">
                Recent Entries
              </Text>

              {groupEntriesByDate(entries).map((group, groupIndex) => (
                <View key={group.date} className="mb-6">
                  {/* Date Header */}
                  <View className="flex-row items-center mb-3">
                    <View className="w-12 h-12 bg-pink-400 rounded-2xl items-center justify-center mr-3">
                      <Text className="text-white font-bold text-lg">
                        {new Date(group.date).getDate()}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-gray-800">
                        {formatDateHeader(group.date)}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {new Date(group.date).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}
                      </Text>
                    </View>
                  </View>

                  {/* Entries for this date */}
                  {group.entries.map((entry, entryIndex) => (
                    <TouchableOpacity
                      key={entry.id}
                      className="bg-white rounded-2xl p-4 mb-3 ml-4 shadow-sm border border-gray-100"
                      onPress={() => handleNavigateToEntry(entry)}
                    >
                      <View className="flex-row items-start">
                        {/* Mood emoji */}
                        <Text className="text-2xl mr-3 mt-1">
                          {getMoodEmoji(entry.mood)}
                        </Text>

                        {/* Entry content */}
                        <View className="flex-1">
                          <Text className="text-lg font-semibold text-gray-800 mb-1">
                            {entry.title}
                          </Text>
                          <Text
                            className="text-gray-600 text-sm mb-2"
                            numberOfLines={2}
                          >
                            {entry.content}
                          </Text>

                          {/* Time */}
                          <Text className="text-xs text-gray-400">
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
          {!loading && entries.length === 0 && (
            <View className="items-center py-12">
              <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center mb-4">
                <BookOpen size={32} color="#9CA3AF" />
              </View>
              <Text className="text-xl font-semibold text-gray-800 mb-2">
                No entries yet
              </Text>
              <Text className="text-gray-600 text-center mb-6 px-8">
                Start your journaling journey by writing your first entry
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
