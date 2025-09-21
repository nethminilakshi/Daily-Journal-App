import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  Lock,
  LogOut,
  Mail,
  Shield,
  Trash2,
  User,
} from "lucide-react-native";
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
import settingsService from "../../services/settingsService";

const UserSettingsScreen = () => {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);

  // Form states
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

  // Loading states
  const [updatingUsername, setUpdatingUsername] = useState(false);
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEmailCurrentPassword, setShowEmailCurrentPassword] =
    useState(false);

  useEffect(() => {
    const profile = settingsService.getUserProfile();
    if (profile) {
      setUserProfile(profile);
      setNewUsername(profile.displayName || "");
      setNewEmail(profile.email || "");
    }
  }, []);

  // Update username
  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) {
      Alert.alert("Error", "Please enter a valid username");
      return;
    }

    setUpdatingUsername(true);
    try {
      await settingsService.updateUsername(newUsername);

      // Refresh profile
      const updatedProfile = settingsService.getUserProfile();
      setUserProfile(updatedProfile);

      Alert.alert("Success", "Username updated successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update username");
    } finally {
      setUpdatingUsername(false);
    }
  };

  // Update email
  const handleUpdateEmail = async () => {
    if (!newEmail.trim() || !currentPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (newEmail === userProfile?.email) {
      Alert.alert("Error", "New email is the same as current email");
      return;
    }

    setUpdatingEmail(true);
    try {
      await settingsService.updateEmail({
        currentPassword,
        newEmail: newEmail.trim(),
      });

      Alert.alert(
        "Success",
        "Email updated successfully! Please check your new email for verification.",
        [{ text: "OK", onPress: () => setCurrentPassword("") }]
      );

      // Refresh profile
      const updatedProfile = settingsService.getUserProfile();
      setUserProfile(updatedProfile);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update email");
    } finally {
      setUpdatingEmail(false);
    }
  };

  // Update password
  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    // Validate password strength
    const validation = settingsService.validatePasswordStrength(newPassword);
    if (!validation.isValid) {
      Alert.alert("Error", validation.errors.join("\n"));
      return;
    }

    setUpdatingPassword(true);
    try {
      await settingsService.updatePassword({
        currentPassword,
        newPassword,
      });

      Alert.alert("Success", "Password updated successfully!");

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          setSigningOut(true);
          try {
            await settingsService.signOutUser();
            router.replace("/login"); // Adjust path as needed
          } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to sign out");
            setSigningOut(false);
          }
        },
      },
    ]);
  };

  // Delete account
  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all your journal entries. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => showDeleteConfirmation(),
        },
      ]
    );
  };

  const showDeleteConfirmation = () => {
    Alert.prompt(
      "Confirm Account Deletion",
      "Please enter your current password to confirm account deletion:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: (password?: string) => {
            if (password) {
              performAccountDeletion(password);
            }
          },
        },
      ],
      "secure-text"
    );
  };

  const performAccountDeletion = async (password: string) => {
    setDeletingAccount(true);
    try {
      await settingsService.deleteAccount(password);
      Alert.alert(
        "Account Deleted",
        "Your account and all data have been permanently deleted.",
        [{ text: "OK", onPress: () => router.replace("/login") }]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to delete account");
      setDeletingAccount(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-12 pb-6 bg- border-b border-gray-100">
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
              {userProfile?.displayName || "No username set"}
            </Text>
          </View>
          <View className="flex-row items-center mb-2">
            <Mail size={20} color="#6B7280" />
            <Text className="text-gray-600 ml-3">{userProfile?.email}</Text>
            {!userProfile?.emailVerified && (
              <View className="bg-orange-100 px-2 py-1 rounded-full ml-2">
                <Text className="text-orange-600 text-xs font-medium">
                  Unverified
                </Text>
              </View>
            )}
          </View>
          {userProfile?.createdAt && (
            <Text className="text-gray-400 text-sm ml-7">
              Member since{" "}
              {new Date(userProfile.createdAt).toLocaleDateString()}
            </Text>
          )}
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
            disabled={
              updatingUsername ||
              !newUsername.trim() ||
              newUsername === userProfile?.displayName
            }
            className={`rounded-xl py-3 px-4 flex-row items-center justify-center ${
              updatingUsername ||
              !newUsername.trim() ||
              newUsername === userProfile?.displayName
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

        {/* Update Email Section */}
        <View className="bg-white rounded-2xl p-6 mb-6 border border-gray-100">
          <View className="flex-row items-center mb-4">
            <Mail size={24} color="#F472B6" />
            <Text className="text-lg font-semibold text-gray-800 ml-3">
              Change Email
            </Text>
          </View>

          <View
            style={{ display: "flex", flexDirection: "column" }}
            role="form"
          >
            <TextInput
              value={newEmail}
              onChangeText={setNewEmail}
              placeholder="Enter new email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              className="border border-gray-200 rounded-xl px-4 py-3 mb-3 text-gray-800"
            />

            <View className="relative mb-4">
              <TextInput
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Current password"
                secureTextEntry={!showEmailCurrentPassword}
                autoComplete="current-password"
                className="border border-gray-200 rounded-xl px-4 py-3 pr-12 text-gray-800"
              />
              <TouchableOpacity
                onPress={() =>
                  setShowEmailCurrentPassword(!showEmailCurrentPassword)
                }
                className="absolute right-3 top-3 p-1"
              >
                {showEmailCurrentPassword ? (
                  <EyeOff size={20} color="#6B7280" />
                ) : (
                  <Eye size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleUpdateEmail}
            disabled={
              updatingEmail ||
              !newEmail.trim() ||
              !currentPassword ||
              newEmail === userProfile?.email
            }
            className={`rounded-xl py-3 px-4 flex-row items-center justify-center ${
              updatingEmail ||
              !newEmail.trim() ||
              !currentPassword ||
              newEmail === userProfile?.email
                ? "bg-gray-200"
                : "bg-pink-400"
            }`}
          >
            {updatingEmail ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Mail size={20} color="white" />
                <Text className="text-white font-semibold ml-2">
                  Update Email
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Update Password Section */}
        <View className="bg-white rounded-2xl p-6 mb-6 border border-gray-100">
          <View className="flex-row items-center mb-4">
            <Lock size={24} color="#F472B6" />
            <Text className="text-lg font-semibold text-gray-800 ml-3">
              Change Password
            </Text>
          </View>

          <View
            style={{ display: "flex", flexDirection: "column" }}
            role="form"
          >
            <View className="relative mb-3">
              <TextInput
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Current password"
                secureTextEntry={!showCurrentPassword}
                autoComplete="current-password"
                className="border border-gray-200 rounded-xl px-4 py-3 pr-12 text-gray-800"
              />
              <TouchableOpacity
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-3 p-1"
              >
                {showCurrentPassword ? (
                  <EyeOff size={20} color="#6B7280" />
                ) : (
                  <Eye size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>

            <View className="relative mb-3">
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="New password (min 6 characters)"
                secureTextEntry={!showNewPassword}
                autoComplete="new-password"
                className="border border-gray-200 rounded-xl px-4 py-3 pr-12 text-gray-800"
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-3 p-1"
              >
                {showNewPassword ? (
                  <EyeOff size={20} color="#6B7280" />
                ) : (
                  <Eye size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>

            <View className="relative mb-4">
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                secureTextEntry={!showConfirmPassword}
                autoComplete="new-password"
                className="border border-gray-200 rounded-xl px-4 py-3 pr-12 text-gray-800"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 p-1"
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#6B7280" />
                ) : (
                  <Eye size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>
          </View>

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

        {/* Account Actions */}
        <View className="bg-white rounded-2xl p-6 mb-6 border border-gray-100">
          <View className="flex-row items-center mb-4">
            <Shield size={24} color="#6B7280" />
            <Text className="text-lg font-semibold text-gray-800 ml-3">
              Account Actions
            </Text>
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity
            onPress={handleSignOut}
            disabled={signingOut}
            className="bg-gray-100 rounded-xl py-3 px-4 flex-row items-center justify-center mb-3"
          >
            {signingOut ? (
              <ActivityIndicator size="small" color="#6B7280" />
            ) : (
              <>
                <LogOut size={20} color="#6B7280" />
                <Text className="text-gray-700 font-semibold ml-2">
                  Sign Out
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Delete Account Button */}
          <TouchableOpacity
            onPress={handleDeleteAccount}
            disabled={deletingAccount}
            className="bg-red-50 border border-red-200 rounded-xl py-3 px-4 flex-row items-center justify-center"
          >
            {deletingAccount ? (
              <ActivityIndicator size="small" color="#DC2626" />
            ) : (
              <>
                <Trash2 size={20} color="#DC2626" />
                <Text className="text-red-600 font-semibold ml-2">
                  Delete Account
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Security Note */}
        <View className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <Text className="text-blue-800 font-medium mb-2">Security Note</Text>
          <Text className="text-blue-600 text-sm">
            • Password changes require your current password for verification
            {"\n"}• Email changes will require verification of the new email
            address{"\n"}• Account deletion is permanent and cannot be undone
            {"\n"}• All your journal entries will be deleted with your account
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default UserSettingsScreen;
