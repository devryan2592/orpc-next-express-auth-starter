import { VerifyEmailForm } from "@/components/forms";
import { Metadata, NextPage } from "next";

interface VerifyEmailPageProps {
  // Add your page props here
}

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your email address to complete registration",
};

const VerifyEmailPage: NextPage<VerifyEmailPageProps> = (props) => {
  return <VerifyEmailForm />;
};

export default VerifyEmailPage;