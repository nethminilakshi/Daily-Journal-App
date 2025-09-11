import journalService, { JournalEntry, MoodType } from "./journalService";

// ================================================================
// TYPES
// ================================================================

export interface MoodStats {
  mood: MoodType;
  count: number;
  percentage: number;
  emoji: string;
  color: string;
  label: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  last7DaysData: DayStreak[];
}

export interface DayStreak {
  date: string;
  shortDate: string;
  hasEntry: boolean;
  dayNumber: number;
}

export interface InsightsData {
  totalEntries: number;
  uniqueMoods: number;
  currentStreak: number;
  longestStreak: number;
  moodStats: MoodStats[];
  streakData: StreakData;
  moodTrendData: MoodTrendData | null;
  last7DaysData: DayStreak[];
}

export interface MoodTrendData {
  labels: string[];
  datasets: {
    data: number[];
    strokeWidth: number;
    color: (opacity?: number) => string;
  }[];
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// ================================================================
// MOOD CONFIGURATION
// ================================================================

export const MOOD_CONFIG = [
  {
    mood: "excited" as MoodType,
    emoji: "🤩",
    color: "#06B6D4",
    label: "Excited",
    value: 5,
  },
  {
    mood: "happy" as MoodType,
    emoji: "😊",
    color: "#3B82F6",
    label: "Happy",
    value: 4,
  },
  {
    mood: "neutral" as MoodType,
    emoji: "😐",
    color: "#A855F7",
    label: "Neutral",
    value: 3,
  },
  {
    mood: "sad" as MoodType,
    emoji: "😢",
    color: "#EC4899",
    label: "Sad",
    value: 2,
  },
  {
    mood: "stressed" as MoodType,
    emoji: "😤",
    color: "#F97316",
    label: "Stressed",
    value: 1,
  },
];

// ================================================================
// UTILITY FUNCTIONS
// ================================================================

const getMoodConfig = (mood: MoodType) => {
  return MOOD_CONFIG.find((config) => config.mood === mood);
};

const formatDate = (date: Date) => {
  return {
    shortDate: date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    }),
    dayNumber: date.getDate(),
    fullDate: date.toDateString(),
  };
};

const isSameDay = (date1: Date, date2: Date) => {
  return date1.toDateString() === date2.toDateString();
};

const getDateDifference = (date1: Date, date2: Date) => {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// ================================================================
// INSIGHTS CALCULATION FUNCTIONS
// ================================================================

export const calculateMoodStatistics = (
  entries: JournalEntry[]
): MoodStats[] => {
  if (entries.length === 0) return [];

  const moodCounts: { [key in MoodType]?: number } = {};

  // Count mood occurrences
  entries.forEach((entry) => {
    moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
  });

  // Create mood statistics
  const stats: MoodStats[] = MOOD_CONFIG.map((config) => {
    const count = moodCounts[config.mood] || 0;
    const percentage =
      entries.length > 0 ? Math.round((count / entries.length) * 100) : 0;

    return {
      mood: config.mood,
      count,
      percentage,
      emoji: config.emoji,
      color: config.color,
      label: config.label,
    };
  })
    .filter((stat) => stat.count > 0)
    .sort((a, b) => b.count - a.count);

  return stats;
};

export const calculateStreakData = (entries: JournalEntry[]): StreakData => {
  if (entries.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      last7DaysData: generateLast7Days(new Set<string>()),
    };
  }

  // Sort entries by date (most recent first)
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Create date set for quick lookup
  const entryDates = new Set(
    sortedEntries.map((entry) => new Date(entry.createdAt).toDateString())
  );

  // Calculate current streak
  const currentStreak = calculateCurrentStreak(entryDates);

  // Calculate longest streak
  const longestStreak = calculateLongestStreak(entryDates);

  // Generate last 7 days data
  const last7DaysData = generateLast7Days(entryDates);

  return {
    currentStreak,
    longestStreak,
    last7DaysData,
  };
};

const calculateCurrentStreak = (entryDates: Set<string>): number => {
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

  return currentStreakCount;
};

const calculateLongestStreak = (entryDates: Set<string>): number => {
  if (entryDates.size === 0) return 0;

  // Get all unique dates and sort them
  const allDates = Array.from(entryDates)
    .map((dateStr) => new Date(dateStr))
    .sort((a, b) => a.getTime() - b.getTime());

  let longestStreak = 0;
  let currentStreak = 1;

  for (let i = 1; i < allDates.length; i++) {
    const currentDate = allDates[i];
    const previousDate = allDates[i - 1];
    const diffDays = getDateDifference(previousDate, currentDate);

    if (diffDays === 1) {
      currentStreak++;
    } else {
      longestStreak = Math.max(longestStreak, currentStreak);
      currentStreak = 1;
    }
  }

  return Math.max(longestStreak, currentStreak);
};

const generateLast7Days = (entryDates: Set<string>): DayStreak[] => {
  const last7Days: DayStreak[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const formatted = formatDate(date);

    last7Days.push({
      date: formatted.fullDate,
      shortDate: formatted.shortDate,
      dayNumber: formatted.dayNumber,
      hasEntry: entryDates.has(formatted.fullDate),
    });
  }

  return last7Days;
};

