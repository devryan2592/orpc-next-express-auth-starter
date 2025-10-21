"use client";

import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import type { 
  User, 
  Session, 
  ProfileUpdateData, 
  PasswordChangeData, 
  SessionRevokeData,
  ApiResponse 
} from "./types";

/**
 * Loads the current user session and returns user data
 */
export const loadUserData = async (): Promise<User | null> => {
  try {
    const { data: session, error } = await authClient.getSession();
    if (error || !session) {
      return null;
    }

    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      emailVerified: session.user.emailVerified,
      image: session.user.image || undefined,
      createdAt: session.user.createdAt,
      updatedAt: session.user.updatedAt,
    };
  } catch (error) {
    console.error("Failed to load user data:", error);
    toast.error("Failed to load user data");
    return null;
  }
};

/**
 * Loads all active sessions for the current user
 */
export const loadSessions = async (): Promise<Session[]> => {
  try {
    const { data: sessionData, error } = await authClient.listSessions();
    if (error) {
      console.error("Failed to load sessions:", error);
      toast.error("Failed to load sessions");
      return [];
    }
    return sessionData || [];
  } catch (error) {
    console.error("Failed to load sessions:", error);
    toast.error("Failed to load sessions");
    return [];
  }
};

/**
 * Updates the user's profile information
 */
export const updateProfile = async (data: ProfileUpdateData): Promise<boolean> => {
  try {
    const { error } = await authClient.updateUser({
      name: data.name,
    });

    if (error) {
      toast.error(error.message || "Failed to update profile");
      return false;
    }

    toast.success("Profile updated successfully");
    return true;
  } catch (error) {
    console.error("Profile update error:", error);
    toast.error("An unexpected error occurred");
    return false;
  }
};

/**
 * Changes the user's password with proper validation and confirmation
 * Redirects to login page after successful password change
 */
export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}): Promise<boolean> => {
  try {
    const { error } = await authClient.changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });

    if (error) {
      toast.error(error.message || "Failed to change password. Please try again.");
      return false;
    }

    toast.success("Password changed successfully! Please sign in with your new password.");
    
    // Immediate redirect to login page after password change
    setTimeout(() => {
      window.location.href = "/auth/login";
    }, 2000);
    
    return true;
  } catch (error) {
    console.error("Change password error:", error);
    toast.error("An error occurred while changing password. Please try again.");
    return false;
  }
};

/**
 * Revokes a specific session
 */
export const revokeSession = async (sessionId: string): Promise<boolean> => {
  try {
    const { error } = await authClient.revokeSession({ token: sessionId });
    if (error) {
      toast.error(error.message || "Failed to revoke session");
      return false;
    }

    toast.success("Session revoked successfully");
    return true;
  } catch (error) {
    console.error("Session revoke error:", error);
    toast.error("An unexpected error occurred");
    return false;
  }
};

/**
 * Revokes all other sessions except the current one
 */
export const revokeAllOtherSessions = async (): Promise<boolean> => {
  try {
    const { error } = await authClient.revokeOtherSessions();
    if (error) {
      toast.error(error.message || "Failed to revoke sessions");
      return false;
    }

    toast.success("All other sessions revoked successfully");
    return true;
  } catch (error) {
    console.error("Sessions revoke error:", error);
    toast.error("An unexpected error occurred");
    return false;
  }
};

/**
 * Signs out the current user and redirects to login page
 * Includes confirmation dialog and proper session cleanup
 */
export const signOut = async (): Promise<void> => {
  try {
    const { error } = await authClient.signOut();
    
    if (error) {
      toast.error(error.message || "Failed to sign out. Please try again.");
      return;
    }

    toast.success("Successfully signed out. Redirecting to login...");
    
    // Immediate redirect to login page after sign out
    setTimeout(() => {
      window.location.href = "/auth/login";
    }, 1000);
  } catch (error) {
    console.error("Sign out error:", error);
    toast.error("An error occurred while signing out. Please try again.");
  }
};

/**
 * Utility function to format dates consistently
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Utility function to get user initials for avatar fallback
 */
export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};