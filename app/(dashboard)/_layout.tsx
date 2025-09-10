import { useAuth } from "@/context/AuthContext";
import { MaterialIcons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  View,
} from "react-native";

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
      <View className="flex-1 w-full justify-center align-items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#EC4899", // Pink-500
          tabBarInactiveTintColor: "#6B7280", // Gray-500
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#E5E7EB",
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
              <View className="items-center">
                <View
                  className={`w-8 h-8 items-center justify-center ${focused ? "bg-pink-100" : ""} rounded-lg`}
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
              <View className="items-center">
                <View
                  className={`w-8 h-8 items-center justify-center ${focused ? "bg-pink-100" : ""} rounded-lg`}
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
            tabBarIcon: ({ focused }) => (
              <TouchableOpacity className="items-center -mt-2">
                <View className="w-14 h-14 bg-pink-400 rounded-full flex justify-center items-center shadow-lg">
                  <MaterialIcons name="add" size={28} color="white" />
                </View>
              </TouchableOpacity>
            ),
          }}
          listeners={{
            tabPress: (e) => {
              // Prevent default navigation
              e.preventDefault();
              // Navigate to add entry screen or show modal
              router.push("/add");
            },
          }}
        />

        <Tabs.Screen
          name="insights"
          options={{
            title: "Insights",
            tabBarIcon: ({ color, focused }) => (
              <View className="items-center">
                <View
                  className={`w-8 h-8 items-center justify-center ${focused ? "bg-pink-100" : ""} rounded-lg`}
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
            title: "Settings",
            tabBarIcon: ({ color, focused }) => (
              <View className="items-center">
                <View
                  className={`w-8 h-8 items-center justify-center ${focused ? "bg-pink-100" : ""} rounded-lg`}
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
