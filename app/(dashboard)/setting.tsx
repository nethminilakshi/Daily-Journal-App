import { auth } from "@/firebase";
import { useRouter } from "expo-router";
import {
  EmailAuthProvider,
  User as FirebaseUser,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { ArrowLeft, Check, Lock, User } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const UserSettingsScreen = () => {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);

  // Form states
  const [newUsername, setNewUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Loading states
  const [updatingUsername, setUpdatingUsername] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      setNewUsername(currentUser.displayName || "");
    }
  }, []);

  // Update username
  const handleUpdateUsername = async () => {
    if (!user || !newUsername.trim()) {
      Alert.alert("Error", "Please enter a valid username");
      return;
    }

    setUpdatingUsername(true);
    try {
      await updateProfile(user, {
        displayName: newUsername.trim(),
      });

      Alert.alert("Success", "Username updated successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update username");
    } finally {
      setUpdatingUsername(false);
    }
  };

  // Update password
  const handleUpdatePassword = async () => {
    if (!user || !currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters long");
      return;
    }

    setUpdatingPassword(true);
    try {
      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(
        user.email || "",
        currentPassword
      );

      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      Alert.alert("Success", "Password updated successfully!");

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      if (error.code === "auth/wrong-password") {
        Alert.alert("Error", "Current password is incorrect");
      } else {
        Alert.alert("Error", error.message || "Failed to update password");
      }
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-12 pb-6 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">User Settings</Text>
        <View className="w-8" />
      </View>

      <View className="px-6 py-6">
        {/* Current User Info */}
        <View className="bg-white rounded-2xl p-6 mb-6 border border-gray-100">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Current User
          </Text>
          <View className="flex-row items-center mb-2">
            <User size={20} color="#6B7280" />
            <Text className="text-gray-600 ml-3">
              {user?.displayName || "No username set"}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-gray-500 ml-7">{user?.email}</Text>
          </View>
        </View>

        {/* Update Username Section */}
        <View className="bg-white rounded-2xl p-6 mb-6 border border-gray-100">
          <View className="flex-row items-center mb-4">
            <User size={24} color="#F472B6" />
            <Text className="text-lg font-semibold text-gray-800 ml-3">
              Update Username
            </Text>
          </View>

          <TextInput
            value={newUsername}
            onChangeText={setNewUsername}
            placeholder="Enter new username"
            className="border border-gray-200 rounded-xl px-4 py-3 mb-4 text-gray-800"
            maxLength={30}
          />

          <TouchableOpacity
            onPress={handleUpdateUsername}
            disabled={updatingUsername || !newUsername.trim()}
            className={`rounded-xl py-3 px-4 flex-row items-center justify-center ${
              updatingUsername || !newUsername.trim()
                ? "bg-gray-200"
                : "bg-pink-400"
            }`}
          >
            {updatingUsername ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Check size={20} color="white" />
                <Text className="text-white font-semibold ml-2">
                  Update Username
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Update Password Section */}
        <View className="bg-white rounded-2xl p-6 border border-gray-100">
          <View className="flex-row items-center mb-4">
            <Lock size={24} color="#F472B6" />
            <Text className="text-lg font-semibold text-gray-800 ml-3">
              Change Password
            </Text>
          </View>

          <TextInput
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Current password"
            secureTextEntry
            className="border border-gray-200 rounded-xl px-4 py-3 mb-3 text-gray-800"
          />

          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="New password (min 6 characters)"
            secureTextEntry
            className="border border-gray-200 rounded-xl px-4 py-3 mb-3 text-gray-800"
          />

          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            secureTextEntry
            className="border border-gray-200 rounded-xl px-4 py-3 mb-4 text-gray-800"
          />

          <TouchableOpacity
            onPress={handleUpdatePassword}
            disabled={
              updatingPassword ||
              !currentPassword ||
              !newPassword ||
              !confirmPassword
            }
            className={`rounded-xl py-3 px-4 flex-row items-center justify-center ${
              updatingPassword ||
              !currentPassword ||
              !newPassword ||
              !confirmPassword
                ? "bg-gray-200"
                : "bg-pink-400"
            }`}
          >
            {updatingPassword ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Lock size={20} color="white" />
                <Text className="text-white font-semibold ml-2">
                  Update Password
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Security Note */}
        <View className="bg-blue-50 rounded-2xl p-4 mt-6 border border-blue-100">
          <Text className="text-blue-800 font-medium mb-2">Security Note</Text>
          <Text className="text-blue-600 text-sm">
            For password changes, you'll need to enter your current password for
            security verification. Your password should be at least 6 characters
            long.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default UserSettingsScreen;
