import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  LogOut,
  Mail,
  RefreshCw,
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

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  createdAt: string | undefined;
  lastSignInTime: string | undefined;
  phoneNumber: string | null;
}

interface ExpandedSections {
  username: boolean;
  email: boolean;
  password: boolean;
  actions: boolean;
}

type SectionKeys = keyof ExpandedSections;

const UserSettingsScreen: React.FC = () => {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    username: false,
    email: false,
    password: false,
    actions: false,
  });

  const [newUsername, setNewUsername] = useState<string>("");
  const [newEmail, setNewEmail] = useState<string>("");
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [updatingUsername, setUpdatingUsername] = useState<boolean>(false);
  const [updatingEmail, setUpdatingEmail] = useState<boolean>(false);
  const [updatingPassword, setUpdatingPassword] = useState<boolean>(false);
  const [signingOut, setSigningOut] = useState<boolean>(false);
  const [deletingAccount, setDeletingAccount] = useState<boolean>(false);
  const [sendingVerification, setSendingVerification] =
    useState<boolean>(false);
  const [refreshingStatus, setRefreshingStatus] = useState<boolean>(false);

  const [showCurrentPassword, setShowCurrentPassword] =
    useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [showEmailCurrentPassword, setShowEmailCurrentPassword] =
    useState<boolean>(false);

  useEffect(() => {
    loadUserProfile();
    checkEmailVerificationStatus();

    const interval = setInterval(() => {
      checkEmailVerificationStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadUserProfile = (): void => {
    const profile = settingsService.getUserProfile();
    if (profile) {
      setUserProfile(profile);
      setNewUsername(profile.displayName || "");
      setNewEmail(profile.email || "");
    }
  };

  const checkEmailVerificationStatus = async (): Promise<void> => {
    try {
      const status = await settingsService.checkPendingEmailVerification();
      if (status) {
        const updatedProfile = settingsService.getUserProfile();
        setUserProfile(updatedProfile);
      }
    } catch (error: any) {
      console.error("Error checking email verification:", error);
    }
  };

  const toggleSection = (section: SectionKeys): void => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSendVerificationEmail = async (): Promise<void> => {
    setSendingVerification(true);
    try {
      await settingsService.sendCurrentEmailVerification();
      Alert.alert(
        "Verification Email Sent",
        "Please check your email inbox and click the verification link. After verifying, tap 'Refresh Status' to update.",
        [{ text: "OK" }]
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Failed to send verification email"
      );
    } finally {
      setSendingVerification(false);
    }
  };

  const handleRefreshVerificationStatus = async (): Promise<void> => {
    setRefreshingStatus(true);
    try {
      const isVerified = await settingsService.refreshUserVerificationStatus();

      loadUserProfile();

      if (isVerified) {
        Alert.alert(
          "Email Verified!",
          "Your email has been successfully verified.",
          [{ text: "Great!" }]
        );
      } else {
        Alert.alert(
          "Not Verified Yet",
          "Your email is still not verified. Please check your email and click the verification link, then try again.",
          [{ text: "OK" }]
        );
      }
    } catch (error: any) {
      Alert.alert("Error", "Failed to refresh verification status");
    } finally {
      setRefreshingStatus(false);
    }
  };

  const showEmailVerificationOptions = (): void => {
    Alert.alert(
      "Email Verification Required",
      "Your email address needs to be verified before you can change it or use some features.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send Verification Email",
          onPress: handleSendVerificationEmail,
        },
        {
          text: "Refresh Status",
          onPress: handleRefreshVerificationStatus,
        },
      ]
    );
  };

  const handleUpdateUsername = async (): Promise<void> => {
    if (!newUsername.trim()) {
      Alert.alert("Error", "Please enter a valid username");
      return;
    }

    setUpdatingUsername(true);
    try {
      await settingsService.updateUsername(newUsername);
      loadUserProfile();
      Alert.alert("Success", "Username updated successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update username");
    } finally {
      setUpdatingUsername(false);
    }
  };

  const handleUpdateEmail = async (): Promise<void> => {
    if (!newEmail.trim() || !currentPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (newEmail === userProfile?.email) {
      Alert.alert("Error", "New email is the same as current email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setUpdatingEmail(true);
    try {
      await settingsService.updateEmail({
        currentPassword,
        newEmail: newEmail.trim(),
      });

      Alert.alert(
        "Verification Required",
        "A verification email has been sent to your new email address. Please check your email and click the verification link to complete the email change.",
        [
          {
            text: "OK",
            onPress: () => {
              setCurrentPassword("");
              setExpandedSections((prev) => ({ ...prev, email: false }));
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update email");
    } finally {
      setUpdatingEmail(false);
    }
  };

  const handleUpdatePassword = async (): Promise<void> => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

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
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleSignOut = async (): Promise<void> => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          setSigningOut(true);
          try {
            await settingsService.signOutUser();
            router.replace("/login");
          } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to sign out");
            setSigningOut(false);
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = async (): Promise<void> => {
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

  const showDeleteConfirmation = (): void => {
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

  const performAccountDeletion = async (password: string): Promise<void> => {
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

  const renderCollapsibleSection = (
    key: SectionKeys,
    title: string,
    icon: React.ReactNode,
    content: React.ReactNode,
    color: string = "#D4A5FF"
  ): React.ReactElement => (
    <View
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: color,
        overflow: "hidden",
      }}
    >
      <TouchableOpacity
        onPress={() => toggleSection(key)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 20,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          {icon}
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#9E1C60",
              marginLeft: 12,
            }}
          >
            {title}
          </Text>
        </View>
        {expandedSections[key] ? (
          <ChevronDown size={20} color={color} />
        ) : (
          <ChevronRight size={20} color={color} />
        )}
      </TouchableOpacity>

      {expandedSections[key] && (
        <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
          {content}
        </View>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#E8D5F2" }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#E8D5F2"
        translucent
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingTop: 48,
            paddingBottom: 20,
            backgroundColor: "#E8D5F2",
            borderBottomWidth: 2,
            borderBottomColor: "#9E1C60",
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ padding: 8, marginLeft: -8 }}
          >
            <ArrowLeft size={24} color="#9E1C60" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: "700", color: "#9E1C60" }}>
            Settings
          </Text>
          <View style={{ width: 32 }} />
        </View>

        <View style={{ paddingHorizontal: 20, paddingVertical: 20 }}>
          {/* Current User Info */}
          <View
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.3)",
              borderRadius: 16,
              padding: 18,
              marginBottom: 20,
              borderWidth: 2,
              borderColor: "#D4A5FF",
              shadowColor: "#DDA0DD",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#9E1C60",
                marginBottom: 12,
              }}
            >
              Current User
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <User size={18} color="#9E1C60" />
              <Text style={{ color: "#6B5B95", marginLeft: 10, fontSize: 14 }}>
                {userProfile?.displayName || "No username set"}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 6,
                flexWrap: "wrap",
              }}
            >
              <Mail size={18} color="#9E1C60" />
              <Text
                style={{
                  color: "#6B5B95",
                  marginLeft: 10,
                  fontSize: 14,
                  flex: 1,
                }}
              >
                {userProfile?.email}
              </Text>

              {!userProfile?.emailVerified && (
                <TouchableOpacity
                  onPress={showEmailVerificationOptions}
                  style={{
                    backgroundColor: "#FFE5B4",
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 8,
                    marginLeft: 8,
                    borderWidth: 1,
                    borderColor: "#FFD700",
                  }}
                >
                  <Text
                    style={{
                      color: "#D4A017",
                      fontSize: 10,
                      fontWeight: "600",
                    }}
                  >
                    Unverified
                  </Text>
                </TouchableOpacity>
              )}

              {userProfile?.emailVerified && (
                <View
                  style={{
                    backgroundColor: "#B5EAD7",
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 8,
                    marginLeft: 8,
                    borderWidth: 1,
                    borderColor: "#48BB78",
                  }}
                >
                  <Text
                    style={{
                      color: "#2F855A",
                      fontSize: 10,
                      fontWeight: "600",
                    }}
                  >
                    Verified
                  </Text>
                </View>
              )}
            </View>

            {userProfile?.createdAt && (
              <Text style={{ color: "#9B89BD", fontSize: 12, marginLeft: 28 }}>
                Member since{" "}
                {new Date(userProfile.createdAt).toLocaleDateString()}
              </Text>
            )}

            {!userProfile?.emailVerified && (
              <View
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTopWidth: 1,
                  borderTopColor: "#E6D9FF",
                }}
              >
                <Text
                  style={{
                    color: "#FFE5B4",
                    fontSize: 11,
                    fontStyle: "italic",
                    textAlign: "center",
                    marginBottom: 8,
                  }}
                >
                  Your email address needs verification
                </Text>

                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TouchableOpacity
                    onPress={handleSendVerificationEmail}
                    disabled={sendingVerification}
                    style={{
                      flex: 1,
                      backgroundColor: "#FFE5B4",
                      borderWidth: 1,
                      borderColor: "#FFD700",
                      borderRadius: 8,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {sendingVerification ? (
                      <ActivityIndicator size="small" color="#D4A017" />
                    ) : (
                      <>
                        <Mail size={14} color="#D4A017" />
                        <Text
                          style={{
                            color: "#D4A017",
                            fontSize: 12,
                            fontWeight: "600",
                            marginLeft: 4,
                          }}
                        >
                          Send Verification
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleRefreshVerificationStatus}
                    disabled={refreshingStatus}
                    style={{
                      flex: 1,
                      backgroundColor: "rgba(255, 255, 255, 0.5)",
                      borderWidth: 1,
                      borderColor: "rgba(255, 255, 255, 0.8)",
                      borderRadius: 8,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {refreshingStatus ? (
                      <ActivityIndicator size="small" color="#BA55D3" />
                    ) : (
                      <>
                        <RefreshCw size={14} color="#BA55D3" />
                        <Text
                          style={{
                            color: "#BA55D3",
                            fontSize: 12,
                            fontWeight: "600",
                            marginLeft: 4,
                          }}
                        >
                          Refresh Status
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Update Username Section */}
          {renderCollapsibleSection(
            "username",
            "Update Username",
            <User size={20} color="#D4A5FF" />,
            <View>
              <TextInput
                value={newUsername}
                onChangeText={setNewUsername}
                placeholder="Enter new username"
                placeholderTextColor="#B5A6C9"
                style={{
                  borderWidth: 1,
                  borderColor: "#DCDCDC",
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  marginBottom: 12,
                  color: "black",
                  backgroundColor: "rgba(255, 255, 255, 0.5)",
                  fontSize: 14,
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
                  borderRadius: 10,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor:
                    updatingUsername ||
                    !newUsername.trim() ||
                    newUsername === userProfile?.displayName
                      ? "rgba(212, 165, 255, 0.3)"
                      : "#D4A5FF",
                }}
              >
                {updatingUsername ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Check size={16} color="white" />
                    <Text
                      style={{
                        color: "white",
                        fontWeight: "600",
                        marginLeft: 6,
                        fontSize: 14,
                      }}
                    >
                      Update Username
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Update Email Section */}
          {renderCollapsibleSection(
            "email",
            "Change Email",
            <Mail size={20} color="#D4A5FF" />,
            <View>
              {!userProfile?.emailVerified && (
                <View
                  style={{
                    backgroundColor: "#FFE5B4",
                    borderRadius: 8,
                    padding: 10,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: "#FFD700",
                  }}
                >
                  <Text
                    style={{
                      color: "#D4A017",
                      fontSize: 12,
                      textAlign: "center",
                      fontWeight: "500",
                    }}
                  >
                    Please verify your current email address before changing it
                  </Text>
                </View>
              )}

              <TextInput
                value={newEmail}
                onChangeText={setNewEmail}
                placeholder="Enter new email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                placeholderTextColor="#B5A6C9"
                editable={userProfile?.emailVerified}
                style={{
                  borderWidth: 1,
                  borderColor: userProfile?.emailVerified
                    ? "#DCDCDC"
                    : "rgba(220, 220, 220, 0.5)",
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  marginBottom: 10,
                  color: userProfile?.emailVerified ? "black" : "white",
                  backgroundColor: userProfile?.emailVerified
                    ? "rgba(255, 255, 255, 0.5)"
                    : "rgba(255, 255, 255, 0.3)",
                  fontSize: 14,
                }}
              />
              <View style={{ position: "relative", marginBottom: 12 }}>
                <TextInput
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Current password"
                  secureTextEntry={!showEmailCurrentPassword}
                  autoComplete="current-password"
                  placeholderTextColor="#B5A6C9"
                  editable={userProfile?.emailVerified}
                  style={{
                    borderWidth: 1,
                    borderColor: userProfile?.emailVerified
                      ? "#DCDCDC"
                      : "rgba(220, 220, 220, 0.5)",
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    paddingRight: 44,
                    color: userProfile?.emailVerified ? "#9E1C60" : "#B5A6C9",
                    backgroundColor: userProfile?.emailVerified
                      ? "rgba(255, 255, 255, 0.5)"
                      : "rgba(255, 255, 255, 0.3)",
                    fontSize: 14,
                  }}
                />
                {userProfile?.emailVerified && (
                  <TouchableOpacity
                    onPress={() =>
                      setShowEmailCurrentPassword(!showEmailCurrentPassword)
                    }
                    style={{
                      position: "absolute",
                      right: 12,
                      top: 10,
                      padding: 4,
                    }}
                  >
                    {showEmailCurrentPassword ? (
                      <EyeOff size={16} color="#9E1C60" />
                    ) : (
                      <Eye size={16} color="#9E1C60" />
                    )}
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity
                onPress={handleUpdateEmail}
                disabled={
                  !userProfile?.emailVerified ||
                  updatingEmail ||
                  !newEmail.trim() ||
                  !currentPassword ||
                  newEmail === userProfile?.email
                }
                style={{
                  borderRadius: 10,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor:
                    !userProfile?.emailVerified ||
                    updatingEmail ||
                    !newEmail.trim() ||
                    !currentPassword ||
                    newEmail === userProfile?.email
                      ? "rgba(255, 182, 193, 0.3)"
                      : "#D4A5FF",
                }}
              >
                {updatingEmail ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Mail size={16} color="white" />
                    <Text
                      style={{
                        color: "white",
                        fontWeight: "600",
                        marginLeft: 6,
                        fontSize: 14,
                      }}
                    >
                      Update Email
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>,
            "#D4A5FF"
          )}

          {/* Update Password Section */}
          {renderCollapsibleSection(
            "password",
            "Change Password",
            <Lock size={20} color="#D4A5FF" />,
            <View>
              <View style={{ position: "relative", marginBottom: 10 }}>
                <TextInput
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Current password"
                  secureTextEntry={!showCurrentPassword}
                  autoComplete="current-password"
                  placeholderTextColor="#B5A6C9"
                  style={{
                    borderWidth: 1,
                    borderColor: "#DCDCDC",
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    paddingRight: 44,
                    color: "black",
                    backgroundColor: "rgba(255, 255, 255, 0.5)",
                    fontSize: 14,
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: 10,
                    padding: 4,
                  }}
                >
                  {showCurrentPassword ? (
                    <EyeOff size={16} color="#9E1C60" />
                  ) : (
                    <Eye size={16} color="#9E1C60" />
                  )}
                </TouchableOpacity>
              </View>
              <View style={{ position: "relative", marginBottom: 10 }}>
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="New password (min 6 characters)"
                  secureTextEntry={!showNewPassword}
                  autoComplete="new-password"
                  placeholderTextColor="#B5A6C9"
                  style={{
                    borderWidth: 1,
                    borderColor: "#DCDCDC",
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    paddingRight: 44,
                    color: "black",
                    backgroundColor: "rgba(255, 255, 255, 0.5)",
                    fontSize: 14,
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: 10,
                    padding: 4,
                  }}
                >
                  {showNewPassword ? (
                    <EyeOff size={16} color="#9E1C60" />
                  ) : (
                    <Eye size={16} color="#9E1C60" />
                  )}
                </TouchableOpacity>
              </View>
              <View style={{ position: "relative", marginBottom: 12 }}>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="new-password"
                  placeholderTextColor="#B5A6C9"
                  style={{
                    borderWidth: 1,
                    borderColor: "#DCDCDC",
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    paddingRight: 44,
                    color: "black",
                    backgroundColor: "rgba(255, 255, 255, 0.5)",
                    fontSize: 14,
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: 10,
                    padding: 4,
                  }}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} color="#9E1C60" />
                  ) : (
                    <Eye size={16} color="#9E1C60" />
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
                  borderRadius: 10,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor:
                    updatingPassword ||
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword
                      ? "rgba(181, 234, 215, 0.3)"
                      : "#B5EAD7",
                }}
              >
                {updatingPassword ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Lock size={16} color="white" />
                    <Text
                      style={{
                        color: "white",
                        fontWeight: "600",
                        marginLeft: 6,
                        fontSize: 14,
                      }}
                    >
                      Update Password
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>,
            "#D4A5FF"
          )}

          {/* Account Actions */}
          {renderCollapsibleSection(
            "actions",
            "Account Actions",
            <Shield size={20} color="gray" />,
            <View>
              <TouchableOpacity
                onPress={handleSignOut}
                disabled={signingOut}
                style={{
                  backgroundColor: "#C5B3E6",
                  borderRadius: 10,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: "#BA55D3",
                }}
              >
                {signingOut ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <LogOut size={16} color="white" />
                    <Text
                      style={{
                        color: "white",
                        fontWeight: "600",
                        marginLeft: 6,
                        fontSize: 14,
                      }}
                    >
                      Sign Out
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDeleteAccount}
                disabled={deletingAccount}
                style={{
                  backgroundColor: "#FFB6C1",
                  borderWidth: 2,
                  borderColor: "#FF69B4",
                  borderRadius: 10,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {deletingAccount ? (
                  <ActivityIndicator size="small" color="#C71585" />
                ) : (
                  <>
                    <Trash2 size={16} color="#C71585" />
                    <Text
                      style={{
                        color: "#C71585",
                        fontWeight: "600",
                        marginLeft: 6,
                        fontSize: 14,
                      }}
                    >
                      Delete Account
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>,
            "#C5B3E6"
          )}

          {/* Security Note */}
          <View
            style={{
              backgroundColor: "#D4A5FF",
              borderRadius: 12,
              padding: 14,
              borderWidth: 2,
              borderColor: "#BA55D3",
              marginTop: 8,
            }}
          >
            <Text
              style={{
                color: "white",
                fontWeight: "600",
                marginBottom: 6,
                fontSize: 13,
              }}
            >
              Security Note
            </Text>
            <Text
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: 12,
                lineHeight: 16,
              }}
            >
              • Password changes require your current password for verification
              {"\n"}• Email changes will require verification of the new email
              address
              {"\n"}• Account deletion is permanent and cannot be undone
              {"\n"}• All your journal entries will be deleted with your account
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default UserSettingsScreen;
