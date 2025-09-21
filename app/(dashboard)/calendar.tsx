import { useFocusEffect } from "@react-navigation/native";
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
import journalService, { JournalEntry } from "../../services/journalService";

// Calendar Component
interface CalendarProps {
  entries: JournalEntry[];
  onDateSelect: (date: Date, entriesForDate: JournalEntry[]) => void;
  selectedDate: Date;
}

const Calendar: React.FC<CalendarProps> = ({
  entries,
  onDateSelect,
  selectedDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<number>(
    selectedDate ? selectedDate.getDate() : new Date().getDate()
  );

  // Get days in month
  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Get entries for a specific date
  const getEntriesForDate = (date: Date): JournalEntry[] => {
    if (!entries || !Array.isArray(entries)) return [];
    const dateString = date.toDateString();
    return entries.filter((entry) => {
      const entryDate = new Date(entry.createdAt);
      return entryDate.toDateString() === dateString;
    });
  };

  // Check if date has entries
  const hasEntries = (day: number): boolean => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    return getEntriesForDate(date).length > 0;
  };

  // Handle date selection
  const handleDateSelect = (day: number): void => {
    setSelectedDay(day);
    const selectedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    const entriesForDate = getEntriesForDate(selectedDate);
    onDateSelect(selectedDate, entriesForDate);
  };

  // Navigate months
  const goToPreviousMonth = (): void => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = (): void => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  // Generate calendar days
  const generateCalendarDays = (): (number | null)[] => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days: (number | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const today = new Date();
  const isCurrentMonth =
    currentMonth.getMonth() === today.getMonth() &&
    currentMonth.getFullYear() === today.getFullYear();

  return (
    <View
      style={{
        backgroundColor: "#302939",
        borderRadius: 20,
        marginHorizontal: 20,
        marginBottom: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
      }}
    >
      {/* Month Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <TouchableOpacity onPress={goToPreviousMonth} style={{ padding: 8 }}>
          <Text style={{ fontSize: 18, color: "#B0B0B0" }}>←</Text>
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: "#F5F5F5",
          }}
        >
          {currentMonth.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </Text>

        <TouchableOpacity onPress={goToNextMonth} style={{ padding: 8 }}>
          <Text style={{ fontSize: 18, color: "#B0B0B0" }}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Days of Week Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          marginBottom: 12,
        }}
      >
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <Text
            key={day}
            style={{
              fontSize: 12,
              color: "#A0A0A0",
              fontWeight: "500",
              width: 40,
              textAlign: "center",
            }}
          >
            {day}
          </Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {calendarDays.map((day, index) => {
          if (day === null) {
            return (
              <View key={index} style={{ width: 40, height: 40, margin: 4 }} />
            );
          }

          const isToday = isCurrentMonth && day === today.getDate();
          const isSelected = day === selectedDay;
          const hasEntriesForDay = hasEntries(day);

          return (
            <TouchableOpacity
              key={day}
              onPress={() => handleDateSelect(day)}
              style={{
                width: 40,
                height: 40,
                margin: 4,
                borderRadius: 12,
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
                backgroundColor: isSelected
                  ? "rgba(176, 196, 222, 0.8)"
                  : isToday
                    ? "rgba(173, 216, 230, 0.2)"
                    : "transparent",
                borderWidth: isToday ? 2 : 0,
                borderColor: "rgba(173, 216, 230, 0.6)",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: isSelected
                    ? "#ffffff"
                    : isToday
                      ? "#B0C4DE"
                      : "#E0E0E0",
                }}
              >
                {day}
              </Text>

              {/* Entry indicator dot */}
              {hasEntriesForDay && (
                <View
                  style={{
                    position: "absolute",
                    bottom: 4,
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: isSelected
                      ? "#ffffff"
                      : "rgba(70, 130, 180, 0.8)",
                  }}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const HomeScreen: React.FC = () => {
  const router = useRouter();

  // State for journal data
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Calendar state - Calendar is now shown by default
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);

  // Load data from Firebase
  const fetchJournalData = async (): Promise<void> => {
    try {
      setError(null);
      const journalEntries = await journalService.getAllJournalEntries();
      setEntries(journalEntries);

      // Update filtered entries for selected date
      const entriesForDate = getEntriesForDate(selectedDate, journalEntries);
      setFilteredEntries(entriesForDate);
    } catch (err) {
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
  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await fetchJournalData();
    setRefreshing(false);
  };

  // Get entries for a specific date
  const getEntriesForDate = (
    date: Date,
    allEntries: JournalEntry[] = entries
  ): JournalEntry[] => {
    if (!allEntries || !Array.isArray(allEntries)) return [];
    const dateString = date.toDateString();
    return allEntries.filter((entry) => {
      const entryDate = new Date(entry.createdAt);
      return entryDate.toDateString() === dateString;
    });
  };

  // Handle calendar date selection
  const handleDateSelect = (
    date: Date,
    entriesForDate: JournalEntry[]
  ): void => {
    setSelectedDate(date);
    setFilteredEntries(entriesForDate);
  };

  // Get mood emoji
  const getMoodEmoji = (mood: string): string => {
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
  const formatDate = (date: Date): string => {
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
  const handleNavigateToEntry = (entry: JournalEntry): void => {
    router.push(`/JournalEntries/${entry.id}`);
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
          <Text
            style={{
              fontSize: 32,
              fontWeight: "700",
              color: "#F5F5F5",
            }}
          >
            📅 Calendar
          </Text>
          <View
            style={{
              backgroundColor: "rgba(176, 196, 222, 0.8)",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "rgba(176, 196, 222, 0.4)",
            }}
          >
            <Text
              style={{
                color: "white",
                fontWeight: "600",
                fontSize: 14,
              }}
            >
              PREMIUM
            </Text>
          </View>
        </View>

        {/* Calendar Component - Always displayed */}
        <Calendar
          entries={entries}
          onDateSelect={handleDateSelect}
          selectedDate={selectedDate}
        />

        {/* Selected Date Header */}
        <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: "#E0E0E0",
            }}
          >
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>

        {/* Main Content */}
        <View style={{ paddingHorizontal: 24 }}>
          {/* Loading State */}
          {loading && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                paddingVertical: 32,
              }}
            >
              <ActivityIndicator size="large" color="#B0C4DE" />
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
                padding: 16,
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  color: "#FFE4B5",
                  textAlign: "center",
                  marginBottom: 8,
                }}
              >
                {error}
              </Text>
              <TouchableOpacity
                onPress={fetchJournalData}
                style={{
                  backgroundColor: "rgba(255, 140, 0, 0.8)",
                  borderRadius: 8,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  alignSelf: "center",
                }}
              >
                <Text style={{ color: "white", fontWeight: "500" }}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Journal Entries List */}
          {!loading && filteredEntries.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              {filteredEntries.map((entry, index) => (
                <TouchableOpacity
                  key={entry.id}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.06)",
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: "rgba(255, 255, 255, 0.1)",
                  }}
                  onPress={() => handleNavigateToEntry(entry)}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 8,
                    }}
                  >
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 6,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 20,
                            marginRight: 8,
                          }}
                        >
                          {getMoodEmoji(entry.mood)}
                        </Text>
                        <Text
                          style={{
                            fontSize: 17,
                            fontWeight: "600",
                            color: "#F0F0F0",
                            flex: 1,
                          }}
                        >
                          {entry.title}
                        </Text>
                      </View>
                      <Text
                        style={{
                          color: "#D0D0D0",
                          fontSize: 14,
                          lineHeight: 20,
                          opacity: 0.9,
                        }}
                        numberOfLines={3}
                      >
                        {entry.content}
                      </Text>
                    </View>
                  </View>

                  {/* Entry Stats */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingTop: 12,
                      borderTopWidth: 1,
                      borderTopColor: "rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: "rgba(176, 196, 222, 0.15)",
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 12,
                        marginRight: 8,
                        borderWidth: 1,
                        borderColor: "rgba(176, 196, 222, 0.3)",
                      }}
                    ></View>
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#A0A0A0",
                        fontWeight: "500",
                      }}
                    >
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
          {!loading && filteredEntries.length === 0 && (
            <View style={{ alignItems: "center", paddingVertical: 48 }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  backgroundColor: "rgba(176, 196, 222, 0.15)",
                  borderRadius: 40,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                  borderWidth: 2,
                  borderColor: "rgba(176, 196, 222, 0.3)",
                }}
              >
                <BookOpen size={32} color="#B0C4DE" />
              </View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "600",
                  color: "#E0E0E0",
                  marginBottom: 8,
                }}
              >
                No entries for this date
              </Text>
              <Text
                style={{
                  color: "#B0B0B0",
                  textAlign: "center",
                  marginBottom: 24,
                  paddingHorizontal: 32,
                  lineHeight: 22,
                }}
              >
                Select another date to see entries or write a new one for this
                day
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