export const calculateMoodTrendData = (
  entries: JournalEntry[]
): MoodTrendData | null => {
  if (entries.length === 0) return null;

  const last7Days = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toDateString();

    // Find entry for this date
    const dayEntry = entries.find(
      (entry) => new Date(entry.createdAt).toDateString() === dateString
    );

    const moodConfig = dayEntry ? getMoodConfig(dayEntry.mood) : null;

    last7Days.push({
      date: date.getDate().toString(),
      mood: moodConfig ? moodConfig.value : 0,
      hasEntry: !!dayEntry,
    });
  }

  // Only return data if there are some entries
  const hasData = last7Days.some((day) => day.mood > 0);
  if (!hasData) return null;

  return {
    labels: last7Days.map((day) => day.date),
    datasets: [
      {
        data: last7Days.map((day) => day.mood || 0),
        strokeWidth: 3,
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
      },
    ],
  };
};

// ================================================================
// DATE RANGE UTILITIES
// ================================================================

export const getDateRanges = () => {
  const today = new Date();

  return {
    today: {
      startDate: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      ),
      endDate: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1
      ),
    },
    thisWeek: {
      startDate: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - 7
      ),
      endDate: today,
    },
    thisMonth: {
      startDate: new Date(today.getFullYear(), today.getMonth(), 1),
      endDate: today,
    },
    last30Days: {
      startDate: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - 30
      ),
      endDate: today,
    },
  };
};

// ================================================================
// MAIN INSIGHTS SERVICE CLASS
// ================================================================

class InsightsService {
  // Get complete insights data
  async getInsightsData(userId?: string): Promise<InsightsData> {
    try {
      // Fetch journal entries
      const entries = userId
        ? await journalService.getByUserId(userId)
        : await journalService.getAll();

      // Calculate basic stats
      const totalEntries = entries.length;
      const uniqueMoods = new Set(entries.map((entry) => entry.mood)).size;

      // Calculate mood statistics
      const moodStats = calculateMoodStatistics(entries);

      // Calculate streak data
      const streakData = calculateStreakData(entries);

      // Calculate mood trend data
      const moodTrendData = calculateMoodTrendData(entries);

      return {
        totalEntries,
        uniqueMoods,
        currentStreak: streakData.currentStreak,
        longestStreak: streakData.longestStreak,
        moodStats,
        streakData,
        moodTrendData,
        last7DaysData: streakData.last7DaysData,
      };
    } catch (error) {
      console.error("Error fetching insights data:", error);
      throw new Error("Failed to load insights data");
    }
  }

  // Get mood statistics only
  async getMoodStatistics(userId?: string): Promise<MoodStats[]> {
    try {
      const entries = userId
        ? await journalService.getByUserId(userId)
        : await journalService.getAll();

      return calculateMoodStatistics(entries);
    } catch (error) {
      console.error("Error fetching mood statistics:", error);
      throw new Error("Failed to load mood statistics");
    }
  }

  // Get streak data only
  async getStreakData(userId?: string): Promise<StreakData> {
    try {
      const entries = userId
        ? await journalService.getByUserId(userId)
        : await journalService.getAll();

      return calculateStreakData(entries);
    } catch (error) {
      console.error("Error fetching streak data:", error);
      throw new Error("Failed to load streak data");
    }
  }

  // Get insights for specific date range
  async getInsightsForDateRange(
    dateRange: DateRange,
    userId?: string
  ): Promise<InsightsData> {
    try {
      const entries = userId
        ? await journalService.getByUserId(userId)
        : await journalService.getAll();

      // Filter entries by date range
      const filteredEntries = entries.filter((entry) => {
        const entryDate = new Date(entry.createdAt);
        return (
          entryDate >= dateRange.startDate && entryDate <= dateRange.endDate
        );
      });

      // Calculate stats for filtered entries
      const totalEntries = filteredEntries.length;
      const uniqueMoods = new Set(filteredEntries.map((entry) => entry.mood))
        .size;
      const moodStats = calculateMoodStatistics(filteredEntries);
      const streakData = calculateStreakData(filteredEntries);
      const moodTrendData = calculateMoodTrendData(filteredEntries);

      return {
        totalEntries,
        uniqueMoods,
        currentStreak: streakData.currentStreak,
        longestStreak: streakData.longestStreak,
        moodStats,
        streakData,
        moodTrendData,
        last7DaysData: streakData.last7DaysData,
      };
    } catch (error) {
      console.error("Error fetching insights for date range:", error);
      throw new Error("Failed to load insights for date range");
    }
  }

  // Get mood trend for specific period
  async getMoodTrend(
    days: number = 7,
    userId?: string
  ): Promise<MoodTrendData | null> {
    try {
      const entries = userId
        ? await journalService.getByUserId(userId)
        : await journalService.getAll();

      // Filter entries for the specified number of days
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const filteredEntries = entries.filter(
        (entry) => new Date(entry.createdAt) >= startDate
      );

      return calculateMoodTrendData(filteredEntries);
    } catch (error) {
      console.error("Error fetching mood trend:", error);
      throw new Error("Failed to load mood trend");
    }
  }

  // Utility methods
  getMoodConfig(mood: MoodType) {
    return getMoodConfig(mood);
  }

  getDateRanges() {
    return getDateRanges();
  }

  formatDateForDisplay(date: Date) {
    return formatDate(date);
  }
}

// ================================================================
// EXPORT DEFAULT SERVICE INSTANCE
// ================================================================

const insightsService = new InsightsService();
export default insightsService;
