import { useRouter } from "expo-router";
import { Eye, EyeOff, Lock, Mail, UserPlus } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { register } from "../../services/authService";

const Register = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [cPassword, setCPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const handleRegister = async () => {
    if (isLoading) return;

    // Validation
    if (!email.trim()) {
      Alert.alert("Validation Error", "Email is required");
      return;
    }

    if (!password.trim()) {
      Alert.alert("Validation Error", "Password is required");
      return;
    }

    if (!cPassword.trim()) {
      Alert.alert("Validation Error", "Please confirm your password");
      return;
    }

    if (password !== cPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Weak Password",
        "Password must be at least 6 characters long"
      );
      return;
    }

    setIsLoading(true);
    await register(email, password)
      .then((res) => {
        Alert.alert("Success", "Account created successfully!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      })
      .catch((err) => {
        Alert.alert(
          "Registration failed",
          "Something went wrong. Please try again."
        );
        console.error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#1c1c2b" }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Background with gradient effect */}
      <View style={StyleSheet.absoluteFillObject}>
        <View
          style={{
            flex: 1,
            backgroundColor: "#1c1c2b",
            opacity: 0.95,
          }}
        />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingTop: 60,
          paddingBottom: 30,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with App Branding */}
        <View style={{ alignItems: "center", marginBottom: 35 }}>
          {/* App Icon with consistent blue color */}
          <View
            style={{
              width: 70,
              height: 70,
              backgroundColor: "rgba(176, 196, 222, 0.2)",
              borderRadius: 35,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
              shadowColor: "rgba(176, 196, 222, 0.6)",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
              borderWidth: 2,
              borderColor: "rgba(176, 196, 222, 0.3)",
            }}
          >
            <UserPlus size={32} color="#B0C4DE" />
          </View>

          {/* Welcome Text */}
          <Text
            style={{
              fontSize: 28,
              fontWeight: "800",
              color: "#F5F5F5",
              textAlign: "center",
              marginBottom: 6,
              textShadowColor: "rgba(176, 196, 222, 0.3)",
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 4,
            }}
          >
            Join the Journey
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: "#B0C4DE",
              textAlign: "center",
              opacity: 0.9,
            }}
          >
            Create your personal journal space
          </Text>
        </View>

        {/* Register Form */}
        <View
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.06)",
            borderRadius: 20,
            padding: 24,
            borderWidth: 1,
            borderColor: "rgba(255, 255, 255, 0.1)",
            shadowColor: "rgba(0, 0, 0, 0.2)",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          {/* Email Input */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#E0E0E0",
                marginBottom: 6,
              }}
            >
              Email Address
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                borderWidth: 1,
                borderColor: "rgba(176, 196, 222, 0.3)",
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 10,
              }}
            >
              <Mail size={18} color="#B0C4DE" style={{ marginRight: 10 }} />
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor="#A0A0A0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={{
                  flex: 1,
                  fontSize: 15,
                  color: "#F5F5F5",
                }}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#E0E0E0",
                marginBottom: 6,
              }}
            >
              Password
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                borderWidth: 1,
                borderColor: "rgba(176, 196, 222, 0.3)",
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 10,
              }}
            >
              <Lock size={18} color="#B0C4DE" style={{ marginRight: 10 }} />
              <TextInput
                placeholder="Create a password"
                placeholderTextColor="#A0A0A0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={{
                  flex: 1,
                  fontSize: 15,
                  color: "#F5F5F5",
                }}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{ padding: 4 }}
              >
                {showPassword ? (
                  <EyeOff size={18} color="#B0C4DE" />
                ) : (
                  <Eye size={18} color="#B0C4DE" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password Input */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#E0E0E0",
                marginBottom: 6,
              }}
            >
              Confirm Password
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                borderWidth: 1,
                borderColor: "rgba(176, 196, 222, 0.3)",
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 10,
              }}
            >
              <Lock size={18} color="#B0C4DE" style={{ marginRight: 10 }} />
              <TextInput
                placeholder="Confirm your password"
                placeholderTextColor="#A0A0A0"
                value={cPassword}
                onChangeText={setCPassword}
                secureTextEntry={!showConfirmPassword}
                style={{
                  flex: 1,
                  fontSize: 15,
                  color: "#F5F5F5",
                }}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ padding: 4 }}
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} color="#B0C4DE" />
                ) : (
                  <Eye size={18} color="#B0C4DE" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Register Button with consistent blue color */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={isLoading}
            style={{
              backgroundColor: isLoading
                ? "rgba(176, 196, 222, 0.5)"
                : "rgba(176, 196, 222, 0.9)",
              paddingVertical: 14,
              borderRadius: 14,
              marginBottom: 12,
              shadowColor: "rgba(176, 196, 222, 0.4)",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
              borderWidth: 1,
              borderColor: "rgba(176, 196, 222, 0.4)",
            }}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 16,
                  color: "white",
                  fontWeight: "700",
                }}
              >
                Create Account
              </Text>
            )}
          </TouchableOpacity>

          {/* Password Requirements */}
          <View
            style={{
              backgroundColor: "rgba(176, 196, 222, 0.1)",
              borderRadius: 10,
              padding: 10,
              borderWidth: 1,
              borderColor: "rgba(176, 196, 222, 0.2)",
            }}
          >
            <Text
              style={{
                fontSize: 11,
                color: "#B0C4DE",
                textAlign: "center",
                lineHeight: 14,
              }}
            >
              Password must be at least 6 characters long
            </Text>
          </View>
        </View>

        {/* Login Link */}
        <View
          style={{
            marginTop: 30,
            alignItems: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <View
              style={{
                height: 1,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                flex: 1,
              }}
            />
            <Text
              style={{
                marginHorizontal: 12,
                fontSize: 13,
                color: "#A0A0A0",
              }}
            >
              or
            </Text>
            <View
              style={{
                height: 1,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                flex: 1,
              }}
            />
          </View>

          <Pressable
            style={{
              paddingHorizontal: 20,
              paddingVertical: 12,
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.1)",
            }}
            onPress={() => router.back()}
          >
            <Text
              style={{
                fontSize: 15,
                textAlign: "center",
                color: "#B0C4DE",
                fontWeight: "600",
              }}
            >
              Already have an account?{" "}
              <Text style={{ color: "#87CEEB", fontWeight: "700" }}>
                Sign In
              </Text>
            </Text>
          </Pressable>
        </View>

        {/* Footer */}
        <View style={{ marginTop: 30, marginBottom: 10 }}>
          <Text
            style={{
              fontSize: 11,
              color: "#808080",
              textAlign: "center",
              opacity: 0.8,
            }}
          >
            Join thousands of people capturing their stories
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default Register;
