import { RegisterForm } from "@/components/forms";
import { Metadata, NextPage } from "next";

interface RegisterPageProps {
  // Add your page props here
}

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your account to get started",
};

const RegisterPage: NextPage<RegisterPageProps> = (props) => {
  return <RegisterForm />;
};

export default RegisterPage;
