import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
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
        Alert.alert("Login failed", "Something went wrong");
        console.error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
      }}
    >
      <Text
        style={{
          fontSize: 32,
          textAlign: "center",
          marginBottom: 16,
          fontWeight: "bold",
        }}
      >
        Login
      </Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={{
          backgroundColor: "#ffffff",
          borderWidth: 1,
          borderColor: "#d1d5db",
          borderRadius: 8,
          paddingHorizontal: 16,
          paddingVertical: 12,
          marginBottom: 16,
          color: "#111827",
          width: "100%",
        }}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          backgroundColor: "#ffffff",
          borderWidth: 1,
          borderColor: "#d1d5db",
          borderRadius: 8,
          paddingHorizontal: 16,
          paddingVertical: 12,
          marginBottom: 16,
          color: "#111827",
          width: "100%",
        }}
      />

      <TouchableOpacity
        onPress={handleLogin}
        disabled={isLoading}
        style={{
          backgroundColor: isLoading ? "#9ca3af" : "#2563eb",
          padding: 16,
          borderRadius: 8,
          marginTop: 8,
          width: "100%",
        }}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" size="large" />
        ) : (
          <Text
            style={{
              textAlign: "center",
              fontSize: 18,
              color: "white",
              fontWeight: "600",
            }}
          >
            Login
          </Text>
        )}
      </TouchableOpacity>

      <Pressable
        style={{
          paddingHorizontal: 24,
          paddingVertical: 12,
          marginTop: 16,
        }}
        onPress={() => router.push("/register")}
      >
        <Text
          style={{
            fontSize: 16,
            textAlign: "center",
            color: "#3b82f6",
          }}
        >
          Don't have an account? Register
        </Text>
      </Pressable>
    </View>
  );
};

export default Login;
