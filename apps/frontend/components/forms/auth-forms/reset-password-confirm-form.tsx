"use client";

import { FC } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import AppButton from "@/components/app-ui/button";
import PasswordInput from "@/components/app-ui/password-input";

// Auth schemas
const ResetPasswordConfirmSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordConfirmType = z.infer<typeof ResetPasswordConfirmSchema>;

enum ResetStatus {
  IDLE = "idle",
  LOADING = "loading",
  SUCCESS = "success",
  ERROR = "error",
}

interface ResetPasswordConfirmFormProps {
  // Add your props here
  children?: React.ReactNode;
}

const ResetPasswordConfirmForm: FC<ResetPasswordConfirmFormProps> = ({
  children,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<ResetStatus>(ResetStatus.IDLE);
  const [error, setError] = useState<string | null>(null);

  // Form for confirming password reset
  const form = useForm<ResetPasswordConfirmType>({
    resolver: zodResolver(ResetPasswordConfirmSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const {
    formState: { isSubmitting },
  } = form;

  async function onSubmit(values: ResetPasswordConfirmType) {
    if (!token) {
      setStatus(ResetStatus.ERROR);
      setError("Reset token is missing. Please request a new password reset.");
      return;
    }

    try {
      setStatus(ResetStatus.LOADING);

      const { data, error: authError } = await authClient.resetPassword({
        newPassword: values.password,
        token: token,
      });

      if (authError) {
        setStatus(ResetStatus.ERROR);
        setError(authError.message || "Failed to reset password");
        console.log("Auth error", authError);
      } else {
        setStatus(ResetStatus.SUCCESS);
        console.log("Auth response", data);
        // Redirect after 3 seconds
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      }
    } catch (error) {
      setStatus(ResetStatus.ERROR);
      setError("An unexpected error occurred. Please try again.");
      console.error(error);
    }
  }

  // Show loading state
  if (status === ResetStatus.LOADING) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Resetting Password
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-center text-muted-foreground">
              Please wait while we reset your password...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show success state
  if (status === ResetStatus.SUCCESS) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Password Reset Successful
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <p className="text-center text-muted-foreground">
              Your password has been reset successfully. You can now sign in
              with your new password.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-center text-sm text-muted-foreground">
            Redirecting to sign in...{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Click here if not redirected
            </Link>
          </p>
        </CardFooter>
      </Card>
    );
  }

  // Show error state
  if (status === ResetStatus.ERROR) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Password Reset Failed
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full bg-red-100 p-3">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <p className="text-center text-destructive">{error}</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <AppButton
            variant="outline"
            onClick={() => router.push("/auth/reset-password")}
          >
            Request New Reset Link
          </AppButton>
          <p className="text-center text-sm text-muted-foreground">
            Or{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              back to sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    );
  }

  // Show form (idle state)
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Reset Password
        </CardTitle>
        <CardDescription className="text-center">
          Enter your new password below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <PasswordInput disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <PasswordInput disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <AppButton type="submit" buttonWidth="full" disabled={isSubmitting}>
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </AppButton>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link href="/auth/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default ResetPasswordConfirmForm;
