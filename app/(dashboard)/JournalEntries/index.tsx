import journalService, { JournalEntry } from "@/services/journalService";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { BookOpen } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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

  // Format date
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
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

        {/* Hero Image Card */}
        <View className="mx-6 mb-8">
          <View className="h-64 bg-gradient-to-br from-purple-200 to-pink-200 rounded-3xl overflow-hidden relative">
            {/* Gradient Background */}
            <LinearGradient
              colors={["#DDD6FE", "#F3E8FF", "#FDE68A", "#FED7AA"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="absolute inset-0"
            />

            {/* Sun */}
            <View
              className="absolute bottom-16 left-1/2 w-16 h-16 bg-yellow-200 rounded-full opacity-80"
              style={{ transform: [{ translateX: -32 }] }}
            />

            {/* Water Reflection */}
            <LinearGradient
              colors={["rgba(147, 197, 253, 0.6)", "transparent"]}
              start={{ x: 0, y: 1 }}
              end={{ x: 0, y: 0 }}
              className="absolute bottom-0 left-0 right-0 h-20"
            />

            {/* Boat */}
            <View className="absolute bottom-8 right-16">
              <View className="w-12 h-6 bg-amber-800 rounded-full" />
              <View
                className="w-2 h-8 bg-amber-900 absolute left-1/2 -top-8"
                style={{ transform: [{ translateX: -4 }] }}
              />
            </View>

            {/* Birds */}
            <Text className="absolute top-8 left-12 text-gray-700 text-lg">
              ᵛ
            </Text>
            <Text className="absolute top-12 left-20 text-gray-700 text-sm">
              ᵛ
            </Text>
            <Text className="absolute top-6 left-8 text-gray-700 text-sm">
              ᵛ
            </Text>

            {/* Profile Icon */}
            <View className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex justify-center items-center">
              <View className="w-6 h-6 bg-pink-400 rounded-full" />
            </View>
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

          {/* Journal Entries List */}
          {!loading && entries.length > 0 && (
            <View className="mb-6">
              <Text className="text-xl font-bold text-gray-800 mb-4">
                Recent Entries
              </Text>
              {entries.map((entry, index) => (
                <TouchableOpacity
                  key={entry.id}
                  className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100"
                  onPress={() => handleNavigateToEntry(entry)}
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1 mr-3">
                      <Text className="text-lg font-semibold text-gray-800 mb-1">
                        {entry.title}
                      </Text>
                      <Text className="text-gray-600 text-sm" numberOfLines={3}>
                        {entry.content}
                      </Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-2xl mb-1">
                        {getMoodEmoji(entry.mood)}
                      </Text>
                      <Text className="text-xs text-gray-400 text-center">
                        {formatDate(new Date(entry.createdAt))}
                      </Text>
                    </View>
                  </View>

                  {/* Entry Stats */}
                  <View className="flex-row items-center pt-2 border-t border-gray-100">
                    <View className="bg-gray-100 px-2 py-1 rounded-full mr-2">
                      <Text className="text-xs text-gray-600 capitalize">
                        {entry.mood}
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-400">
                      {new Date(entry.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                </TouchableOpacity>
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
