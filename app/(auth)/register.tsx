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
import { register } from "../../services/authService";

const Register = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [cPassword, setCPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
        Register
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

      <TextInput
        placeholder="Confirm password"
        value={cPassword}
        onChangeText={setCPassword}
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
        onPress={handleRegister}
        disabled={isLoading}
        style={{
          backgroundColor: isLoading ? "#9ca3af" : "#16a34a",
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
            Register
          </Text>
        )}
      </TouchableOpacity>

      <Pressable
        style={{
          paddingHorizontal: 24,
          paddingVertical: 12,
          marginTop: 16,
        }}
        onPress={() => router.back()}
      >
        <Text
          style={{
            fontSize: 16,
            textAlign: "center",
            color: "#3b82f6",
          }}
        >
          Already have an account? Login
        </Text>
      </Pressable>
    </View>
  );
};

export default Register;
