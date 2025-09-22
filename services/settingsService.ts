import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  updatePassword,
  updateProfile,
  User,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import { auth } from "../firebase";

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  createdAt: string | undefined;
  lastSignInTime: string | undefined;
  phoneNumber: string | null;
}

interface ServiceResponse {
  success: boolean;
  message: string;
}

interface UpdateEmailParams {
  currentPassword: string;
  newEmail: string;
}

interface UpdatePasswordParams {
  currentPassword: string;
  newPassword: string;
}

interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

interface EmailVerificationStatus {
  currentEmail: string | null;
  emailVerified: boolean;
  uid: string;
}

class SettingsService {
  // Get current user profile
  getUserProfile(): UserProfile | null {
    const user: User | null = auth.currentUser;
    if (!user) return null;

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
      createdAt: user.metadata.creationTime,
      lastSignInTime: user.metadata.lastSignInTime,
      phoneNumber: user.phoneNumber,
    };
  }

  // Update username/display name
  async updateUsername(newUsername: string): Promise<ServiceResponse> {
    try {
      const user: User | null = auth.currentUser;
      if (!user) {
        throw new Error("No user is currently signed in");
      }

      if (!newUsername || newUsername.trim().length < 2) {
        throw new Error("Username must be at least 2 characters long");
      }

      if (newUsername.trim().length > 30) {
        throw new Error("Username must be less than 30 characters");
      }

      await updateProfile(user, {
        displayName: newUsername.trim(),
      });

      return {
        success: true,
        message: "Username updated successfully",
      };
    } catch (error: any) {
      console.error("Error updating username:", error);
      throw new Error(error.message || "Failed to update username");
    }
  }

  // Send verification email for current email address
  async sendCurrentEmailVerification(): Promise<ServiceResponse> {
    try {
      const user: User | null = auth.currentUser;
      if (!user) {
        throw new Error("No user is currently signed in");
      }

      if (user.emailVerified) {
        return {
          success: true,
          message: "Email is already verified",
        };
      }

      await sendEmailVerification(user);

      return {
        success: true,
        message: "Verification email sent to your current email address",
      };
    } catch (error: any) {
      console.error("Error sending verification email:", error);

      if (error.code === "auth/too-many-requests") {
        throw new Error("Too many requests. Please try again later.");
      }

      throw new Error("Failed to send verification email");
    }
  }

  async refreshUserVerificationStatus(): Promise<boolean> {
    try {
      const user: User | null = auth.currentUser;
      if (!user) return false;

      await reload(user);

      return user.emailVerified;
    } catch (error: any) {
      console.error("Error refreshing user verification status:", error);
      return false;
    }
  }

  // Updated email change method using verifyBeforeUpdateEmail
  async updateEmail({
    currentPassword,
    newEmail,
  }: UpdateEmailParams): Promise<ServiceResponse> {
    try {
      const user: User | null = auth.currentUser;
      if (!user) {
        throw new Error("No user is currently signed in");
      }

      if (!user.emailVerified) {
        throw new Error(
          "Please verify your current email address before changing it"
        );
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        throw new Error("Please enter a valid email address");
      }

      if (newEmail === user.email) {
        throw new Error("New email is the same as current email");
      }

      if (!user.email) {
        throw new Error("Current user email is not available");
      }

      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      await verifyBeforeUpdateEmail(user, newEmail);

      return {
        success: true,
        message:
          "Verification email sent to new email address. Please check your email and verify before the change takes effect.",
      };
    } catch (error: any) {
      console.error("Error updating email:", error);

      // Handle specific error cases
      if (error.code === "auth/wrong-password") {
        throw new Error("Current password is incorrect");
      } else if (error.code === "auth/email-already-in-use") {
        throw new Error("This email is already in use by another account");
      } else if (error.code === "auth/invalid-email") {
        throw new Error("Invalid email address");
      } else if (error.code === "auth/requires-recent-login") {
        throw new Error(
          "Please sign out and sign in again before changing your email"
        );
      } else if (error.code === "auth/operation-not-allowed") {
        throw new Error(
          "Email change operation is not allowed. Please contact support."
        );
      }

      throw new Error(error.message || "Failed to update email");
    }
  }

  // Method to check if user has pending email verification
  async checkPendingEmailVerification(): Promise<EmailVerificationStatus | null> {
    try {
      const user: User | null = auth.currentUser;
      if (!user) return null;

      await reload(user);

      return {
        currentEmail: user.email,
        emailVerified: user.emailVerified,
        uid: user.uid,
      };
    } catch (error: any) {
      console.error("Error checking email verification status:", error);
      return null;
    }
  }

  // Method to resend verification email (if user lost it)
  async resendEmailVerification(): Promise<ServiceResponse> {
    try {
      const user: User | null = auth.currentUser;
      if (!user) {
        throw new Error("No user is currently signed in");
      }

      await sendEmailVerification(user);
      return { success: true, message: "Verification email sent!" };
    } catch (error: any) {
      console.error("Error sending verification email:", error);

      if (error.code === "auth/too-many-requests") {
        throw new Error("Too many requests. Please try again later.");
      }

      throw new Error("Failed to send verification email");
    }
  }

  // Update password
  async updatePassword({
    currentPassword,
    newPassword,
  }: UpdatePasswordParams): Promise<ServiceResponse> {
    try {
      const user: User | null = auth.currentUser;
      if (!user) {
        throw new Error("No user is currently signed in");
      }

      if (!user.email) {
        throw new Error("Current user email is not available");
      }

      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, newPassword);

      return {
        success: true,
        message: "Password updated successfully",
      };
    } catch (error: any) {
      console.error("Error updating password:", error);

      if (error.code === "auth/wrong-password") {
        throw new Error("Current password is incorrect");
      } else if (error.code === "auth/weak-password") {
        throw new Error("New password is too weak");
      } else if (error.code === "auth/requires-recent-login") {
        throw new Error(
          "Please sign out and sign in again before changing your password"
        );
      }

      throw new Error(error.message || "Failed to update password");
    }
  }

  // Validate password strength
  validatePasswordStrength(password: string): PasswordValidation {
    const errors: string[] = [];

    if (password.length < 6) {
      errors.push("Password must be at least 6 characters long");
    }

    if (password.length > 128) {
      errors.push("Password must be less than 128 characters");
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  }

  // Sign out user
  async signOutUser(): Promise<ServiceResponse> {
    try {
      await signOut(auth);
      return { success: true, message: "Signed out successfully" };
    } catch (error: any) {
      console.error("Error signing out:", error);
      throw new Error(error.message || "Failed to sign out");
    }
  }

  // Delete user account
  async deleteAccount(currentPassword: string): Promise<ServiceResponse> {
    try {
      const user: User | null = auth.currentUser;
      if (!user) {
        throw new Error("No user is currently signed in");
      }

      if (!user.email) {
        throw new Error("Current user email is not available");
      }

      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Delete user account
      await deleteUser(user);

      return {
        success: true,
        message: "Account deleted successfully",
      };
    } catch (error: any) {
      console.error("Error deleting account:", error);

      if (error.code === "auth/wrong-password") {
        throw new Error("Current password is incorrect");
      } else if (error.code === "auth/requires-recent-login") {
        throw new Error(
          "Please sign out and sign in again before deleting your account"
        );
      }

      throw new Error(error.message || "Failed to delete account");
    }
  }

  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return auth.onAuthStateChanged(callback);
  }

  isAuthenticated(): boolean {
    return !!auth.currentUser;
  }

  async getUserToken(): Promise<string | null> {
    try {
      const user: User | null = auth.currentUser;
      if (!user) return null;

      return await user.getIdToken();
    } catch (error: any) {
      console.error("Error getting user token:", error);
      return null;
    }
  }

  async refreshUserToken(): Promise<string | null> {
    try {
      const user: User | null = auth.currentUser;
      if (!user) return null;

      return await user.getIdToken(true); // Force refresh
    } catch (error: any) {
      console.error("Error refreshing user token:", error);
      return null;
    }
  }

  async sendPasswordResetEmail(email: string): Promise<ServiceResponse> {
    try {
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
        message: "Password reset email sent",
      };
    } catch (error: any) {
      console.error("Error sending password reset email:", error);

      if (error.code === "auth/user-not-found") {
        throw new Error("No account found with this email address");
      } else if (error.code === "auth/invalid-email") {
        throw new Error("Invalid email address");
      }

      throw new Error(error.message || "Failed to send password reset email");
    }
  }
}

const settingsService = new SettingsService();
export default settingsService;
