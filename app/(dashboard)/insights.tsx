import journalService, {
  JournalEntry,
  MoodType,
} from "@/services/journalService";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";

const { width: screenWidth } = Dimensions.get("window");

interface MoodStats {
  mood: MoodType;
  count: number;
  percentage: number;
  emoji: string;
  color: string;
}

interface DayStreak {
  date: string;
  hasEntry: boolean;
}

const InsightsScreen = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [moodStats, setMoodStats] = useState<MoodStats[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [uniqueMoods, setUniqueMoods] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [last7DaysData, setLast7DaysData] = useState<DayStreak[]>([]);
  const [moodTrendData, setMoodTrendData] = useState<any>(null);

  // Mood configuration
  const moodConfig = [
    {
      mood: "excited" as MoodType,
      emoji: "🤩",
      color: "#06B6D4",
      label: "Excited",
    },
    {
      mood: "happy" as MoodType,
      emoji: "😊",
      color: "#3B82F6",
      label: "Happy",
    },
    {
      mood: "neutral" as MoodType,
      emoji: "😐",
      color: "#A855F7",
      label: "Neutral",
    },
    { mood: "sad" as MoodType, emoji: "😢", color: "#EC4899", label: "Sad" },
    {
      mood: "stressed" as MoodType,
      emoji: "😤",
      color: "#F97316",
      label: "Stressed",
    },
  ];

  useEffect(() => {
    loadInsightsData();
  }, []);

  const loadInsightsData = async () => {
    try {
      setLoading(true);
      const allEntries = await journalService.getAll();
      setEntries(allEntries);

      // Calculate basic stats
      setTotalEntries(allEntries.length);

      // Calculate mood statistics
      calculateMoodStats(allEntries);

      // Calculate streaks
      calculateStreaks(allEntries);

      // Prepare mood trend data for chart
      prepareMoodTrendData(allEntries);
    } catch (error) {
      console.error("Error loading insights data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMoodStats = (entries: JournalEntry[]) => {
    const moodCounts: { [key in MoodType]?: number } = {};
    const uniqueMoodsSet = new Set<MoodType>();

    entries.forEach((entry) => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      uniqueMoodsSet.add(entry.mood);
    });

    setUniqueMoods(uniqueMoodsSet.size);

    const stats: MoodStats[] = moodConfig
      .map((config) => {
        const count = moodCounts[config.mood] || 0;
        const percentage =
          entries.length > 0 ? Math.round((count / entries.length) * 100) : 0;

        return {
          mood: config.mood,
          count,
          percentage,
          emoji: config.emoji,
          color: config.color,
        };
      })
      .filter((stat) => stat.count > 0)
      .sort((a, b) => b.count - a.count);

    setMoodStats(stats);
  };

  const calculateStreaks = (entries: JournalEntry[]) => {
    if (entries.length === 0) {
      setCurrentStreak(0);
      setLongestStreak(0);
      setLast7DaysData([]);
      return;
    }

    // Sort entries by date (most recent first)
    const sortedEntries = [...entries].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Create date set for quick lookup
    const entryDates = new Set(
      sortedEntries.map((entry) => new Date(entry.createdAt).toDateString())
    );

    // Calculate current streak
    let currentStreakCount = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateString = checkDate.toDateString();

      if (entryDates.has(dateString)) {
        currentStreakCount++;
      } else {
        break;
      }
    }

    setCurrentStreak(currentStreakCount);

    // Calculate longest streak
    let longestStreakCount = 0;
    let tempStreak = 0;

    // Get all unique dates and sort them
    const allDates = Array.from(entryDates)
      .map((dateStr) => new Date(dateStr))
      .sort((a, b) => a.getTime() - b.getTime());

    for (let i = 0; i < allDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const currentDate = allDates[i];
        const previousDate = allDates[i - 1];
        const diffTime = currentDate.getTime() - previousDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreakCount = Math.max(longestStreakCount, tempStreak);
          tempStreak = 1;
        }
      }
    }
    longestStreakCount = Math.max(longestStreakCount, tempStreak);
    setLongestStreak(longestStreakCount);

    // Prepare last 7 days data
    const last7Days: DayStreak[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toDateString();

      last7Days.push({
        date: date.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
        }),
        hasEntry: entryDates.has(dateString),
      });
    }
    setLast7DaysData(last7Days);
  };

  const prepareMoodTrendData = (entries: JournalEntry[]) => {
    if (entries.length === 0) return;

    // Get last 7 days
    const last7Days = [];
    const moodValues: { [key in MoodType]: number } = {
      excited: 7,
      happy: 6,
      relaxed: 5,
      neutral: 4,
      anxious: 3,
      sad: 2,
      stressed: 1,
    };

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toDateString();

      // Find entry for this date
      const dayEntry = entries.find(
        (entry) => new Date(entry.createdAt).toDateString() === dateString
      );

      last7Days.push({
        date: date.toLocaleDateString("en-US", { day: "numeric" }),
        mood: dayEntry ? moodValues[dayEntry.mood] : 0,
        hasEntry: !!dayEntry,
      });
    }

    const chartData = {
      labels: last7Days.map((day) => day.date),
      datasets: [
        {
          data: last7Days.map((day) => day.mood || 0),
          strokeWidth: 3,
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        },
      ],
    };

    setMoodTrendData(chartData);
  };

  const getMoodLabel = (mood: MoodType) => {
    return moodConfig.find((config) => config.mood === mood)?.label || mood;
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#EC4899" />
        <Text className="text-gray-600 mt-4">Loading insights...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <View className="pt-12 px-6 pb-6 bg-white">
        <Text className="text-2xl font-bold text-gray-800">Insights</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View className="px-6 py-4">
          <View className="bg-white rounded-2xl p-6 shadow-sm">
            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <Text className="text-3xl font-bold text-gray-800">
                  {totalEntries}
                </Text>
                <Text className="text-gray-600 mt-1">Entries</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-3xl font-bold text-gray-800">
                  {uniqueMoods}
                </Text>
                <Text className="text-gray-600 mt-1">Moods</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-3xl font-bold text-gray-800">
                  {currentStreak}
                </Text>
                <Text className="text-gray-600 mt-1">Streak</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Diary Streak */}
        <View className="px-6 py-4">
          <View className="bg-white rounded-2xl p-6 shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Diary Streak
            </Text>

            <View className="flex-row justify-between mb-4">
              {last7DaysData.map((day, index) => (
                <View key={index} className="items-center">
                  <View
                    className={`w-8 h-8 rounded-lg mb-2 items-center justify-center ${
                      day.hasEntry ? "bg-pink-400" : "bg-gray-200"
                    }`}
                  >
                    {day.hasEntry && (
                      <Text className="text-white text-xs">✓</Text>
                    )}
                    {!day.hasEntry && (
                      <Text className="text-gray-400 text-xs">+</Text>
                    )}
                  </View>
                  <Text className="text-xs text-gray-600">{day.date}</Text>
                </View>
              ))}
            </View>

            <View className="flex-row items-center">
              <Text className="text-pink-400 text-lg">🔥</Text>
              <Text className="text-gray-700 ml-2">
                Longest chain:{" "}
                <Text className="font-semibold">{longestStreak}</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Writing Templates Card */}
        <View className="px-6 py-4">
          <View className="bg-blue-50 rounded-2xl p-6 relative overflow-hidden">
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              No ideas to write about?
            </Text>
            <Text className="text-gray-600 mb-4">
              Try out the writing templates!
            </Text>

            <TouchableOpacity className="bg-white px-4 py-2 rounded-xl self-start">
              <Text className="font-medium text-gray-800">Try it</Text>
            </TouchableOpacity>

            {/* Decorative elements */}
            <View className="absolute right-4 top-4">
              <Text className="text-4xl">💡</Text>
            </View>
            <View className="absolute right-8 bottom-4">
              <Text className="text-3xl">📖</Text>
            </View>
          </View>
        </View>

        {/* Trends */}
        <View className="px-6 py-4">
          <View className="bg-white rounded-2xl p-6 shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Trends
            </Text>

            {moodStats.length > 0 ? (
              <View>
                {/* Mood percentages */}
                <View className="mb-4">
                  {moodStats.slice(0, 3).map((stat, index) => (
                    <View
                      key={stat.mood}
                      className="flex-row items-center justify-between mb-3"
                    >
                      <View className="flex-row items-center">
                        <Text className="text-2xl mr-3">{stat.emoji}</Text>
                        <Text className="text-gray-700 font-medium">
                          {getMoodLabel(stat.mood)}
                        </Text>
                      </View>
                      <Text className="text-gray-800 font-semibold">
                        {stat.percentage}%
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Simple mood distribution bar */}
                <View className="flex-row h-2 rounded-full overflow-hidden bg-gray-100">
                  {moodStats.map((stat, index) => (
                    <View
                      key={stat.mood}
                      style={{
                        backgroundColor: stat.color,
                        flex: stat.percentage,
                      }}
                    />
                  ))}
                </View>
              </View>
            ) : (
              <Text className="text-gray-500 text-center py-4">
                No mood data available yet
              </Text>
            )}
          </View>
        </View>

        {/* Mood Graph */}
        {moodTrendData &&
          moodTrendData.datasets[0].data.some((val: number) => val > 0) && (
            <View className="px-6 py-4">
              <View className="bg-white rounded-2xl p-6 shadow-sm">
                <Text className="text-lg font-semibold text-gray-800 mb-4">
                  Mood Graph
                </Text>

                {/* Mood legend */}
                <View className="mb-4">
                  {moodConfig
                    .slice()
                    .reverse()
                    .map((config, index) => (
                      <View
                        key={config.mood}
                        className="flex-row items-center mb-2"
                      >
                        <Text className="text-lg mr-2">{config.emoji}</Text>
                        <View
                          className="w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: config.color }}
                        />
                        <Text className="text-gray-600 text-sm">
                          {config.label}
                        </Text>
                      </View>
                    ))}
                </View>

                <LineChart
                  data={moodTrendData}
                  width={screenWidth - 80}
                  height={200}
                  chartConfig={{
                    backgroundColor: "#ffffff",
                    backgroundGradientFrom: "#ffffff",
                    backgroundGradientTo: "#ffffff",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                    labelColor: (opacity = 1) =>
                      `rgba(107, 114, 128, ${opacity})`,
                    style: {
                      borderRadius: 16,
                    },
                    propsForDots: {
                      r: "4",
                      strokeWidth: "2",
                      stroke: "#3B82F6",
                    },
                  }}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 16,
                  }}
                  yAxisInterval={1}
                  fromZero={true}
                  segments={4}
                />
              </View>
            </View>
          )}

        {/* Bottom spacing */}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
};

export default InsightsScreen;
