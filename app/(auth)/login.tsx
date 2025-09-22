import { useRouter } from "expo-router";
import { BookOpen, Eye, EyeOff, Lock, Mail } from "lucide-react-native";
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
import { login } from "../../services/authService";

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleLogin = async () => {
    if (isLoading) return;

    if (!email.trim()) {
      Alert.alert("Validation Error", "Email is required");
      return;
    }

    if (!password.trim()) {
      Alert.alert("Validation Error", "Password is required");
      return;
    }

    setIsLoading(true);
    await login(email, password)
      .then((res) => {
        router.push("/JournalEntries");
      })
      .catch((err) => {
        Alert.alert("Login failed", "Invalid email or password");
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

      {/* Background with subtle gradient */}
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
        <View style={{ alignItems: "center", marginBottom: 40 }}>
          {/* App Icon */}
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
            <BookOpen size={32} color="#B0C4DE" />
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
            Welcome Back
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: "#B0C4DE",
              textAlign: "center",
              opacity: 0.9,
            }}
          >
            Continue your journaling journey
          </Text>
        </View>

        {/* Login Form */}
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
                paddingVertical: 12,
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
          <View style={{ marginBottom: 24 }}>
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
                paddingVertical: 12,
              }}
            >
              <Lock size={18} color="#B0C4DE" style={{ marginRight: 10 }} />
              <TextInput
                placeholder="Enter your password"
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

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
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
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          {/* Forgot Password Link */}
          <TouchableOpacity style={{ alignSelf: "center", padding: 6 }}>
            <Text
              style={{
                fontSize: 13,
                color: "#B0C4DE",
                textAlign: "center",
              }}
            >
              Forgot your password?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Register Link */}
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
            onPress={() => router.push("/register")}
          >
            <Text
              style={{
                fontSize: 15,
                textAlign: "center",
                color: "#B0C4DE",
                fontWeight: "600",
              }}
            >
              Don't have an account?{" "}
              <Text style={{ color: "#87CEEB", fontWeight: "700" }}>
                Create One
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
            Your thoughts, your privacy, your journey
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default Login;
