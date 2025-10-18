import { ResetPasswordRequestForm } from "@/components/forms";
import { Metadata, NextPage } from "next";

interface ResetPasswordPageProps {
  // Add your page props here
}

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Request a password reset link for your account",
};

const ResetPasswordPage: NextPage<ResetPasswordPageProps> = (props) => {
  return <ResetPasswordRequestForm />;
};

export default ResetPasswordPage;