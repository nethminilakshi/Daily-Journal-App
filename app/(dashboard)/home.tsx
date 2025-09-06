import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { StatusBar, Text, TouchableOpacity, View } from "react-native";

const HomeScreen = () => {
  const router = useRouter();

  const handleAddEntry = () => {
    router.push("/add");
  };

  const handleViewCalendar = () => {
    router.push("/calendar");
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <View className="flex-row justify-between items-center pt-12 px-6 pb-4">
        <Text className="text-3xl font-bold text-gray-800">Diary</Text>
        <View className="bg-pink-400 px-4 py-2 rounded-full">
          <Text className="text-white font-semibold text-sm">PREMIUM</Text>
        </View>
      </View>

      {/* Hero Image Card */}
      <View className="mx-6 mb-8">
        <View className="h-64 bg-gradient-to-br from-purple-200 to-pink-200 rounded-3xl overflow-hidden relative">
          {/* Gradient Background */}
          <LinearGradient
            colors={["#E879F9", "#F472B6", "#FBBF24"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="absolute inset-0"
          />

          {/* Sun */}
          <View className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-yellow-200 rounded-full opacity-80" />

          {/* Water Reflection */}
          <View className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-blue-300 to-transparent opacity-60" />

          {/* Boat */}
          <View className="absolute bottom-8 right-16">
            <View className="w-12 h-6 bg-amber-800 rounded-full" />
            <View className="w-2 h-8 bg-amber-900 absolute left-1/2 transform -translate-x-1/2 -top-8" />
          </View>

          {/* Birds */}
          <View className="absolute top-8 left-12">
            <Text className="text-gray-700 text-lg">ᵛ</Text>
          </View>
          <View className="absolute top-12 left-20">
            <Text className="text-gray-700 text-sm">ᵛ</Text>
          </View>
          <View className="absolute top-6 left-8">
            <Text className="text-gray-700 text-sm">ᵛ</Text>
          </View>

          {/* Profile Icon */}
          <View className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex justify-center items-center">
            <View className="w-6 h-6 bg-pink-400 rounded-full" />
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View className="flex-1 px-6">
        <Text className="text-3xl font-bold text-gray-800 text-center mb-4">
          Every moment matters
        </Text>
        <Text className="text-lg text-gray-600 text-center leading-relaxed px-4 mb-8">
          Start journaling your thoughts and feelings{"\n"}
          in your private, secure diary
        </Text>

        {/* Quick Action Buttons */}
        <View className="space-y-4">
          <TouchableOpacity
            onPress={handleAddEntry}
            className="bg-pink-400 rounded-2xl p-4 shadow-sm"
          >
            <View className="flex-row items-center justify-center">
              <Text className="text-white text-lg font-semibold">
                Write Today's Entry
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleViewCalendar}
            className="bg-white border border-pink-200 rounded-2xl p-4 shadow-sm"
          >
            <View className="flex-row items-center justify-center">
              <Text className="text-pink-400 text-lg font-semibold">
                View Past Entries
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Stats Section (Optional) */}
        <View className="mt-8 bg-white rounded-2xl p-6 shadow-sm">
          <Text className="text-gray-800 font-semibold text-lg mb-4 text-center">
            Your Journey
          </Text>
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-2xl font-bold text-pink-400">15</Text>
              <Text className="text-gray-600 text-sm">Total Entries</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-green-500">7</Text>
              <Text className="text-gray-600 text-sm">Day Streak</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-blue-500">😊</Text>
              <Text className="text-gray-600 text-sm">Recent Mood</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default HomeScreen;
