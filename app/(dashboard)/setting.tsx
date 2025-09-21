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
  StatusBar,
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
    <View style={{ flex: 1, backgroundColor: "#1c1c2b" }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 24,
            paddingTop: 48,
            paddingBottom: 24,
            backgroundColor: "#1a1a2e",
            borderBottomWidth: 1,
            borderBottomColor: "rgba(255, 255, 255, 0.1)",
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ padding: 8, marginLeft: -8 }}
          >
            <ArrowLeft size={24} color="#E0E0E0" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: "700", color: "#F5F5F5" }}>
            ⚙️ Settings
          </Text>
          <View style={{ width: 32 }} />
        </View>

        <View style={{ paddingHorizontal: 24, paddingVertical: 24 }}>
          {/* Current User Info */}
          <View
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.1)",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#F5F5F5",
                marginBottom: 16,
              }}
            >
              Current User
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <User size={20} color="#B0C4DE" />
              <Text style={{ color: "#E0E0E0", marginLeft: 12 }}>
                {userProfile?.displayName || "No username set"}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Mail size={20} color="#B0C4DE" />
              <Text style={{ color: "#E0E0E0", marginLeft: 12 }}>
                {userProfile?.email}
              </Text>
              {!userProfile?.emailVerified && (
                <View
                  style={{
                    backgroundColor: "rgba(255, 165, 0, 0.2)",
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                    marginLeft: 8,
                    borderWidth: 1,
                    borderColor: "rgba(255, 140, 0, 0.3)",
                  }}
                >
                  <Text
                    style={{
                      color: "#FFD700",
                      fontSize: 12,
                      fontWeight: "500",
                    }}
                  >
                    Unverified
                  </Text>
                </View>
              )}
            </View>
            {userProfile?.createdAt && (
              <Text style={{ color: "#A0A0A0", fontSize: 14, marginLeft: 32 }}>
                Member since{" "}
                {new Date(userProfile.createdAt).toLocaleDateString()}
              </Text>
            )}
          </View>

          {/* Update Username Section */}
          <View
            style={{
              backgroundColor: "rgba(176, 196, 222, 0.08)",
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: "rgba(176, 196, 222, 0.2)",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <User size={24} color="#B0C4DE" />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "#F5F5F5",
                  marginLeft: 12,
                }}
              >
                Update Username
              </Text>
            </View>

            <TextInput
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="Enter new username"
              placeholderTextColor="#A0A0A0"
              style={{
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                marginBottom: 16,
                color: "#F0F0F0",
                backgroundColor: "rgba(255, 255, 255, 0.04)",
              }}
              maxLength={30}
            />

            <TouchableOpacity
              onPress={handleUpdateUsername}
              disabled={
                updatingUsername ||
                !newUsername.trim() ||
                newUsername === userProfile?.displayName
              }
              style={{
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor:
                  updatingUsername ||
                  !newUsername.trim() ||
                  newUsername === userProfile?.displayName
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(176, 196, 222, 0.8)",
              }}
            >
              {updatingUsername ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Check size={20} color="white" />
                  <Text
                    style={{ color: "white", fontWeight: "600", marginLeft: 8 }}
                  >
                    Update Username
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Update Email Section */}
          <View
            style={{
              backgroundColor: "rgba(173, 216, 230, 0.08)",
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: "rgba(173, 216, 230, 0.2)",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Mail size={24} color="#87CEEB" />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "#F5F5F5",
                  marginLeft: 12,
                }}
              >
                Change Email
              </Text>
            </View>

            <TextInput
              value={newEmail}
              onChangeText={setNewEmail}
              placeholder="Enter new email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              placeholderTextColor="#A0A0A0"
              style={{
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                marginBottom: 12,
                color: "#F0F0F0",
                backgroundColor: "rgba(255, 255, 255, 0.04)",
              }}
            />

            <View style={{ position: "relative", marginBottom: 16 }}>
              <TextInput
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Current password"
                secureTextEntry={!showEmailCurrentPassword}
                autoComplete="current-password"
                placeholderTextColor="#A0A0A0"
                style={{
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  paddingRight: 48,
                  color: "#F0F0F0",
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                }}
              />
              <TouchableOpacity
                onPress={() =>
                  setShowEmailCurrentPassword(!showEmailCurrentPassword)
                }
                style={{
                  position: "absolute",
                  right: 12,
                  top: 12,
                  padding: 4,
                }}
              >
                {showEmailCurrentPassword ? (
                  <EyeOff size={20} color="#B0B0B0" />
                ) : (
                  <Eye size={20} color="#B0B0B0" />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleUpdateEmail}
              disabled={
                updatingEmail ||
                !newEmail.trim() ||
                !currentPassword ||
                newEmail === userProfile?.email
              }
              style={{
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor:
                  updatingEmail ||
                  !newEmail.trim() ||
                  !currentPassword ||
                  newEmail === userProfile?.email
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(135, 206, 235, 0.8)",
              }}
            >
              {updatingEmail ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Mail size={20} color="white" />
                  <Text
                    style={{ color: "white", fontWeight: "600", marginLeft: 8 }}
                  >
                    Update Email
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Update Password Section */}
          <View
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.1)",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Lock size={24} color="#D3D3D3" />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "#F5F5F5",
                  marginLeft: 12,
                }}
              >
                Change Password
              </Text>
            </View>

            <View style={{ position: "relative", marginBottom: 12 }}>
              <TextInput
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Current password"
                secureTextEntry={!showCurrentPassword}
                autoComplete="current-password"
                placeholderTextColor="#A0A0A0"
                style={{
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  paddingRight: 48,
                  color: "#F0F0F0",
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                }}
              />
              <TouchableOpacity
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: 12,
                  padding: 4,
                }}
              >
                {showCurrentPassword ? (
                  <EyeOff size={20} color="#B0B0B0" />
                ) : (
                  <Eye size={20} color="#B0B0B0" />
                )}
              </TouchableOpacity>
            </View>

            <View style={{ position: "relative", marginBottom: 12 }}>
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="New password (min 6 characters)"
                secureTextEntry={!showNewPassword}
                autoComplete="new-password"
                placeholderTextColor="#A0A0A0"
                style={{
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  paddingRight: 48,
                  color: "#F0F0F0",
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                }}
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: 12,
                  padding: 4,
                }}
              >
                {showNewPassword ? (
                  <EyeOff size={20} color="#B0B0B0" />
                ) : (
                  <Eye size={20} color="#B0B0B0" />
                )}
              </TouchableOpacity>
            </View>

            <View style={{ position: "relative", marginBottom: 16 }}>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                secureTextEntry={!showConfirmPassword}
                autoComplete="new-password"
                placeholderTextColor="#A0A0A0"
                style={{
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  paddingRight: 48,
                  color: "#F0F0F0",
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                }}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: 12,
                  padding: 4,
                }}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#B0B0B0" />
                ) : (
                  <Eye size={20} color="#B0B0B0" />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleUpdatePassword}
              disabled={
                updatingPassword ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword
              }
              style={{
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor:
                  updatingPassword ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(211, 211, 211, 0.8)",
              }}
            >
              {updatingPassword ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Lock size={20} color="white" />
                  <Text
                    style={{ color: "white", fontWeight: "600", marginLeft: 8 }}
                  >
                    Update Password
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Account Actions */}
          <View
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.1)",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Shield size={24} color="#B0B0B0" />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "#F5F5F5",
                  marginLeft: 12,
                }}
              >
                Account Actions
              </Text>
            </View>

            {/* Sign Out Button */}
            <TouchableOpacity
              onPress={handleSignOut}
              disabled={signingOut}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.2)",
              }}
            >
              {signingOut ? (
                <ActivityIndicator size="small" color="#B0B0B0" />
              ) : (
                <>
                  <LogOut size={20} color="#B0B0B0" />
                  <Text
                    style={{
                      color: "#E0E0E0",
                      fontWeight: "600",
                      marginLeft: 8,
                    }}
                  >
                    Sign Out
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Delete Account Button */}
            <TouchableOpacity
              onPress={handleDeleteAccount}
              disabled={deletingAccount}
              style={{
                backgroundColor: "rgba(220, 38, 38, 0.1)",
                borderWidth: 1,
                borderColor: "rgba(220, 38, 38, 0.3)",
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {deletingAccount ? (
                <ActivityIndicator size="small" color="#DC2626" />
              ) : (
                <>
                  <Trash2 size={20} color="#DC2626" />
                  <Text
                    style={{
                      color: "#FF6B6B",
                      fontWeight: "600",
                      marginLeft: 8,
                    }}
                  >
                    Delete Account
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Security Note */}
          <View
            style={{
              backgroundColor: "rgba(30, 144, 255, 0.1)",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: "rgba(30, 144, 255, 0.2)",
            }}
          >
            <Text
              style={{ color: "#87CEEB", fontWeight: "600", marginBottom: 8 }}
            >
              Security Note
            </Text>
            <Text style={{ color: "#B0C4DE", fontSize: 14, lineHeight: 20 }}>
              • Password changes require your current password for verification
              {"\n"}• Email changes will require verification of the new email
              address{"\n"}• Account deletion is permanent and cannot be undone
              {"\n"}• All your journal entries will be deleted with your account
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default UserSettingsScreen;
