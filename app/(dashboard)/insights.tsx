import React from "react";
import { StatusBar, Text, View } from "react-native";

const InsightsScreen = () => {
  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <View className="pt-12 px-6 pb-4">
        <Text className="text-3xl font-bold text-gray-800">Insights</Text>
        <Text className="text-gray-600 mt-1">
          Your mood patterns and statistics
        </Text>
      </View>

      {/* Placeholder Content */}
      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-gray-500 text-lg text-center mb-4">
          📊 Coming Soon
        </Text>
        <Text className="text-gray-400 text-center">
          Mood analytics, streak counters, and{"\n"}
          detailed insights will appear here
        </Text>
      </View>
    </View>
  );
};

export default InsightsScreen;
