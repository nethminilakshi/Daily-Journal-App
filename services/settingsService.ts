// services/settingsService.ts
import {
  EmailAuthProvider,
  User as FirebaseUser,
  deleteUser,
  reauthenticateWithCredential,
  sendEmailVerification,
  signOut,
  updateEmail,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase";
import journalService from "./journalService";

export interface UserUpdateData {
  displayName?: string;
  email?: string;
}

export interface PasswordUpdateData {
  currentPassword: string;
  newPassword: string;
}

export interface EmailUpdateData {
  currentPassword: string;
  newEmail: string;
}

class SettingsService {
  // Get current user
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  // Update username/display name
  async updateUsername(newUsername: string): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) throw new Error("No user logged in");

    if (!newUsername.trim()) {
      throw new Error("Username cannot be empty");
    }

    if (newUsername.trim().length > 30) {
      throw new Error("Username cannot exceed 30 characters");
    }

    await updateProfile(user, {
      displayName: newUsername.trim(),
    });
  }

  // Re-authenticate user (required for sensitive operations)
  private async reauthenticateUser(currentPassword: string): Promise<void> {
    const user = this.getCurrentUser();
    if (!user || !user.email) throw new Error("No user logged in");

    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    await reauthenticateWithCredential(user, credential);
  }

  // Update password
  async updatePassword(passwordData: PasswordUpdateData): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) throw new Error("No user logged in");

    const { currentPassword, newPassword } = passwordData;

    // Validate new password
    if (newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters long");
    }

    if (newPassword.length > 128) {
      throw new Error("Password cannot exceed 128 characters");
    }

    // Re-authenticate before password change
    await this.reauthenticateUser(currentPassword);

    // Update password
    await updatePassword(user, newPassword);
  }

  // Update email
  async updateEmail(emailData: EmailUpdateData): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) throw new Error("No user logged in");

    const { currentPassword, newEmail } = emailData;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      throw new Error("Please enter a valid email address");
    }

    // Re-authenticate before email change
    await this.reauthenticateUser(currentPassword);

    // Update email
    await updateEmail(user, newEmail);

    // Send verification email to new address
    await sendEmailVerification(user);
  }

  // Sign out user
  async signOutUser(): Promise<void> {
    await signOut(auth);
  }

  // Delete user account and all data
  async deleteAccount(currentPassword: string): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) throw new Error("No user logged in");

    try {
      // Re-authenticate before account deletion
      await this.reauthenticateUser(currentPassword);

      // Delete user's journal entries first
      await this.deleteAllUserData();

      // Delete the user account
      await deleteUser(user);
    } catch (error: any) {
      if (error.code === "auth/wrong-password") {
        throw new Error("Current password is incorrect");
      }
      throw error;
    }
  }

  // Delete all user data (journal entries, etc.)
  private async deleteAllUserData(): Promise<void> {
    try {
      // Use the updated journal service method
      await journalService.deleteAllUserJournalEntries();
    } catch (error) {
      console.warn("Error deleting user data:", error);
      // Don't throw here - we still want to delete the account even if data deletion fails
    }
  }

  // Check if email is verified
  isEmailVerified(): boolean {
    const user = this.getCurrentUser();
    return user?.emailVerified || false;
  }

  // Send email verification
  async sendEmailVerification(): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) throw new Error("No user logged in");

    await sendEmailVerification(user);
  }

  // Get user profile data
  getUserProfile(): {
    displayName: string | null;
    email: string | null;
    emailVerified: boolean;
    createdAt: string | null;
  } | null {
    const user = this.getCurrentUser();
    if (!user) return null;

    return {
      displayName: user.displayName,
      email: user.email,
      emailVerified: user.emailVerified,
      createdAt: user.metadata.creationTime || null,
    };
  }

  // Validate password strength
  validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
    strength: "weak" | "medium" | "strong";
  } {
    const errors: string[] = [];
    let strength: "weak" | "medium" | "strong" = "weak";

    if (password.length < 6) {
      errors.push("Password must be at least 6 characters long");
    }

    if (password.length < 8) {
      errors.push("Consider using at least 8 characters for better security");
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push("Consider adding lowercase letters");
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push("Consider adding uppercase letters");
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push("Consider adding numbers");
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push("Consider adding special characters");
    }

    // Determine strength
    if (
      password.length >= 8 &&
      /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)
    ) {
      strength = "medium";
    }

    if (
      password.length >= 12 &&
      /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)
    ) {
      strength = "strong";
    }

    return {
      isValid: password.length >= 6,
      errors: errors.filter((error) => !error.includes("Consider")), // Only return critical errors for isValid
      strength,
    };
  }
}

const settingsService = new SettingsService();
export default settingsService;
