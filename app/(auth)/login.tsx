import { useRouter } from "expo-router";
import { BookOpen, Eye, EyeOff, Lock, Mail, Send, X } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useCustomAlert } from "../../components/CustomAlert";
import { forgotPassword, login } from "../../services/authService";

const { width: SW, height: SH } = Dimensions.get("window");

// ── Floating Star ────────────────────────────────────────────────
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

// ── Floating Pen ─────────────────────────────────────────────────
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

// ── Floating Book ────────────────────────────────────────────────
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

// ── Sparkle ──────────────────────────────────────────────────────
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

// ── Main Login Screen ─────────────────────────────────────────────
const Login = () => {
  const router = useRouter();
  const { showAlert, AlertComponent } = useCustomAlert();
  const [email, setEmail]           = useState<string>("");
  const [password, setPassword]     = useState<string>("");
  const [isLoading, setIsLoading]   = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // ── Forgot Password state ────────────────────────────────────────
  const [fpModalVisible, setFpModalVisible] = useState<boolean>(false);
  const [fpEmail, setFpEmail]               = useState<string>("");
  const [fpLoading, setFpLoading]           = useState<boolean>(false);
  const [fpSent, setFpSent]                 = useState<boolean>(false);
  const fpModalAnim                         = useRef(new Animated.Value(0)).current;

  const openFpModal = () => {
    setFpEmail("");
    setFpSent(false);
    setFpModalVisible(true);
    Animated.spring(fpModalAnim, { toValue: 1, useNativeDriver: true, tension: 65, friction: 9 }).start();
  };

  const closeFpModal = () => {
    Animated.timing(fpModalAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() =>
      setFpModalVisible(false)
    );
  };

  const handleForgotPassword = async () => {
    if (fpLoading) return;
    if (!fpEmail.trim()) {
      showAlert({ type: "error", title: "Email Required", message: "Please enter your email address." });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(fpEmail.trim())) {
      showAlert({ type: "error", title: "Invalid Email", message: "Please enter a valid email address." });
      return;
    }
    setFpLoading(true);
    try {
      await forgotPassword(fpEmail.trim());
      setFpSent(true);
    } catch (err: any) {
      const code = err?.code ?? "";
      if (code === "auth/user-not-found") {
        showAlert({ type: "error", title: "Not Found", message: "No account found with that email address." });
      } else {
        showAlert({ type: "error", title: "Something Went Wrong", message: "Please try again later." });
      }
    } finally {
      setFpLoading(false);
    }
  };

  const handleLogin = async () => {
    if (isLoading) return;
    if (!email.trim())    { showAlert({ type: "error", title: "Validation Error", message: "Email is required." }); return; }
    if (!password.trim()) { showAlert({ type: "error", title: "Validation Error", message: "Password is required." }); return; }

    setIsLoading(true);
    await login(email, password)
      .then(() => { router.push("/JournalEntries"); })
      .catch((err) => { showAlert({ type: "error", title: "Login Failed", message: "Invalid email or password. Please try again." }); console.error(err); })
      .finally(() => { setIsLoading(false); });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#E8D5F2" }}>
      <AlertComponent />
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />


      {/* ── Top section decorations ── */}
      <FloatingStar  x={18}           y={60}        size={13} delay={0}   color="#FF69B4"  duration={2200} />
      <FloatingStar  x={SW - 36}      y={74}        size={11} delay={300} color="#DDA0DD"  duration={1900} />
      <FloatingPen   x={28}           y={110}       angle="20deg"  delay={400} color="#DDA0DD" capColor="#BA55D3" duration={2800} />
      <FloatingBook  x={SW - 60}      y={98}        angle="-14deg" delay={200} color="#FFB6C1" spineColor="#FF69B4" duration={2500} />
      <Sparkle       x={SW / 2 - 6}   y={84}        delay={700} />

      {/* ── Mid-left decorations ── */}
      <FloatingStar  x={10}           y={SH * 0.36} size={10} delay={500} color="#DDA0DD"  duration={2400} />
      <FloatingPen   x={4}            y={SH * 0.47} angle="28deg"  delay={700} color="#FFB6C1" capColor="#FF1493" duration={3000} />
      <Sparkle       x={14}           y={SH * 0.58} delay={900} />

      {/* ── Mid-right decorations ── */}
      <FloatingStar  x={SW - 28}      y={SH * 0.34} size={12} delay={150} color="#FFB6C1"  duration={2100} />
      <FloatingBook  x={SW - 54}      y={SH * 0.48} angle="-18deg" delay={600} color="#DDA0DD" spineColor="#9932CC" duration={2700} />
      <Sparkle       x={SW - 26}      y={SH * 0.61} delay={300} />

      {/* ── Bottom decorations ── */}
      <FloatingPen   x={20}           y={SH - 130}  angle="15deg"  delay={200} color="#DDA0DD" capColor="#BA55D3" duration={2600} />
      <FloatingStar  x={SW - 36}      y={SH - 118}  size={10} delay={800} color="#FF69B4"  duration={2300} />
      <FloatingBook  x={SW / 2 - 18}  y={SH - 90}   angle="8deg"   delay={450} color="#FFB6C1" spineColor="#FF69B4" duration={2400} />

      {/* ── Scrollable content ── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 28,
          paddingTop: 72,
          paddingBottom: 50,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ alignItems: "center", marginBottom: 36 }}>
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
            <BookOpen size={32} color="white" />
          </View>
          <Text style={{ fontSize: 28, fontWeight: "800", color: "#9E1C60", marginBottom: 5 }}>
            Welcome Back
          </Text>
          <Text style={{ fontSize: 14, color: "#9B89BD" }}>
            Continue your journaling journey
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
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#6B5B95", marginBottom: 8 }}>
              Email Address
            </Text>
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
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#6B5B95", marginBottom: 8 }}>
              Password
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#F5F0FF", borderWidth: 1.5, borderColor: "#D4A5FF", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 }}>
              <Lock size={18} color="#9B89BD" style={{ marginRight: 10 }} />
              <TextInput
                placeholder="Enter your password"
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

          {/* Sign In Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            style={{
              backgroundColor: isLoading ? "rgba(212,165,255,0.5)" : "#D4A5FF",
              paddingVertical: 15, borderRadius: 16, marginBottom: 14,
              shadowColor: "#9B89BD", shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.28, shadowRadius: 8, elevation: 4,
              borderWidth: 1.5, borderColor: "#C78EFF",
            }}
          >
            {isLoading
              ? <ActivityIndicator color="white" size="small" />
              : <Text style={{ textAlign: "center", fontSize: 16, color: "white", fontWeight: "700" }}>Sign In</Text>
            }
          </TouchableOpacity>

          {/* Forgot Password */}
          <TouchableOpacity onPress={openFpModal} style={{ alignSelf: "center", padding: 6 }}>
            <Text style={{ fontSize: 13, color: "#B95E82", fontWeight: "600" }}>
              Forgot your password?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 18 }}>
          <View style={{ height: 1, backgroundColor: "#E6D9FF", flex: 1 }} />
          <Text style={{ marginHorizontal: 12, fontSize: 13, color: "#9B89BD" }}>or</Text>
          <View style={{ height: 1, backgroundColor: "#E6D9FF", flex: 1 }} />
        </View>

        {/* Register Link */}
        <Pressable
          onPress={() => router.push("/register")}
          style={{
            paddingHorizontal: 20, paddingVertical: 16,
            backgroundColor: "white", borderRadius: 18,
            borderWidth: 2, borderColor: "#E6D9FF",
            shadowColor: "#9B89BD", shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
          }}
        >
          <Text style={{ fontSize: 15, textAlign: "center", color: "#9B89BD", fontWeight: "600" }}>
            Don't have an account?{" "}
            <Text style={{ color: "#9E1C60", fontWeight: "700" }}>Create One</Text>
          </Text>
        </Pressable>

        <View style={{ marginTop: 28 }}>
          <Text style={{ fontSize: 11, color: "#B5A6C9", textAlign: "center" }}>
            Your thoughts, your privacy, your journey
          </Text>
        </View>
      </ScrollView>

      {/* ── Forgot Password Modal ─────────────────────────────────── */}
      <Modal
        transparent
        visible={fpModalVisible}
        animationType="none"
        onRequestClose={closeFpModal}
        statusBarTranslucent
      >
        {/* Backdrop */}
        <Pressable
          onPress={closeFpModal}
          style={{
            flex: 1,
            backgroundColor: "rgba(80,40,110,0.45)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
          }}
        >
          {/* Card – stop propagation so taps inside don't close modal */}
          <Animated.View
            style={{
              width: "100%",
              backgroundColor: "white",
              borderRadius: 28,
              padding: 28,
              borderWidth: 2,
              borderColor: "#E6D9FF",
              shadowColor: "#9B39BD",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25,
              shadowRadius: 20,
              elevation: 16,
              transform: [
                {
                  scale: fpModalAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.85, 1],
                  }),
                },
                {
                  translateY: fpModalAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [40, 0],
                  }),
                },
              ],
              opacity: fpModalAnim,
            }}
          >
            <Pressable onPress={() => {}}>
              {/* Close button */}
              <TouchableOpacity
                onPress={closeFpModal}
                style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  backgroundColor: "#F5F0FF",
                  borderRadius: 20,
                  padding: 6,
                  borderWidth: 1.5,
                  borderColor: "#D4A5FF",
                }}
              >
                <X size={16} color="#9B89BD" />
              </TouchableOpacity>

              {/* Icon */}
              <View style={{ alignItems: "center", marginBottom: 20 }}>
                <View
                  style={{
                    width: 64,
                    height: 64,
                    backgroundColor: "#F0E6FF",
                    borderRadius: 32,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 2,
                    borderColor: "#D4A5FF",
                    marginBottom: 14,
                  }}
                >
                  <Mail size={28} color="#9E1C60" />
                </View>
                <Text style={{ fontSize: 20, fontWeight: "800", color: "#9E1C60", marginBottom: 6 }}>
                  Reset Password
                </Text>
                <Text style={{ fontSize: 13, color: "#9B89BD", textAlign: "center", lineHeight: 19 }}>
                  {fpSent
                    ? "Check your inbox! A reset link has been sent to your email."
                    : "Enter your email and we'll send you a link to reset your password."}
                </Text>
              </View>

              {fpSent ? (
                /* ── Success state ── */
                <View style={{ alignItems: "center" }}>
                  <View
                    style={{
                      backgroundColor: "#F0FFF4",
                      borderWidth: 1.5,
                      borderColor: "#86EFAC",
                      borderRadius: 14,
                      paddingVertical: 14,
                      paddingHorizontal: 20,
                      marginBottom: 18,
                      width: "100%",
                    }}
                  >
                    <Text style={{ fontSize: 13, color: "#16A34A", textAlign: "center", lineHeight: 18 }}>
                      ✅  Email sent to{"\n"}
                      <Text style={{ fontWeight: "700" }}>{fpEmail.trim()}</Text>
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={closeFpModal}
                    style={{
                      backgroundColor: "#D4A5FF",
                      paddingVertical: 13,
                      paddingHorizontal: 36,
                      borderRadius: 16,
                      borderWidth: 1.5,
                      borderColor: "#C78EFF",
                    }}
                  >
                    <Text style={{ color: "white", fontWeight: "700", fontSize: 15 }}>Done</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* ── Input state ── */
                <View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#F5F0FF",
                      borderWidth: 1.5,
                      borderColor: "#D4A5FF",
                      borderRadius: 14,
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      marginBottom: 18,
                    }}
                  >
                    <Mail size={18} color="#9B89BD" style={{ marginRight: 10 }} />
                    <TextInput
                      placeholder="Enter your email address"
                      placeholderTextColor="#C5B3E6"
                      value={fpEmail}
                      onChangeText={setFpEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoFocus
                      style={{ flex: 1, fontSize: 15, color: "#6B5B95" }}
                    />
                  </View>

                  <TouchableOpacity
                    onPress={handleForgotPassword}
                    disabled={fpLoading}
                    style={{
                      backgroundColor: fpLoading ? "rgba(212,165,255,0.5)" : "#D4A5FF",
                      paddingVertical: 14,
                      borderRadius: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      borderWidth: 1.5,
                      borderColor: "#C78EFF",
                      shadowColor: "#9B89BD",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.25,
                      shadowRadius: 8,
                      elevation: 4,
                    }}
                  >
                    {fpLoading ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <>
                        <Send size={16} color="white" />
                        <Text style={{ color: "white", fontWeight: "700", fontSize: 15 }}>
                          Send Reset Link
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default Login;