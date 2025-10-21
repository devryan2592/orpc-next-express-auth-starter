"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Settings, Shield, LogOut } from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";
import AppButton from "@/components/app-ui/button";
import DashboardPageHeader from "@/components/dashboard/dashboard-page-header";
import { ProfileTab, SecurityTab, SessionsTab } from "./tabs";
import { loadUserData, loadSessions, signOut } from "./actions";
import type { User as UserType, Session } from "./actions/types";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user data and sessions on component mount
  useEffect(() => {
    initializeData();
  }, []);

  /**
   * Initializes user data and sessions
   */
  const initializeData = async () => {
    setLoading(true);

    const userData = await loadUserData();
    if (!userData) {
      router.push("/auth/login");
      return;
    }

    setUser(userData);

    const sessionsData = await loadSessions();
    setSessions(sessionsData);

    setLoading(false);
  };

  /**
   * Refreshes user data after updates
   */
  const handleUserUpdate = async () => {
    const userData = await loadUserData();
    if (userData) {
      setUser(userData);
    }
  };

  /**
   * Refreshes sessions data after updates
   */
  const handleSessionsUpdate = async () => {
    const sessionsData = await loadSessions();
    setSessions(sessionsData);
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // User not found state
  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <DashboardPageHeader
        title="Account Settings"
        description="Manage your account settings and preferences"
      />

      <Tabs
        defaultValue="profile"
        orientation="vertical"
        className="w-full flex-row mt-8 gap-4 rounded-none px-1 py-0 text-foreground"
      >
        <div className="p-2 border h-fit">
          <TabsList className="flex-col w-60 h-full gap-2 bg-background">
            <TabsTrigger
              value="profile"
              className="w-full min-h-10 justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <User size={5} className="mr-1" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="w-full min-h-10 justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Shield className="mr-1" />
              Security
            </TabsTrigger>
            <TabsTrigger
              value="sessions"
              className="w-full min-h-10 justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Settings className="mr-1" />
              Sessions
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="grow rounded-md border text-start p-4">
          <TabsContent value="profile">
            <ProfileTab user={user} onUserUpdate={handleUserUpdate} />
          </TabsContent>

          <TabsContent value="security">
            <SecurityTab />
          </TabsContent>

          <TabsContent value="sessions">
            <SessionsTab
              sessions={sessions}
              onSessionsUpdate={handleSessionsUpdate}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
