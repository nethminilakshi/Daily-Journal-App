import { useRouter } from "expo-router";
import { Eye, EyeOff, Lock, Mail, UserPlus } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { register } from "../../services/authService";

const { width: SW, height: SH } = Dimensions.get("window");

const FloatingStar = ({ x, y, size, delay, color, duration }: {
  x: number; y: number; size: number; delay: number; color: string; duration: number;
}) => {
  const floatY  = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(opacity, { toValue: 0.85, duration: 900, useNativeDriver: true }),
    ]).start();
    Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.timing(floatY, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(floatY, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();
    Animated.loop(
      Animated.timing(rotate, { toValue: 1, duration: duration * 2.5, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);

  const translateY = floatY.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <Animated.View style={{ position: "absolute", left: x, top: y, opacity, transform: [{ translateY }, { rotate: spin }] }}>
      <Text style={{ fontSize: size, color }}>✦</Text>
    </Animated.View>
  );
};

const FloatingPen = ({ x, y, angle, delay, color, capColor, duration }: {
  x: number; y: number; angle: string; delay: number; color: string; capColor: string; duration: number;
}) => {
  const floatY  = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(opacity, { toValue: 0.5, duration: 1000, useNativeDriver: true }),
    ]).start();
    Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.timing(floatY, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(floatY, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();
  }, []);

  const translateY = floatY.interpolate({ inputRange: [0, 1], outputRange: [0, -9] });

  return (
    <Animated.View style={{ position: "absolute", left: x, top: y, opacity, transform: [{ rotate: angle }, { translateY }] }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ width: 12, height: 8, backgroundColor: capColor, borderRadius: 2 }} />
        <View style={{ width: 42, height: 8, backgroundColor: color, borderRadius: 2 }} />
        <View style={{ width: 0, height: 0, borderTopWidth: 4, borderBottomWidth: 4, borderLeftWidth: 9, borderTopColor: "transparent", borderBottomColor: "transparent", borderLeftColor: color }} />
      </View>
    </Animated.View>
  );
};

const FloatingBook = ({ x, y, angle, delay, color, spineColor, duration }: {
  x: number; y: number; angle: string; delay: number; color: string; spineColor: string; duration: number;
}) => {
  const floatY  = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(opacity, { toValue: 0.45, duration: 1000, useNativeDriver: true }),
    ]).start();
    Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.timing(floatY, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(floatY, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();
  }, []);

  const translateY = floatY.interpolate({ inputRange: [0, 1], outputRange: [0, -7] });

  return (
    <Animated.View style={{ position: "absolute", left: x, top: y, opacity, transform: [{ rotate: angle }, { translateY }] }}>
      <View style={{ flexDirection: "row" }}>
        <View style={{ width: 7, height: 42, backgroundColor: spineColor, borderTopLeftRadius: 3, borderBottomLeftRadius: 3 }} />
        <View style={{ width: 30, height: 42, backgroundColor: color, borderTopRightRadius: 3, borderBottomRightRadius: 3, paddingTop: 7, paddingLeft: 5 }}>
          <View style={{ width: 16, height: 2, backgroundColor: "rgba(255,255,255,0.55)", borderRadius: 1, marginBottom: 4 }} />
          <View style={{ width: 12, height: 2, backgroundColor: "rgba(255,255,255,0.55)", borderRadius: 1, marginBottom: 4 }} />
          <View style={{ width: 14, height: 2, backgroundColor: "rgba(255,255,255,0.55)", borderRadius: 1 }} />
        </View>
      </View>
    </Animated.View>
  );
};

const Sparkle = ({ x, y, delay }: { x: number; y: number; delay: number }) => {
  const scale   = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(scale,   { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 450, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(scale,   { toValue: 0, duration: 450, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 450, useNativeDriver: true }),
      ]),
      Animated.delay(2000),
    ])).start();
  }, []);

  return (
    <Animated.View style={{ position: "absolute", left: x, top: y, opacity, transform: [{ scale }] }}>
      <Text style={{ fontSize: 11, color: "#FFD700" }}>✨</Text>
    </Animated.View>
  );
};

