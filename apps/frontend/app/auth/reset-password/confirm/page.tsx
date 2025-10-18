import { ResetPasswordConfirmForm } from "@/components/forms";
import { Metadata, NextPage } from "next";

interface ResetPasswordConfirmPageProps {
  // Add your page props here
}

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Enter your new password to complete the reset process",
};

const ResetPasswordConfirmPage: NextPage<ResetPasswordConfirmPageProps> = (
  props
) => {
  return <ResetPasswordConfirmForm />;
};

export default ResetPasswordConfirmPage;
