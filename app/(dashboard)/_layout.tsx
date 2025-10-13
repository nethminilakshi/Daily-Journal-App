import { MaterialIcons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";

const DashboardLayout = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  console.log("User Data :", user);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#ffffff",
        }}
      >
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#FF1493",
          tabBarInactiveTintColor: "#6B7280",
          tabBarStyle: {
            backgroundColor: "#ffffff",
            borderTopWidth: 1,
            borderTopColor: "rgba(0, 0, 0, 0.1)",
            height: 80,
            paddingBottom: 20,
            paddingTop: 10,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "500",
            marginTop: 4,
          },
        }}
      >
        <Tabs.Screen
          name="JournalEntries"
          options={{
            title: "Diary",
            tabBarIcon: ({ color, focused }) => (
              <View style={{ alignItems: "center" }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: focused
                      ? "rgba(74, 144, 226, 0.15)"
                      : "transparent",
                    borderRadius: 8,
                  }}
                >
                  <MaterialIcons name="book" size={24} color={color} />
                </View>
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="calendar"
          options={{
            title: "Calendar",
            tabBarIcon: ({ color, focused }) => (
              <View style={{ alignItems: "center" }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: focused
                      ? "rgba(74, 144, 226, 0.15)"
                      : "transparent",
                    borderRadius: 8,
                  }}
                >
                  <MaterialIcons
                    name="calendar-today"
                    size={24}
                    color={color}
                  />
                </View>
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="add"
          options={{
            title: "",
            tabBarButton: ({ style }) => (
              <TouchableOpacity
                onPress={() => router.push("/add")}
                style={[style, { alignItems: "center", marginTop: -8 }]}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    backgroundColor: "#D6A99D",
                    borderRadius: 28,
                    justifyContent: "center",
                    alignItems: "center",
                    shadowColor: "#4A90E2",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                    borderWidth: 1,
                    borderColor: "rgba(74, 144, 226, 0.4)",
                  }}
                >
                  <MaterialIcons name="add" size={28} color="white" />
                </View>
              </TouchableOpacity>
            ),
          }}
        />

        <Tabs.Screen
          name="insights"
          options={{
            title: "Insights",
            tabBarIcon: ({ color, focused }) => (
              <View style={{ alignItems: "center" }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: focused
                      ? "rgba(74, 144, 226, 0.15)"
                      : "transparent",
                    borderRadius: 8,
                  }}
                >
                  <MaterialIcons name="insights" size={24} color={color} />
                </View>
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="setting"
          options={{
            title: "Setting",
            tabBarIcon: ({ color, focused }) => (
              <View style={{ alignItems: "center" }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: focused
                      ? "rgba(74, 144, 226, 0.15)"
                      : "transparent",
                    borderRadius: 8,
                  }}
                >
                  <MaterialIcons name="settings" size={24} color={color} />
                </View>
              </View>
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
};

export default DashboardLayout;
