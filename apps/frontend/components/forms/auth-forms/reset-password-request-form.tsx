"use client";

import { FC } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { z } from "zod";

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

// Auth schemas
const ResetPasswordRequestSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ResetPasswordRequestType = z.infer<typeof ResetPasswordRequestSchema>;

interface ResetPasswordRequestFormProps {
  // Add your props here
  children?: React.ReactNode;
}

const ResetPasswordRequestForm: FC<ResetPasswordRequestFormProps> = ({
  children,
}) => {
  // Form for requesting password reset
  const form = useForm<ResetPasswordRequestType>({
    resolver: zodResolver(ResetPasswordRequestSchema),
    defaultValues: {
      email: "",
    },
  });

  const {
    formState: { isSubmitting, isSubmitSuccessful },
    setError,
  } = form;

  // Handle request password reset form submission
  async function onSubmit(values: ResetPasswordRequestType) {
    try {
      // Using the requestPasswordReset method from better-auth
      const response = await authClient.requestPasswordReset({
        email: values.email,
      });

      if (response.error) {
        setError("root.apiError", {
          message: response.error.message || "Failed to send reset email",
        });
      } else {
        form.reset();
      }
    } catch (error) {
      setError("root.apiError", {
        message: "An unexpected error occurred. Please try again.",
      });
      console.error(error);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
        <CardDescription>
          Enter your email address and we will send you a link to reset your
          password
        </CardDescription>
      </CardHeader>
      <CardContent>
        {form.formState.errors.root?.apiError && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">
            {form.formState.errors.root.apiError.message}
          </div>
        )}
        {isSubmitSuccessful && (
          <div className="bg-green-100 text-green-800 text-sm p-3 rounded-md mb-4">
            Password reset link has been sent to your email address. Please
            check your inbox and follow the instructions.
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="email@example.com"
                      type="email"
                      autoComplete="email"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <AppButton type="submit" buttonWidth="full" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </AppButton>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-center w-full text-muted-foreground">
          Remember your password?{" "}
          <Link
            href="/auth/login"
            className="text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ResetPasswordRequestForm;
