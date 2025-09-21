import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
  updateEmail,
} from "firebase/auth";
import { auth } from "../firebase"; // Your firebase config file

// Method 1: Simple email change with verification
const changeEmailSimple = async (newEmail: string): Promise<void> => {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("No user logged in");
    }

    // Update email
    await updateEmail(user, newEmail);

    // Send verification email to new address
    await sendEmailVerification(user);

    alert("Email updated! Please check your new email for verification.");
  } catch (error) {
    console.error("Error changing email:", error);

    if (typeof error === "object" && error !== null && "code" in error) {
      const err = error as { code: string; message?: string };
      if (err.code === "auth/operation-not-allowed") {
        alert("Please verify your current email first, then try again.");
      } else if (err.code === "auth/requires-recent-login") {
        alert("Please log out and log back in, then try changing your email.");
      } else if (err.code === "auth/email-already-in-use") {
        alert("This email is already being used by another account.");
      } else {
        alert("Error: " + (err.message ?? "Unknown error"));
      }
    } else {
      alert(
        "Error: " + (error instanceof Error ? error.message : String(error))
      );
    }
  }
};

// Method 2: Email change with re-authentication (more secure)
const changeEmailWithReauth = async (
  currentPassword: string,
  newEmail: string
): Promise<void> => {
  try {
    const user = auth.currentUser;

    if (!user || !user.email) {
      throw new Error("No user logged in or no current email");
    }

    // Re-authenticate user with current password
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    await reauthenticateWithCredential(user, credential);

    // Update email
    await updateEmail(user, newEmail);

    // Send verification email to new address
    await sendEmailVerification(user);

    alert("Email updated successfully! Please verify your new email.");
  } catch (error) {
    console.error("Error changing email:", error);

    // Type guard for FirebaseError
    if (typeof error === "object" && error !== null && "code" in error) {
      const err = error as { code: string; message?: string };
      if (err.code === "auth/wrong-password") {
        alert("Incorrect current password.");
      } else if (err.code === "auth/email-already-in-use") {
        alert("This email is already being used by another account.");
      } else if (err.code === "auth/invalid-email") {
        alert("Please enter a valid email address.");
      } else {
        alert("Error: " + (err.message ?? "Unknown error"));
      }
    } else {
      alert(
        "Error: " + (error instanceof Error ? error.message : String(error))
      );
    }
  }
};

// Method 3: React component example
import React, { useState } from "react";

interface ChangeEmailComponentProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const ChangeEmailComponent: React.FC<ChangeEmailComponentProps> = ({
  onSuccess,
  onError,
}) => {
  const [newEmail, setNewEmail] = useState<string>("");
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleEmailChange = async (): Promise<void> => {
    if (!newEmail.trim()) {
      alert("Please enter a new email address.");
      return;
    }

    setLoading(true);

    try {
      // Use method 2 if you want password verification
      await changeEmailWithReauth(currentPassword, newEmail);

      // Clear form
      setNewEmail("");
      setCurrentPassword("");

      // Call success callback if provided
      onSuccess?.();
    } catch (error: any) {
      console.error("Failed to change email:", error);
      onError?.(error.message || "Failed to change email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Change Email</h3>

      <input
        type="password"
        placeholder="Current Password"
        value={currentPassword}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setCurrentPassword(e.target.value)
        }
      />

      <input
        type="email"
        placeholder="New Email Address"
        value={newEmail}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setNewEmail(e.target.value)
        }
      />

      <button onClick={handleEmailChange} disabled={loading}>
        {loading ? "Updating..." : "Change Email"}
      </button>
    </div>
  );
};

// Method 4: Check email verification status
const checkEmailVerificationStatus = (): boolean | null => {
  const user = auth.currentUser;

  if (user) {
    if (user.emailVerified) {
      console.log("Email is verified");
      return true;
    } else {
      console.log("Email is not verified");
      // Optionally send verification email
      sendEmailVerification(user);
      return false;
    }
  }
  return null;
};

// Method 5: Send verification email manually
const sendVerificationEmail = async (): Promise<void> => {
  try {
    const user = auth.currentUser;

    if (user) {
      await sendEmailVerification(user);
      alert("Verification email sent!");
    }
  } catch (error) {
    console.error("Error sending verification email:", error);
    alert(
      "Error sending verification email: " +
        (error instanceof Error ? error.message : String(error))
    );
  }
};

export {
  ChangeEmailComponent,
  changeEmailSimple,
  changeEmailWithReauth,
  checkEmailVerificationStatus,
  sendVerificationEmail,
};
