/**
 * CustomAlert – Beautiful journal-themed alert/dialog component
 *
 * Usage:
 *   // Simple one-button alert
 *   showAlert({ type: "success", title: "Done!", message: "Entry saved." });
 *
 *   // Confirm dialog (delete / destructive)
 *   showAlert({
 *     type: "warning",
 *     title: "Delete Entry",
 *     message: "Are you sure?",
 *     confirmText: "Delete",
 *     cancelText: "Cancel",
 *     onConfirm: () => doDelete(),
 *   });
 *
 * Mount <CustomAlert /> once at or near the root of your screen,
 * then call the exported `showAlert(config)` anywhere in that file.
 *
 * For a global singleton across screens, import the hook from this file.
 */

import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ── Types ────────────────────────────────────────────────────────────
export type AlertType = "success" | "error" | "warning" | "info";

export interface AlertConfig {
  type: AlertType;
  title: string;
  message: string;
  /** Label for the primary / confirm button (default "OK") */
  confirmText?: string;
  /** Label for the cancel button – if provided a second button appears */
  cancelText?: string;
  /** Called when the primary button is tapped */
  onConfirm?: () => void;
  /** Called when the cancel button or backdrop is tapped */
  onCancel?: () => void;
}

// ── Palette per alert type ───────────────────────────────────────────
const PALETTE: Record<
  AlertType,
  { icon: string; accent: string; bg: string; border: string; btnBg: string; btnText: string }
> = {
  success: {
    icon: "✅",
    accent: "#16A34A",
    bg: "#F0FFF4",
    border: "#86EFAC",
    btnBg: "#4ADE80",
    btnText: "#fff",
  },
  error: {
    icon: "❌",
    accent: "#BE123C",
    bg: "#FFF1F2",
    border: "#FDA4AF",
    btnBg: "#FB7185",
    btnText: "#fff",
  },
  warning: {
    icon: "⚠️",
    accent: "#B45309",
    bg: "#FFFBEB",
    border: "#FCD34D",
    btnBg: "#F59E0B",
    btnText: "#fff",
  },
  info: {
    icon: "💜",
    accent: "#7C3AED",
    bg: "#F5F3FF",
    border: "#C4B5FD",
    btnBg: "#D4A5FF",
    btnText: "#fff",
  },
};

// ── Internal Component ───────────────────────────────────────────────
interface CustomAlertProps {
  config: AlertConfig | null;
  onClose: () => void;
}

const CustomAlertView: React.FC<CustomAlertProps> = ({ config, onClose }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (config) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 70,
          friction: 9,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [config]);

  if (!config) return null;

  const pal = PALETTE[config.type];
  const isDestructive = config.type === "warning" || config.type === "error";

  const handleConfirm = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 0.85, duration: 150, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      onClose();
      config.onConfirm?.();
    });
  };

  const handleCancel = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 0.85, duration: 150, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      onClose();
      config.onCancel?.();
    });
  };

  return (
    <Modal
      transparent
      visible={!!config}
      animationType="none"
      onRequestClose={handleCancel}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Pressable
        onPress={config.cancelText ? handleCancel : handleConfirm}
        style={{
          flex: 1,
          backgroundColor: "rgba(80, 40, 110, 0.45)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 28,
        }}
      >
        {/* Card */}
        <Animated.View
          style={{
            width: "100%",
            backgroundColor: "white",
            borderRadius: 28,
            padding: 28,
            borderWidth: 2,
            borderColor: pal.border,
            shadowColor: pal.accent,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.22,
            shadowRadius: 20,
            elevation: 18,
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          }}
        >
          {/* Stop backdrop tap from closing mid-card */}
          <Pressable onPress={() => {}}>
            {/* Icon bubble */}
            <View style={{ alignItems: "center", marginBottom: 18 }}>
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: pal.bg,
                  borderWidth: 2.5,
                  borderColor: pal.border,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 14,
                  shadowColor: pal.accent,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.18,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Text style={{ fontSize: 32 }}>{pal.icon}</Text>
              </View>

              {/* Title */}
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "800",
                  color: pal.accent,
                  textAlign: "center",
                  marginBottom: 8,
                  letterSpacing: 0.2,
                }}
              >
                {config.title}
              </Text>

              {/* Message */}
              <Text
                style={{
                  fontSize: 14,
                  color: "#6B5B95",
                  textAlign: "center",
                  lineHeight: 21,
                  paddingHorizontal: 4,
                }}
              >
                {config.message}
              </Text>
            </View>

            {/* Decorative divider */}
            <View
              style={{
                height: 1.5,
                backgroundColor: pal.border,
                borderRadius: 1,
                marginBottom: 20,
                opacity: 0.5,
              }}
            />

            {/* Buttons */}
            {config.cancelText ? (
              /* Two-button layout */
              <View style={{ flexDirection: "row", gap: 12 }}>
                {/* Cancel */}
                <TouchableOpacity
                  onPress={handleCancel}
                  style={{
                    flex: 1,
                    paddingVertical: 13,
                    borderRadius: 16,
                    backgroundColor: "#F5F0FF",
                    borderWidth: 1.5,
                    borderColor: "#D4A5FF",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "600",
                      color: "#9B89BD",
                    }}
                  >
                    {config.cancelText}
                  </Text>
                </TouchableOpacity>

                {/* Confirm / destructive */}
                <TouchableOpacity
                  onPress={handleConfirm}
                  style={{
                    flex: 1,
                    paddingVertical: 13,
                    borderRadius: 16,
                    backgroundColor: isDestructive ? "#FB7185" : pal.btnBg,
                    borderWidth: 1.5,
                    borderColor: isDestructive ? "#F43F5E" : pal.accent,
                    alignItems: "center",
                    shadowColor: isDestructive ? "#F43F5E" : pal.accent,
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    elevation: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: "#fff",
                    }}
                  >
                    {config.confirmText ?? "Confirm"}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Single OK button */
              <TouchableOpacity
                onPress={handleConfirm}
                style={{
                  paddingVertical: 14,
                  borderRadius: 16,
                  backgroundColor: pal.btnBg,
                  borderWidth: 1.5,
                  borderColor: pal.accent,
                  alignItems: "center",
                  shadowColor: pal.accent,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.28,
                  shadowRadius: 8,
                  elevation: 5,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: pal.btnText,
                    letterSpacing: 0.3,
                  }}
                >
                  {config.confirmText ?? "OK"}
                </Text>
              </TouchableOpacity>
            )}
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

// ── Hook – use this inside any component ────────────────────────────
export const useCustomAlert = () => {
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);

  const showAlert = (config: AlertConfig) => setAlertConfig(config);
  const hideAlert = () => setAlertConfig(null);

  const AlertComponent = () => (
    <CustomAlertView config={alertConfig} onClose={hideAlert} />
  );

  return { showAlert, AlertComponent };
};

export default CustomAlertView;
