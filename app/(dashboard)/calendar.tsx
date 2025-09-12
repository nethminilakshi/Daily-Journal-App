import journalService, { JournalEntry } from "@/services/journalService";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { BookOpen, Calendar as CalendarIcon } from "lucide-react-native";
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
    <View className="bg-white rounded-2xl mx-4 mb-6 p-4 shadow-sm">
      {/* Month Header */}
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity onPress={goToPreviousMonth} className="p-2">
          <Text className="text-lg text-gray-600">←</Text>
        </TouchableOpacity>

        <Text className="text-lg font-bold text-gray-800">
          {currentMonth.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </Text>

        <TouchableOpacity onPress={goToNextMonth} className="p-2">
          <Text className="text-lg text-gray-600">→</Text>
        </TouchableOpacity>
      </View>

      {/* Days of Week Header */}
      <View className="flex-row justify-around mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <Text
            key={day}
            className="text-sm text-gray-400 font-medium w-10 text-center"
          >
            {day}
          </Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View className="flex-row flex-wrap">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <View key={index} className="w-10 h-10 m-1" />;
          }

          const isToday = isCurrentMonth && day === today.getDate();
          const isSelected = day === selectedDay;
          const hasEntriesForDay = hasEntries(day);

          return (
            <TouchableOpacity
              key={day}
              onPress={() => handleDateSelect(day)}
              className={`w-10 h-10 m-1 rounded-lg justify-center items-center relative ${
                isSelected
                  ? "bg-pink-500"
                  : isToday
                    ? "bg-pink-100 border-2 border-pink-300"
                    : "bg-transparent"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  isSelected
                    ? "text-white"
                    : isToday
                      ? "text-pink-600"
                      : "text-gray-800"
                }`}
              >
                {day}
              </Text>

              {/* Entry indicator dot */}
              {hasEntriesForDay && (
                <View
                  className={`absolute bottom-1 w-1 h-1 rounded-full ${
                    isSelected ? "bg-white" : "bg-pink-400"
                  }`}
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

  // Calendar state
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);

  // Load data from Firebase
  const fetchJournalData = async (): Promise<void> => {
    try {
      setError(null);
      const journalEntries = await journalService.getAllJournalEntries();
      console.log(
        "Fetched journal entries:",
        journalEntries.map((e) => ({ id: e.id, title: e.title }))
      );
      setEntries(journalEntries);

      // If calendar is showing, update filtered entries
      if (showCalendar) {
        const entriesForDate = getEntriesForDate(selectedDate, journalEntries);
        setFilteredEntries(entriesForDate);
      }
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

  // Toggle calendar view
  const toggleCalendar = (): void => {
    if (!showCalendar) {
      // When opening calendar, show entries for today
      const today = new Date();
      const todayEntries = getEntriesForDate(today);
      setSelectedDate(today);
      setFilteredEntries(todayEntries);
    }
    setShowCalendar(!showCalendar);
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

  // Get entries to display (filtered by date if calendar is shown, otherwise all entries)
  const displayEntries: JournalEntry[] = showCalendar
    ? filteredEntries
    : entries || [];

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
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={toggleCalendar}
              className={`p-2 rounded-full ${showCalendar ? "bg-pink-100" : "bg-gray-100"}`}
            >
              <CalendarIcon
                size={20}
                color={showCalendar ? "#EC4899" : "#6B7280"}
              />
            </TouchableOpacity>
            <View className="bg-pink-400 px-4 py-2 rounded-full">
              <Text className="text-white font-semibold text-sm">PREMIUM</Text>
            </View>
          </View>
        </View>

        {/* Calendar Component */}
        {showCalendar && (
          <>
            <Calendar
              entries={entries}
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
            />

            {/* Selected Date Header */}
            <View className="px-6 mb-4">
              <Text className="text-xl font-bold text-gray-800">
                Entries for{" "}
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
              <Text className="text-gray-600">
                {filteredEntries.length}{" "}
                {filteredEntries.length === 1 ? "entry" : "entries"} found
              </Text>
            </View>
          </>
        )}

        {/* Hero Image Card - Only show when calendar is hidden */}
        {!showCalendar && (
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
        )}

        {/* Main Content */}
        <View className="px-6">
          {/* Motivational Text - Only show when calendar is hidden */}
          {!showCalendar && (
            <>
              <Text className="text-3xl font-bold text-gray-800 text-center mb-4">
                Every moment matters
              </Text>
              <Text className="text-lg text-gray-600 text-center leading-relaxed px-4 mb-8">
                Start journaling your thoughts and feelings{"\n"}
                in your private, secure diary
              </Text>
            </>
          )}

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
          {!loading && displayEntries.length > 0 && (
            <View className="mb-6">
              <Text className="text-xl font-bold text-gray-800 mb-4">
                {showCalendar ? "Entries" : "Recent Entries"}
              </Text>
              {displayEntries.map((entry, index) => (
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
          {!loading && displayEntries.length === 0 && (
            <View className="items-center py-12">
              <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center mb-4">
                <BookOpen size={32} color="#9CA3AF" />
              </View>
              <Text className="text-xl font-semibold text-gray-800 mb-2">
                {showCalendar ? "No entries for this date" : "No entries yet"}
              </Text>
              <Text className="text-gray-600 text-center mb-6 px-8">
                {showCalendar
                  ? "Select another date to see entries or write a new one for this day"
                  : "Start your journaling journey by writing your first entry"}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
