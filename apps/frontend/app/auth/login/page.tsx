import { LoginForm } from "@/components/forms";
import { Metadata, NextPage } from "next";

interface LoginPageProps {
  // Add your page props here
}

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your account",
};

const LoginPage: NextPage<LoginPageProps> = (props) => {
  return <LoginForm />;
};

export default LoginPage;
