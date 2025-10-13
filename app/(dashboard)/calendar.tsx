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

const CalendarComponent: React.FC<CalendarProps> = ({
  entries,
  onDateSelect,
  selectedDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<number>(
    selectedDate ? selectedDate.getDate() : new Date().getDate()
  );

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEntriesForDate = (date: Date): JournalEntry[] => {
    if (!entries || !Array.isArray(entries)) return [];
    const dateString = date.toDateString();
    return entries.filter((entry) => {
      const entryDate = new Date(entry.createdAt);
      return entryDate.toDateString() === dateString;
    });
  };

  const hasEntries = (day: number): boolean => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    return getEntriesForDate(date).length > 0;
  };

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

  const generateCalendarDays = (): (number | null)[] => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

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
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        marginHorizontal: 20,
        marginBottom: 24,
        padding: 20,
        borderWidth: 2,
        borderColor: "#6B5B95",
        shadowColor: "#D4A5FF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
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
        <TouchableOpacity
          onPress={goToPreviousMonth}
          style={{
            padding: 8,
            backgroundColor: "#F5F0FF",
            borderRadius: 8,
          }}
        >
          <Text style={{ fontSize: 18, color: "#6B5B95" }}>←</Text>
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: "#CC66DA",
          }}
        >
          {currentMonth.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </Text>

        <TouchableOpacity
          onPress={goToNextMonth}
          style={{
            padding: 8,
            backgroundColor: "#F5F0FF",
            borderRadius: 8,
          }}
        >
          <Text style={{ fontSize: 18, color: "#6B5B95" }}>→</Text>
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
              color: "#9B89BD",
              fontWeight: "600",
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
              <View
                key={`empty-${index}`}
                style={{ width: 40, height: 40, margin: 4 }}
              />
            );
          }

          const isToday = isCurrentMonth && day === today.getDate();
          const isSelected = day === selectedDay;
          const hasEntriesForDay = hasEntries(day);

          return (
            <TouchableOpacity
              key={`day-${index}-${day}`}
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
                  ? "#D4A5FF"
                  : isToday
                    ? "#F0E6FF"
                    : "transparent",
                borderWidth: isToday ? 2 : 0,
                borderColor: "#9B89BD",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: isSelected
                    ? "#FFFFFF"
                    : isToday
                      ? "#6B5B95"
                      : "#6B5B95",
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
                    width: 5,
                    height: 5,
                    borderRadius: 2.5,
                    backgroundColor: isSelected ? "#FFFFFF" : "#D4A5FF",
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

const DashboardScreen: React.FC = () => {
  const router = useRouter();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);

  const fetchJournalData = async (): Promise<void> => {
    try {
      setError(null);
      const journalEntries = await journalService.getAllJournalEntries();
      setEntries(journalEntries);

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

  useFocusEffect(
    useCallback(() => {
      if (!loading) {
        fetchJournalData();
      }
    }, [loading])
  );

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await fetchJournalData();
    setRefreshing(false);
  };

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

  const handleDateSelect = (
    date: Date,
    entriesForDate: JournalEntry[]
  ): void => {
    setSelectedDate(date);
    setFilteredEntries(entriesForDate);
  };

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

  const handleNavigateToEntry = (entry: JournalEntry): void => {
    router.push(`/JournalEntries/${entry.id}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#E8D5F2" }}>
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
              color: "#9E1C60",
            }}
          >
            Calendar
          </Text>
          <View
            style={{
              backgroundColor: "#9E1C60",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "#E6D9FF",
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

        <CalendarComponent
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
              color: "#B95E82",
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
              <ActivityIndicator size="large" color="#C5B3E6" />
              <Text style={{ marginLeft: 12, color: "#9B89BD" }}>
                Loading entries...
              </Text>
            </View>
          )}

          {/* Error State */}
          {error && (
            <View
              style={{
                backgroundColor: "#FFF4ED",
                borderWidth: 1,
                borderColor: "#FFD4BA",
                borderRadius: 16,
                padding: 18,
                marginBottom: 24,
                shadowColor: "#FFB88C",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Text
                style={{
                  color: "#8B5A3C",
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
                  backgroundColor: "#FFB88C",
                  borderRadius: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 18,
                  alignSelf: "center",
                }}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>Retry</Text>
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
                    backgroundColor: "#FFFFFF",
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: "#E6D9FF",
                    shadowColor: "#6B5B95",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                    elevation: 2,
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
                            color: "#6B5B95",
                            flex: 1,
                          }}
                        >
                          {entry.title}
                        </Text>
                      </View>
                      <Text
                        style={{
                          color: "#6B5B95",
                          fontSize: 14,
                          lineHeight: 20,
                          opacity: 0.8,
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
                      borderTopColor: "#F0E6FF",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#B5A6C9",
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
                  width: 100,
                  height: 100,
                  backgroundColor: "#F5F0FF",
                  borderRadius: 50,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                  shadowColor: "#D4A5FF",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  elevation: 3,
                  borderWidth: 2,
                  borderColor: "#E6D9FF",
                }}
              >
                <BookOpen size={40} color="#9B89BD" />
              </View>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "700",
                  color: "#B95E82",
                  marginBottom: 12,
                }}
              >
                No entries for this date
              </Text>
              <Text
                style={{
                  color: "#9B89BD",
                  textAlign: "center",
                  marginBottom: 28,
                  paddingHorizontal: 32,
                  lineHeight: 24,
                  fontSize: 16,
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

export default DashboardScreen;
