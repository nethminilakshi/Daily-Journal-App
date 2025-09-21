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
          backgroundColor: "#1c1c2b",
        }}
      >
        <ActivityIndicator size="large" color="#B0C4DE" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#1c1c2b" }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#B0C4DE", // Light steel blue
          tabBarInactiveTintColor: "#6B7280", // Gray
          tabBarStyle: {
            backgroundColor: "#1a1a2e",
            borderTopWidth: 1,
            borderTopColor: "rgba(255, 255, 255, 0.1)",
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
                      ? "rgba(176, 196, 222, 0.15)"
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
                      ? "rgba(176, 196, 222, 0.15)"
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
                    backgroundColor: "rgba(176, 196, 222, 0.8)",
                    borderRadius: 28,
                    justifyContent: "center",
                    alignItems: "center",
                    shadowColor: "#B0C4DE",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                    borderWidth: 1,
                    borderColor: "rgba(176, 196, 222, 0.4)",
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
                      ? "rgba(176, 196, 222, 0.15)"
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
                      ? "rgba(176, 196, 222, 0.15)"
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
