import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { BookOpen, MoreVertical, Plus, Trash2 } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../../../firebase";
import journalService, { JournalEntry } from "../../../services/journalService";

const HomeScreen = () => {
  const router = useRouter();

  // State for journal data
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showMenuForEntry, setShowMenuForEntry] = useState<string | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<string | null>(null);

  // Load data from Firebase
  const fetchJournalData = async () => {
    try {
      if (!auth.currentUser) {
        throw new Error("User not authenticated");
      }

      setError(null);
      const journalEntries = await journalService.getAllJournalEntries();
      setEntries(journalEntries);
    } catch (err: any) {
      setError(err.message || "Failed to load journal entries");
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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchJournalData();
    setRefreshing(false);
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

  // Handle navigation to journal entry
  const handleNavigateToEntry = (entry: JournalEntry) => {
    try {
      setShowMenuForEntry(null);
      router.push(`/JournalEntries/${entry.id}`);
    } catch (err) {
      Alert.alert("Navigation Error", "Failed to open journal entry");
    }
  };

  // Handle add new entry
  const handleAddEntry = () => {
    try {
      router.push("/add");
    } catch (err) {
      Alert.alert("Navigation Error", "Failed to open add journal screen");
    }
  };

  // Handle delete entry
  const handleDeleteEntry = async (entry: JournalEntry) => {
    setShowMenuForEntry(null);

    Alert.alert(
      "Delete Entry",
      `Are you sure you want to delete "${entry.title}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingEntry(entry.id);
              await journalService.delete(entry.id);
              await fetchJournalData();
              Alert.alert("Success", "Journal entry deleted successfully");
            } catch (error) {
              Alert.alert(
                "Error",
                error instanceof Error
                  ? error.message
                  : "Failed to delete journal entry"
              );
            } finally {
              setDeletingEntry(null);
            }
          },
        },
      ]
    );
  };

  const handleShowMenu = (entryId: string, event: any) => {
    event.stopPropagation();
    setShowMenuForEntry(showMenuForEntry === entryId ? null : entryId);
  };

  const handleCloseMenu = () => {
    setShowMenuForEntry(null);
  };

  // Test data for debugging
  const testEntries: JournalEntry[] = [
    {
      id: "test1",
      title: "Test Entry 1",
      content: "This is a test entry to verify the UI is working",
      mood: "happy",
      createdAt: new Date(),
      userId: "test",
    },
    {
      id: "test2",
      title: "Test Entry 2",
      content: "Another test entry",
      mood: "relaxed",
      createdAt: new Date(Date.now() - 86400000),
      userId: "test",
    },
  ];

  const renderHeader = () => (
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
      <Text style={{ fontSize: 32, fontWeight: "700", color: "#F5F5F5" }}>
        Diary
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
        <Text style={{ color: "white", fontWeight: "600", fontSize: 14 }}>
          PREMIUM
        </Text>
      </View>
    </View>
  );

  const renderHeroCard = () => (
    <View
      style={{
        marginHorizontal: 20,
        marginBottom: 32,
        borderRadius: 24,
        overflow: "hidden",
        shadowColor: "#FF69B4",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
      }}
    >
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
        }}
        style={{
          height: 200,
          justifyContent: "center",
          alignItems: "center",
        }}
        imageStyle={{ borderRadius: 24 }}
      >
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(255, 105, 180, 0.2)",
            borderRadius: 24,
          }}
        />
        <View
          style={{
            alignItems: "center",
            paddingHorizontal: 24,
            zIndex: 1,
          }}
        >
          <Text
            style={{
              fontSize: 26,
              fontWeight: "800",
              color: "white",
              textAlign: "center",
              marginBottom: 8,
              textShadowColor: "rgba(255, 20, 147, 0.4)",
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 4,
            }}
          >
            Capture Your Journey
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "white",
              textAlign: "center",
              opacity: 0.95,
              textShadowColor: "rgba(138, 43, 226, 0.3)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 3,
            }}
          >
            Every moment is worth remembering
          </Text>
        </View>
      </ImageBackground>
    </View>
  );

  const renderLoadingState = () => (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        paddingVertical: 32,
      }}
    >
      <ActivityIndicator size="large" color="#B0C4DE" />
      <Text style={{ marginLeft: 12, color: "#B0C4DE" }}>
        Loading entries...
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View
      style={{
        backgroundColor: "rgba(255, 165, 0, 0.15)",
        borderWidth: 1,
        borderColor: "rgba(255, 140, 0, 0.3)",
        borderRadius: 16,
        padding: 18,
        marginBottom: 24,
        shadowColor: "#FFA500",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <Text
        style={{
          color: "#FFE4B5",
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
          backgroundColor: "rgba(255, 140, 0, 0.8)",
          borderRadius: 12,
          paddingVertical: 10,
          paddingHorizontal: 18,
          alignSelf: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "600" }}>Retry</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          setEntries(testEntries);
          setError(null);
        }}
        style={{
          backgroundColor: "rgba(138, 43, 226, 0.8)",
          borderRadius: 12,
          paddingVertical: 10,
          paddingHorizontal: 18,
          alignSelf: "center",
          marginTop: 8,
        }}
      >
        <Text style={{ color: "white", fontWeight: "600" }}>
          Test with dummy data
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={{ alignItems: "center", paddingVertical: 48 }}>
      <View
        style={{
          width: 100,
          height: 100,
          backgroundColor: "rgba(176, 196, 222, 0.2)",
          borderRadius: 50,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
          shadowColor: "#87CEEB",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 3,
          borderWidth: 2,
          borderColor: "rgba(135, 206, 235, 0.4)",
        }}
      >
        <BookOpen size={40} color="#B0C4DE" />
      </View>
      <Text
        style={{
          fontSize: 24,
          fontWeight: "700",
          color: "#E6E6FA",
          marginBottom: 12,
        }}
      >
        No entries yet
      </Text>
      <Text
        style={{
          color: "#B0C4DE",
          textAlign: "center",
          marginBottom: 28,
          paddingHorizontal: 32,
          lineHeight: 24,
          fontSize: 16,
        }}
      >
        Start your journaling journey by writing your first entry
      </Text>

      <TouchableOpacity
        onPress={handleAddEntry}
        style={{
          backgroundColor: "rgba(176, 196, 222, 0.8)",
          paddingHorizontal: 28,
          paddingVertical: 16,
          borderRadius: 28,
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor: "rgba(176, 196, 222, 0.4)",
        }}
      >
        <Plus size={22} color="white" style={{ marginRight: 8 }} />
        <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>
          Write First Entry
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderDropdownMenu = (entryId: string) => (
    <View
      style={{
        position: "absolute",
        top: 40,
        right: 8,
        width: 140,
        backgroundColor: "#2d1e40",
        borderRadius: 12,
        paddingVertical: 8,
        paddingHorizontal: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 20,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
      }}
    >
      <TouchableOpacity
        onPress={() => {
          const entry = entries.find((e) => e.id === entryId);
          if (entry) {
            setShowMenuForEntry(null);
            setTimeout(() => {
              handleDeleteEntry(entry);
            }, 100);
          }
        }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 12,
          paddingHorizontal: 12,
          borderRadius: 8,
        }}
      >
        <Trash2 size={18} color="#FF6B6B" />
        <Text
          style={{
            marginLeft: 10,
            fontSize: 15,
            color: "#FF6B6B",
            fontWeight: "600",
          }}
        >
          Delete
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderJournalEntry = (
    entry: JournalEntry,
    entryIndex: number,
    groupEntriesLength: number
  ) => {
    const entryDate = new Date(entry.createdAt);
    const isLastEntry = entryIndex === groupEntriesLength - 1;
    const isDeleting = deletingEntry === entry.id;

    return (
      <View
        key={entry.id}
        style={{
          marginBottom: 16,
          opacity: isDeleting ? 0.5 : 1,
        }}
      >
        <TouchableOpacity
          onPress={() => !isDeleting && handleNavigateToEntry(entry)}
          style={{
            position: "relative",
            paddingVertical: 8,
            paddingHorizontal: 4,
          }}
          disabled={isDeleting}
        >
          <Text
            style={{
              fontSize: 12,
              color: "#A0A0A0",
              fontWeight: "500",
              marginBottom: 10,
            }}
          >
            {entryDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>

          <TouchableOpacity
            onPress={(e) => !isDeleting && handleShowMenu(entry.id, e)}
            style={{
              position: "absolute",
              top: 5,
              right: 8,
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
            }}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#A0A0A0" />
            ) : (
              <MoreVertical size={16} color="#A0A0A0" />
            )}
          </TouchableOpacity>

          {showMenuForEntry === entry.id &&
            !isDeleting &&
            renderDropdownMenu(entry.id)}

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: "600",
                color: "#F0F0F0",
                flex: 1,
                paddingRight: 40,
              }}
            >
              <Text style={{ color: "#DDDAD0" }}>feeling</Text>{" "}
              <Text style={{ fontSize: 20 }}>{getMoodEmoji(entry.mood)}</Text>{" "}
              <Text style={{ color: "#DDDAD0" }}>with</Text> {entry.title}
            </Text>
          </View>

          <Text
            style={{
              color: "#E6E6FA",
              fontSize: 14,
              lineHeight: 20,
              opacity: 0.9,
              paddingRight: 20,
            }}
            numberOfLines={3}
          >
            {entry.content}
          </Text>
        </TouchableOpacity>

        {!isLastEntry && (
          <View
            style={{
              height: 1,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              marginTop: 16,
              marginHorizontal: -20,
            }}
          />
        )}
      </View>
    );
  };

  const renderDateGroup = (
    group: { date: string; entries: JournalEntry[] },
    groupIndex: number,
    totalGroups: number
  ) => {
    const groupDate = new Date(group.date);
    const isLastGroup = groupIndex === totalGroups - 1;

    return (
      <View key={group.date} style={{ position: "relative", marginBottom: 32 }}>
        <View style={{ flexDirection: "row", marginBottom: 16 }}>
          <View style={{ alignItems: "center", marginRight: 20 }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 25,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(70, 130, 180, 0.8)",
                borderWidth: 2,
                borderColor: "rgba(176, 196, 222, 0.4)",
                shadowColor: "rgba(176, 196, 222, 0.6)",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.4,
                shadowRadius: 6,
                elevation: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: "white",
                  zIndex: 1,
                  textShadowColor: "rgba(0, 0, 0, 0.3)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}
              >
                {groupDate.getDate()}
              </Text>
            </View>

            <Text
              style={{
                fontSize: 11,
                color: "#A0A0A0",
                fontWeight: "600",
                textAlign: "center",
                lineHeight: 13,
                marginTop: 4,
              }}
            >
              {groupDate.toLocaleDateString("en-US", {
                month: "short",
              })}
            </Text>
            <Text
              style={{
                fontSize: 10,
                color: "#808080",
                fontWeight: "500",
                textAlign: "center",
              }}
            >
              {groupDate.getFullYear()}
            </Text>

            {!isLastGroup && (
              <View
                style={{
                  width: 2,
                  height: group.entries.length * 120 + 40,
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  marginTop: 12,
                  position: "absolute",
                  top: 72,
                  zIndex: -1,
                }}
              />
            )}
          </View>
        </View>

        <View style={{ marginLeft: 76 }}>
          {group.entries.map((entry, entryIndex) =>
            renderJournalEntry(entry, entryIndex, group.entries.length)
          )}
        </View>
      </View>
    );
  };

  const groupedEntries = groupEntriesByDate(entries);

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
        {renderHeader()}
        {renderHeroCard()}

        <View style={{ paddingHorizontal: 24 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "700",
              color: "#E6E6FA",
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            Every moment matters
          </Text>

          {loading && renderLoadingState()}
          {error && renderErrorState()}

          {!loading && entries.length > 0 && !error && (
            <View style={{ marginBottom: 24 }}>
              <View style={{ padding: 16, marginBottom: 24 }}>
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "700",
                    color: "#B6B09F",
                    textAlign: "left",
                  }}
                >
                  Recent Entries
                </Text>
              </View>

              {groupedEntries.map((group, groupIndex) =>
                renderDateGroup(group, groupIndex, groupedEntries.length)
              )}
            </View>
          )}

          {!loading && entries.length === 0 && !error && renderEmptyState()}
        </View>
      </ScrollView>

      {showMenuForEntry && (
        <TouchableOpacity
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "transparent",
          }}
          onPress={handleCloseMenu}
          activeOpacity={1}
        />
      )}
    </View>
  );
};

export default HomeScreen;
