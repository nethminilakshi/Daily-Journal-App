import journalService, { JournalEntry } from "@/services/journalService";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StatusBar, Text, View } from "react-native";

const HomeScreen = () => {
  const router = useRouter();

  // State for journal data
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from Firebase
  useEffect(() => {
    const fetchJournalData = async () => {
      try {
        setLoading(true);
        setError(null);
        const journalEntries = await journalService.getAllJournalEntries();
        setEntries(journalEntries);
      } catch (err) {
        console.error("Error fetching journal entries:", err);
        setError("Failed to load journal entries");
      } finally {
        setLoading(false);
      }
    };

    fetchJournalData();
  }, []);

  // Calculate stats from entries
  const calculateStats = () => {
    const totalEntries = entries.length;

    // Calculate streak (consecutive days with entries)
    const calculateStreak = () => {
      if (entries.length === 0) return 0;

      const sortedEntries = [...entries].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < sortedEntries.length; i++) {
        const entryDate = new Date(sortedEntries[i].createdAt);
        entryDate.setHours(0, 0, 0, 0);

        const daysDifference = Math.floor(
          (today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDifference === streak) {
          streak++;
        } else {
          break;
        }
      }

      return streak;
    };

    // Get most recent mood
    const getRecentMood = () => {
      if (entries.length === 0) return "😐";

      const recentEntry = entries.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];

      const moodEmojis: Record<string, string> = {
        happy: "😊",
        sad: "😢",
        stressed: "😤",
        relaxed: "😌",
        excited: "🤩",
        anxious: "😰",
        neutral: "😐",
      };

      return moodEmojis[recentEntry.mood] || "😐";
    };

    return {
      totalEntries,
      dayStreak: calculateStreak(),
      recentMood: getRecentMood(),
    };
  };

  const stats = calculateStats();

  const handleAddEntry = () => {
    router.push("/add");
  };

  const handleViewCalendar = () => {
    router.push("/calendar");
  };

  // Refresh data function (you can call this after adding new entries)
  const refreshData = async () => {
    try {
      setLoading(true);
      const journalEntries = await journalService.getAllJournalEntries();
      setEntries(journalEntries);
    } catch (err) {
      console.error("Error refreshing data:", err);
      setError("Failed to refresh data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <View className="flex-row justify-between items-center pt-12 px-6 pb-4">
        <Text className="text-3xl font-bold text-gray-800">Diary</Text>
        <View className="bg-pink-400 px-4 py-2 rounded-full">
          <Text className="text-white font-semibold text-sm">PREMIUM</Text>
        </View>
      </View>

      {/* Today's Entry Preview (if available) */}
      {!loading && entries.length > 0 && (
        <View className="mt-4 bg-white rounded-2xl p-4 shadow-sm">
          <Text className="text-gray-800 font-semibold text-base mb-2">
            Latest Entry
          </Text>
          {(() => {
            const latestEntry = entries[0]; // entries are already sorted by date desc
            return (
              <View>
                <Text className="text-gray-700 font-medium mb-1">
                  {latestEntry.title}
                </Text>
                <Text className="text-gray-500 text-sm" numberOfLines={2}>
                  {latestEntry.content}
                </Text>
                <View className="flex-row items-center justify-between mt-2">
                  <Text className="text-gray-400 text-xs">
                    {new Date(latestEntry.createdAt).toLocaleDateString()}
                  </Text>
                  <Text className="text-lg">
                    {(() => {
                      const moodEmojis: Record<string, string> = {
                        happy: "😊",
                        sad: "😢",
                        stressed: "😤",
                        relaxed: "😌",
                        excited: "🤩",
                        anxious: "😰",
                        neutral: "😐",
                      };
                      return moodEmojis[latestEntry.mood] || "😐";
                    })()}
                  </Text>
                </View>
              </View>
            );
          })()}
        </View>
      )}
    </View>
  );
};

export default HomeScreen;