const Register = () => {
  const router = useRouter();
  const [email, setEmail]                             = useState("");
  const [password, setPassword]                       = useState("");
  const [cPassword, setCPassword]                     = useState("");
  const [isLoading, setIsLoading]                     = useState(false);
  const [showPassword, setShowPassword]               = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    if (isLoading) return;
    if (!email.trim())          { Alert.alert("Validation Error", "Email is required"); return; }
    if (!password.trim())       { Alert.alert("Validation Error", "Password is required"); return; }
    if (!cPassword.trim())      { Alert.alert("Validation Error", "Please confirm your password"); return; }
    if (password !== cPassword) { Alert.alert("Password Mismatch", "Passwords do not match"); return; }
    if (password.length < 6)    { Alert.alert("Weak Password", "Password must be at least 6 characters long"); return; }

    setIsLoading(true);
    await register(email, password)
      .then(() => Alert.alert("Success", "Account created successfully!", [{ text: "OK", onPress: () => router.back() }]))
      .catch((err) => { Alert.alert("Registration failed", "Something went wrong."); console.error(err); })
      .finally(() => setIsLoading(false));
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#E8D5F2" }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Top section decorations */}
      <FloatingStar  x={16}            y={58}        size={13} delay={0}   color="#FF69B4"  duration={2200} />
      <FloatingStar  x={SW - 34}       y={72}        size={11} delay={300} color="#DDA0DD"  duration={1900} />
      <FloatingPen   x={30}            y={108}       angle="20deg"  delay={400} color="#DDA0DD" capColor="#BA55D3" duration={2800} />
      <FloatingBook  x={SW - 58}       y={96}        angle="-14deg" delay={200} color="#FFB6C1" spineColor="#FF69B4" duration={2500} />
      <Sparkle       x={SW / 2 - 8}    y={82}        delay={700} />

      {/* Mid-left decorations */}
      <FloatingStar  x={10}            y={SH * 0.34} size={10} delay={500} color="#DDA0DD"  duration={2400} />
      <FloatingPen   x={4}             y={SH * 0.45} angle="28deg"  delay={700} color="#FFB6C1" capColor="#FF1493" duration={3000} />
      <Sparkle       x={12}            y={SH * 0.57} delay={900} />

      {/* Mid-right decorations */}
      <FloatingStar  x={SW - 28}       y={SH * 0.32} size={12} delay={150} color="#FFB6C1"  duration={2100} />
      <FloatingBook  x={SW - 52}       y={SH * 0.46} angle="-18deg" delay={600} color="#DDA0DD" spineColor="#9932CC" duration={2700} />
      <Sparkle       x={SW - 26}       y={SH * 0.60} delay={300} />

      {/* Bottom decorations */}
      <FloatingPen   x={20}            y={SH - 120}  angle="15deg"  delay={200} color="#DDA0DD" capColor="#BA55D3" duration={2600} />
      <FloatingStar  x={SW - 36}       y={SH - 110}  size={10} delay={800} color="#FF69B4"  duration={2300} />
      <FloatingBook  x={SW / 2 - 20}   y={SH - 85}   angle="8deg"   delay={450} color="#FFB6C1" spineColor="#FF69B4" duration={2400} />

      {/* Scrollable content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 28, paddingTop: 72, paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ alignItems: "center", marginBottom: 32 }}>
          <View style={{
            width: 76, height: 76,
            backgroundColor: "#D4A5FF",
            borderRadius: 38,
            alignItems: "center", justifyContent: "center",
            marginBottom: 16,
            shadowColor: "#9B89BD",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.25, shadowRadius: 10, elevation: 8,
            borderWidth: 3, borderColor: "#E6D9FF",
          }}>
            <UserPlus size={32} color="white" />
          </View>
          <Text style={{ fontSize: 28, fontWeight: "800", color: "#9E1C60", marginBottom: 5 }}>
            Join the Journey
          </Text>
          <Text style={{ fontSize: 14, color: "#9B89BD" }}>
            Create your personal journal space
          </Text>
        </View>

        {/* Form Card */}
        <View style={{
          backgroundColor: "white",
          borderRadius: 24, padding: 24,
          borderWidth: 2, borderColor: "#E6D9FF",
          shadowColor: "#9B89BD",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.12, shadowRadius: 16, elevation: 6,
          marginBottom: 24,
        }}>
          {/* Email */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#6B5B95", marginBottom: 8 }}>Email Address</Text>
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#F5F0FF", borderWidth: 1.5, borderColor: "#D4A5FF", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 }}>
              <Mail size={18} color="#9B89BD" style={{ marginRight: 10 }} />
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor="#C5B3E6"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={{ flex: 1, fontSize: 15, color: "#6B5B95" }}
              />
            </View>
          </View>

          {/* Password */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#6B5B95", marginBottom: 8 }}>Password</Text>
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#F5F0FF", borderWidth: 1.5, borderColor: "#D4A5FF", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 }}>
              <Lock size={18} color="#9B89BD" style={{ marginRight: 10 }} />
              <TextInput
                placeholder="Create a password"
                placeholderTextColor="#C5B3E6"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={{ flex: 1, fontSize: 15, color: "#6B5B95" }}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                {showPassword ? <EyeOff size={18} color="#9B89BD" /> : <Eye size={18} color="#9B89BD" />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={{ marginBottom: 22 }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#6B5B95", marginBottom: 8 }}>Confirm Password</Text>
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#F5F0FF", borderWidth: 1.5, borderColor: "#D4A5FF", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 }}>
              <Lock size={18} color="#9B89BD" style={{ marginRight: 10 }} />
              <TextInput
                placeholder="Confirm your password"
                placeholderTextColor="#C5B3E6"
                value={cPassword}
                onChangeText={setCPassword}
                secureTextEntry={!showConfirmPassword}
                style={{ flex: 1, fontSize: 15, color: "#6B5B95" }}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={{ padding: 4 }}>
                {showConfirmPassword ? <EyeOff size={18} color="#9B89BD" /> : <Eye size={18} color="#9B89BD" />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Button */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={isLoading}
            style={{ backgroundColor: isLoading ? "rgba(212,165,255,0.5)" : "#D4A5FF", paddingVertical: 15, borderRadius: 16, marginBottom: 14, shadowColor: "#9B89BD", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 8, elevation: 4, borderWidth: 1.5, borderColor: "#C78EFF" }}
          >
            {isLoading
              ? <ActivityIndicator color="white" size="small" />
              : <Text style={{ textAlign: "center", fontSize: 16, color: "white", fontWeight: "700" }}>Create Account</Text>
            }
          </TouchableOpacity>

          {/* Hint */}
          <View style={{ backgroundColor: "#F5F0FF", borderRadius: 12, padding: 10, borderWidth: 1.5, borderColor: "#E6D9FF" }}>
            <Text style={{ fontSize: 11, color: "#9B89BD", textAlign: "center" }}>
              Password must be at least 6 characters long
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 18 }}>
          <View style={{ height: 1, backgroundColor: "#E6D9FF", flex: 1 }} />
          <Text style={{ marginHorizontal: 12, fontSize: 13, color: "#9B89BD" }}>or</Text>
          <View style={{ height: 1, backgroundColor: "#E6D9FF", flex: 1 }} />
        </View>

        {/* Sign In Link */}
        <Pressable
          onPress={() => router.back()}
          style={{ paddingHorizontal: 20, paddingVertical: 16, backgroundColor: "white", borderRadius: 18, borderWidth: 2, borderColor: "#E6D9FF", shadowColor: "#9B89BD", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 }}
        >
          <Text style={{ fontSize: 15, textAlign: "center", color: "#9B89BD", fontWeight: "600" }}>
            Already have an account?{" "}
            <Text style={{ color: "#9E1C60", fontWeight: "700" }}>Sign In</Text>
          </Text>
        </Pressable>

        <View style={{ marginTop: 28 }}>
          <Text style={{ fontSize: 11, color: "#B5A6C9", textAlign: "center" }}>
            Join thousands of people capturing their stories
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default Register;