"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
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
import PasswordInput from "@/components/app-ui/password-input";
import { changePassword } from "../actions";

// Password change validation schema
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function SecurityTab() {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingPasswordData, setPendingPasswordData] = useState<PasswordFormData | null>(null);

  // Password form setup
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  /**
   * Handles password change form submission with confirmation
   */
  const handlePasswordSubmit = (data: PasswordFormData) => {
    setPendingPasswordData(data);
    setShowConfirmDialog(true);
  };

  /**
   * Confirms and executes the password change
   */
  const handleConfirmPasswordChange = async () => {
    if (!pendingPasswordData) return;

    const success = await changePassword({
      currentPassword: pendingPasswordData.currentPassword,
      newPassword: pendingPasswordData.newPassword,
    });

    if (success) {
      passwordForm.reset();
    }

    setShowConfirmDialog(false);
    setPendingPasswordData(null);
  };

  /**
   * Cancels the password change confirmation
   */
  const handleCancelPasswordChange = () => {
    setShowConfirmDialog(false);
    setPendingPasswordData(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Change Password
        </CardTitle>
        <CardDescription>
          Update your password to keep your account secure
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...passwordForm}>
          <form
            onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
            className="space-y-4"
          >
            <FormField
              control={passwordForm.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <PasswordInput 
                      {...field} 
                      placeholder="Enter your current password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={passwordForm.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <PasswordInput 
                      {...field} 
                      placeholder="Enter your new password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={passwordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <PasswordInput 
                      {...field} 
                      placeholder="Confirm your new password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <AppButton
              type="submit"
              icon={Shield}
              iconPosition="left"
              loading={passwordForm.formState.isSubmitting}
              loadingText="Validating..."
              className="flex items-center gap-2"
            >
              Change Password
            </AppButton>
          </form>
        </Form>

        {/* Password Change Confirmation Dialog */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Password Change</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to change your password? This action will log you out of all other devices and sessions.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancelPasswordChange}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmPasswordChange}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Change Password
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}