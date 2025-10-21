"use client";

import { useState } from "react";
import {
  Settings,
  Smartphone,
  Monitor,
  MapPin,
  Trash2,
  LogOut,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
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
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import AppButton from "@/components/app-ui/button";
import {
  revokeSession,
  revokeAllOtherSessions,
  formatDate,
  signOut,
} from "../actions";
import type { Session } from "../actions/types";

interface SessionsTabProps {
  sessions: Session[];
  onSessionsUpdate: () => void;
}

export default function SessionsTab({
  sessions,
  onSessionsUpdate,
}: SessionsTabProps) {
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(
    null
  );
  const [showRevokeAllDialog, setShowRevokeAllDialog] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  /**
   * Gets the appropriate device icon based on user agent
   */
  const getDeviceIcon = (userAgent?: string) => {
    if (!userAgent) return <Monitor className="h-4 w-4" />;
    if (userAgent.includes("Mobile")) return <Smartphone className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  /**
   * Gets device type string for display
   */
  const getDeviceType = (userAgent?: string) => {
    if (!userAgent) return "Unknown Device";
    if (userAgent.includes("Mobile")) return "Mobile Device";
    if (userAgent.includes("Chrome")) return "Desktop Browser";
    return "Desktop Browser";
  };

  /**
   * Gets browser name from user agent
   */
  const getBrowserName = (userAgent?: string) => {
    if (!userAgent) return "Unknown Browser";
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    return "Unknown Browser";
  };

  /**
   * Handles revoking a specific session
   */
  const handleRevokeSession = async (sessionId: string) => {
    setRevokingSessionId(sessionId);
    const success = await revokeSession(sessionId);

    if (success) {
      onSessionsUpdate();
    }

    setRevokingSessionId(null);
  };

  /**
   * Handles revoking all other sessions
   */
  const handleRevokeAllSessions = async () => {
    const success = await revokeAllOtherSessions();

    if (success) {
      onSessionsUpdate();
    }

    setShowRevokeAllDialog(false);
  };

  /**
   * Handles user sign out with confirmation
   */
  const handleSignOut = async () => {
    await signOut();
    setShowSignOutDialog(false);
  };

  /**
   * Determines if a session is the current session
   */
  const isCurrentSession = (session: Session) => {
    // This is a simplified check - in a real app, you'd compare with current session token
    return sessions && sessions.length > 0 && session.id === sessions[0]?.id;
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Active Sessions
          </CardTitle>
          <CardDescription>
            Manage your active sessions across different devices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No active sessions found
            </p>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {sessions.length} active session
                  {sessions.length !== 1 ? "s" : ""}
                </p>
                {sessions.length > 1 && (
                  <AlertDialog
                    open={showRevokeAllDialog}
                    onOpenChange={setShowRevokeAllDialog}
                  >
                    <AlertDialogTrigger asChild>
                      <AppButton variant="outline">
                        Revoke All Other Sessions
                      </AppButton>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Revoke All Other Sessions
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will sign you out of all other devices and
                          sessions. You will remain signed in on this device.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleRevokeAllSessions}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Revoke All Sessions
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>

              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {getDeviceIcon(session.userAgent || undefined)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">
                            {getDeviceType(session.userAgent || undefined)}
                          </p>
                          {isCurrentSession(session) && (
                            <Badge variant="default" className="text-xs">
                              Current Session
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            {getBrowserName(session.userAgent || undefined)}
                          </span>
                          {session.ipAddress && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{session.ipAddress}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Last active: {formatDate(session.updatedAt)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Expires: {formatDate(session.expiresAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isCurrentSession(session) && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={revokingSessionId === session.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Revoke Session
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to revoke this session?
                                The device will be signed out immediately.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRevokeSession(session.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Revoke Session
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <div className="flex flex-row  items-center justify-between gap-4 px-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 font-semibold">
              <LogOut className="h-4 w-4" />
              <span className="">Sign Out</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Sign out of your active session.
            </p>
          </div>
          <div className="flex justify-end">
            <AlertDialog
              open={showSignOutDialog}
              onOpenChange={setShowSignOutDialog}
            >
              <AlertDialogTrigger asChild>
                <AppButton
                  variant="destructive"
                  icon={LogOut}
                  iconPosition="left"
                >
                  Sign Out
                </AppButton>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sign Out</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to sign out? You will be redirected to
                    the login page.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleSignOut}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Sign Out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </Card>
    </div>
  );
}
