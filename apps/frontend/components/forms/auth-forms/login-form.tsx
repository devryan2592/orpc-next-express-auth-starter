"use client";

import { FC, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";

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
import Link from "next/link";

interface LoginFormProps {
  // Add your props here
  children?: React.ReactNode;
}

// Auth Schema
const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

type LoginFormInput = z.infer<typeof LoginSchema>;

const LoginForm: FC<LoginFormProps> = ({ children }) => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "test@test.com",
      password: "testing@123",
    },
  });

  const {
    formState: { isSubmitting, errors },
    setError,
  } = form;

  async function onSubmit(data: LoginFormInput) {
    try {
      const response = await authClient.signIn.email(data);

      if (response.error) {
        toast.error(response.error.message || "Invalid email or password");
        setError("root.apiError", {
          message: response.error.message || "Invalid email or password",
        });
      } else {
        toast.success("Successfully signed in! Welcome back.");

        // Redirect to dashboard after 3000ms delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      setError("root.apiError", {
        message: "An error occurred. Please try again.",
      });
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  console.log(errors);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="">
        <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {form.formState.errors.root?.apiError && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">
            {form.formState.errors.root.apiError.message}
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 ">
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                  <div className="flex justify-end ">
                    <Link
                      href="/auth/reset-password"
                      className="text-sm text-muted-foreground hover:text-primary duration-200 transition-colors"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                </FormItem>
              )}
            />
            <AppButton
              type="submit"
              buttonWidth="full"
              loading={isSubmitting}
              loadingText="Signing in..."
            >
              Sign In
            </AppButton>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-center text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/register"
            className="text-primary underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
