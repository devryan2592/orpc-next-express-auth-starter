import { Suspense } from "react";
import Link from "next/link";
import UpdatePasswordForm from "@/components/forms/auth-forms/update-password-form";

interface UpdatePasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

async function UpdatePasswordPage({ searchParams }: UpdatePasswordPageProps) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Invalid Reset Link
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              The password reset link is invalid or has expired. Please request
              a new one.
            </p>
          </div>
          <div className="flex flex-col space-y-3 mt-6">
            <Link
              href="/auth/reset-password"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md text-sm font-medium text-center transition-colors"
            >
              Request New Reset Link
            </Link>
            <Link
              href="/auth/login"
              className="w-full border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 rounded-md text-sm font-medium text-center transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UpdatePasswordForm token={token} />
    </Suspense>
  );
}

export default UpdatePasswordPage;
