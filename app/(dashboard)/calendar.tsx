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
        backgroundColor: "#ffffff",
        borderRadius: 20,
        marginHorizontal: 20,
        marginBottom: 24,
        padding: 20,
        shadowColor: "#e2e8f0",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
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
          <Text style={{ fontSize: 18, color: "#9ca3af" }}>←</Text>
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: "#4a5568",
          }}
        >
          {currentMonth.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </Text>

        <TouchableOpacity onPress={goToNextMonth} style={{ padding: 8 }}>
          <Text style={{ fontSize: 18, color: "#9ca3af" }}>→</Text>
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
              color: "#9ca3af",
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
                  ? "#f8bbd9"
                  : isToday
                    ? "#fef3ff"
                    : "transparent",
                borderWidth: isToday ? 2 : 0,
                borderColor: "#d8b4fe",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: isSelected
                    ? "#ffffff"
                    : isToday
                      ? "#6b46c1"
                      : "#4a5568",
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
                    backgroundColor: isSelected ? "#ffffff" : "#f8bbd9",
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
    <View
      style={{ flex: 1, backgroundColor: ["#0f0f1a", "#1a1a2e", "#2d1e40"][1] }}
    >
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
          <Text
            style={{
              fontSize: 32,
              fontWeight: "700",
              color: "#4a5568",
            }}
          >
            Calendar
          </Text>
          <View
            style={{
              backgroundColor: "#f8bbd9",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              shadowColor: "#f8bbd9",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 2,
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
              color: "#4a5568",
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
              <ActivityIndicator size="large" color="#f8bbd9" />
            </View>
          )}

          {/* Error State */}
          {error && (
            <View
              style={{
                backgroundColor: "#fef3c7",
                borderWidth: 1,
                borderColor: "#fcd34d",
                borderRadius: 16,
                padding: 16,
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  color: "#f59e0b",
                  textAlign: "center",
                  marginBottom: 8,
                }}
              >
                {error}
              </Text>
              <TouchableOpacity
                onPress={fetchJournalData}
                style={{
                  backgroundColor: "#fcd34d",
                  borderRadius: 8,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  alignSelf: "center",
                }}
              >
                <Text style={{ color: "#f59e0b", fontWeight: "500" }}>
                  Retry
                </Text>
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
                    backgroundColor: "#ffffff",
                    borderRadius: 20,
                    padding: 20,
                    marginBottom: 16,
                    shadowColor: "#e2e8f0",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                    elevation: 2,
                    borderWidth: 1,
                    borderColor: "#f1f5f9",
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
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "600",
                          color: "#4a5568",
                          marginBottom: 4,
                        }}
                      >
                        {entry.title}
                      </Text>
                      <Text
                        style={{
                          color: "#718096",
                          fontSize: 14,
                          lineHeight: 20,
                        }}
                        numberOfLines={3}
                      >
                        {entry.content}
                      </Text>
                    </View>
                    <View style={{ alignItems: "center" }}>
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          backgroundColor: "#fef3ff",
                          borderRadius: 12,
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 4,
                        }}
                      >
                        <Text style={{ fontSize: 20 }}>
                          {getMoodEmoji(entry.mood)}
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontSize: 10,
                          color: "#9ca3af",
                          textAlign: "center",
                        }}
                      >
                        {formatDate(new Date(entry.createdAt))}
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
                      borderTopColor: "#f1f5f9",
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: "#f8f9fa",
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 12,
                        marginRight: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          color: "#6b7280",
                          textTransform: "capitalize",
                        }}
                      >
                        {entry.mood}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 10, color: "#9ca3af" }}>
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
                  backgroundColor: "#f8f9fa",
                  borderRadius: 40,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                  shadowColor: "#e2e8f0",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 1,
                }}
              >
                <BookOpen size={32} color="#9ca3af" />
              </View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "600",
                  color: "#6b7280",
                  marginBottom: 8,
                }}
              >
                No entries for this date
              </Text>
              <Text
                style={{
                  color: "#9ca3af",
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
