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
import journalService, {
  JournalEntry,
  MoodType,
} from "../../services/journalService";

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

  // Mood configuration with pastel colors
  const moodConfig = [
    {
      mood: "excited" as MoodType,
      emoji: "🤩",
      color: "#B5EAD7",
      label: "Excited",
    },
    {
      mood: "happy" as MoodType,
      emoji: "😊",
      color: "#FFDAC1",
      label: "Happy",
    },
    {
      mood: "neutral" as MoodType,
      emoji: "😐",
      color: "#C5B3E6",
      label: "Neutral",
    },
    { mood: "sad" as MoodType, emoji: "😢", color: "#FF9AA2", label: "Sad" },
    {
      mood: "stressed" as MoodType,
      emoji: "😤",
      color: "#FFB88C",
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

      setTotalEntries(allEntries.length);

      calculateMoodStats(allEntries);

      calculateStreaks(allEntries);

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
        let percentage = 0;

        if (entries.length > 0) {
          const exactPercentage = (count / entries.length) * 100;
          percentage = Math.round(exactPercentage * 10) / 10;
        }

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

    const totalPercentage = stats.reduce(
      (sum, stat) => sum + stat.percentage,
      0
    );

    if (totalPercentage !== 100 && stats.length > 0) {
      const difference = 100 - totalPercentage;
      const adjustment = difference / stats.length;

      stats.forEach((stat, index) => {
        if (index === stats.length - 1) {
          stat.percentage =
            Math.round(
              (100 -
                stats.slice(0, -1).reduce((sum, s) => sum + s.percentage, 0)) *
                10
            ) / 10;
        } else {
          stat.percentage =
            Math.round((stat.percentage + adjustment) * 10) / 10;
        }
      });
    }

    setMoodStats(stats);
  };

  const calculateStreaks = (entries: JournalEntry[]) => {
    if (entries.length === 0) {
      setCurrentStreak(0);
      setLongestStreak(0);
      setLast7DaysData([]);
      return;
    }

    const sortedEntries = [...entries].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const entryDates = new Set(
      sortedEntries.map((entry) => new Date(entry.createdAt).toDateString())
    );

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

    let longestStreakCount = 0;
    let tempStreak = 0;

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
    if (entries.length === 0) {
      setMoodTrendData(null);
      return;
    }

    const last7Days = [];
    const moodValues: { [key in MoodType]: number } = {
      excited: 5,
      happy: 4,
      relaxed: 3,
      neutral: 2.5,
      anxious: 2,
      sad: 1.5,
      stressed: 1,
    };

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toDateString();

      const dayEntry = entries.find(
        (entry) => new Date(entry.createdAt).toDateString() === dateString
      );

      last7Days.push({
        date: date.toLocaleDateString("en-US", { day: "numeric" }),
        mood: dayEntry ? moodValues[dayEntry.mood] || 2.5 : 2.5,
        hasEntry: !!dayEntry,
      });
    }

    const chartData = {
      labels: last7Days.map((day) => day.date),
      datasets: [
        {
          data: last7Days.map((day) => day.mood),
          strokeWidth: 3,
          color: (opacity = 1) => `rgba(212, 165, 255, ${opacity})`,
        },
      ],
    };

    console.log("Chart Data:", chartData);
    console.log(
      "Has data:",
      chartData.datasets[0].data.some((val: number) => val > 0)
    );
    setMoodTrendData(chartData);
  };

  const getMoodLabel = (mood: MoodType) => {
    return moodConfig.find((config) => config.mood === mood)?.label || mood;
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#E8D5F2",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#C5B3E6" />
        <Text style={{ color: "#9B89BD", marginTop: 16 }}>
          Loading insights...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#E8D5F2" }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#E8D5F2"
        translucent
      />

      {/* Header */}
      <View
        style={{
          paddingTop: 48,
          paddingHorizontal: 24,
          paddingBottom: 16,
          backgroundColor: "#E8D5F2",
        }}
      >
        <Text
          style={{
            fontSize: 32,
            fontWeight: "700",
            color: "#9E1C60",
          }}
        >
          Insights
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Cards */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 16 }}>
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 24,
              padding: 24,
              borderWidth: 2,
              borderColor: "#FFD700",
              shadowColor: "#FFD700",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <View style={{ alignItems: "center", flex: 1 }}>
                <Text
                  style={{
                    fontSize: 32,
                    fontWeight: "700",
                    color: "#D4A017",
                  }}
                >
                  {totalEntries}
                </Text>
                <Text style={{ marginTop: 4, color: "#B8860B", fontSize: 14 }}>
                  Entries
                </Text>
              </View>
              <View style={{ alignItems: "center", flex: 1 }}>
                <Text
                  style={{
                    fontSize: 32,
                    fontWeight: "700",
                    color: "#D4A017",
                  }}
                >
                  {uniqueMoods}
                </Text>
                <Text style={{ marginTop: 4, color: "#B8860B", fontSize: 14 }}>
                  Moods
                </Text>
              </View>
              <View style={{ alignItems: "center", flex: 1 }}>
                <Text
                  style={{
                    fontSize: 32,
                    fontWeight: "700",
                    color: "#D4A017",
                  }}
                >
                  {currentStreak}
                </Text>
                <Text style={{ marginTop: 4, color: "#B8860B", fontSize: 14 }}>
                  Streak
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Diary Streak */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 16 }}>
          <View
            style={{
              backgroundColor: "#DDA0DD",
              borderRadius: 24,
              padding: 24,
              borderWidth: 2,
              borderColor: "#DA70D6",
              shadowColor: "#DDA0DD",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                marginBottom: 16,
                color: "white",
              }}
            >
              Diary Streak
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              {last7DaysData.map((day, index) => (
                <View key={index} style={{ alignItems: "center" }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      marginBottom: 8,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: day.hasEntry
                        ? "#BA55D3"
                        : "rgba(255, 255, 255, 0.4)",
                      borderWidth: 2,
                      borderColor: day.hasEntry
                        ? "#9932CC"
                        : "rgba(255, 255, 255, 0.6)",
                    }}
                  >
                    {day.hasEntry && (
                      <Text
                        style={{
                          color: "white",
                          fontSize: 16,
                          fontWeight: "700",
                        }}
                      >
                        ✓
                      </Text>
                    )}
                    {!day.hasEntry && (
                      <Text
                        style={{
                          color: "rgba(255, 255, 255, 0.7)",
                          fontSize: 16,
                        }}
                      >
                        +
                      </Text>
                    )}
                  </View>
                  <Text style={{ fontSize: 12, color: "white" }}>
                    {day.date}
                  </Text>
                </View>
              ))}
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 20 }}>🔥</Text>
              <Text style={{ marginLeft: 8, color: "white", fontSize: 14 }}>
                Longest chain:{" "}
                <Text style={{ fontWeight: "700", color: "#FFE4E1" }}>
                  {longestStreak}
                </Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Writing Templates Card */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 16 }}>
          <View
            style={{
              backgroundColor: "#B5EAD7",
              borderRadius: 24,
              padding: 24,
              position: "relative",
              overflow: "hidden",
              borderWidth: 2,
              borderColor: "#A8E6CF",
              shadowColor: "#B5EAD7",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                marginBottom: 8,
                color: "#2F855A",
              }}
            >
              No ideas to write about?
            </Text>
            <Text style={{ marginBottom: 16, color: "#38A169", fontSize: 14 }}>
              Try out the writing templates!
            </Text>

            <TouchableOpacity
              style={{
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 16,
                alignSelf: "flex-start",
                backgroundColor: "#48BB78",
              }}
            >
              <Text style={{ fontWeight: "600", color: "white" }}>Try it</Text>
            </TouchableOpacity>

            <View style={{ position: "absolute", right: 16, top: 16 }}>
              <Text style={{ fontSize: 40 }}>💡</Text>
            </View>
            <View style={{ position: "absolute", right: 32, bottom: 16 }}>
              <Text style={{ fontSize: 32 }}>📖</Text>
            </View>
          </View>
        </View>

        {/* Trends */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 16 }}>
          <View
            style={{
              backgroundColor: "#FFB6C1",
              borderRadius: 24,
              padding: 24,
              borderWidth: 2,
              borderColor: "#FF69B4",
              shadowColor: "#FFB6C1",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                marginBottom: 16,
                color: "#C71585",
              }}
            >
              Trends
            </Text>

            {moodStats.length > 0 ? (
              <View>
                <View style={{ marginBottom: 16 }}>
                  {moodStats.map((stat, index) => (
                    <View
                      key={stat.mood}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 12,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        borderRadius: 12,
                        backgroundColor: "rgba(255, 255, 255, 0.5)",
                        borderWidth: 1,
                        borderColor: "rgba(255, 255, 255, 0.8)",
                      }}
                    >
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Text style={{ fontSize: 28, marginRight: 12 }}>
                          {stat.emoji}
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontWeight: "700",
                          color: "#C71585",
                          fontSize: 16,
                        }}
                      >
                        {stat.percentage}%
                      </Text>
                    </View>
                  ))}
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    height: 16,
                    borderRadius: 20,
                    overflow: "hidden",
                    backgroundColor: "rgba(255, 255, 255, 0.4)",
                    borderWidth: 2,
                    borderColor: "rgba(255, 255, 255, 0.6)",
                  }}
                >
                  {moodStats.map((stat, index) => (
                    <View
                      key={stat.mood}
                      style={{
                        backgroundColor: stat.color,
                        flex: stat.percentage,
                        opacity: 0.9,
                      }}
                    />
                  ))}
                </View>
              </View>
            ) : (
              <Text
                style={{
                  textAlign: "center",
                  paddingVertical: 16,
                  color: "#DB7093",
                }}
              >
                No mood data available yet
              </Text>
            )}
          </View>
        </View>

        {/* Mood Graph */}
        {moodTrendData &&
          moodTrendData.datasets[0].data.some((val: number) => val > 0) && (
            <View style={{ paddingHorizontal: 24, paddingVertical: 16 }}>
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 24,
                  padding: 24,
                  borderWidth: 2,
                  borderColor: "#C78EFF",
                  shadowColor: "#D4A5FF",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "600",
                    marginBottom: 16,
                    color: "white",
                  }}
                >
                  Mood Graph
                </Text>

                <View style={{ marginBottom: 16 }}>
                  {moodConfig
                    .slice()
                    .reverse()
                    .map((config, index) => (
                      <View
                        key={config.mood}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <Text style={{ fontSize: 18, marginRight: 8 }}>
                          {config.emoji}
                        </Text>
                        <View
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: 20,
                            marginRight: 8,
                            backgroundColor: config.color,
                          }}
                        />
                      </View>
                    ))}
                </View>

                <LineChart
                  data={moodTrendData}
                  width={screenWidth - 96}
                  height={220}
                  chartConfig={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    backgroundGradientFrom: "rgba(255, 255, 255, 0.2)",
                    backgroundGradientTo: "rgba(255, 255, 255, 0.3)",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(186, 85, 211, ${opacity})`,
                    labelColor: (opacity = 1) =>
                      `rgba(255, 255, 255, ${opacity})`,
                    style: {
                      borderRadius: 16,
                    },
                    propsForDots: {
                      r: "6",
                      strokeWidth: "3",
                      stroke: "#BA55D3",
                      fill: "#DDA0DD",
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
      </ScrollView>
    </View>
  );
};

export default InsightsScreen;
