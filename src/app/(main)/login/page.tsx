import { LoginForm } from "@/components/auth/login-form";
import { Metin2Frame } from "@/components/metin2/metin2-frame";

export const metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <Metin2Frame title="Welcome back">
        <p className="mb-4 text-sm text-[#4a3020]">
          Log in to like, comment, and manage listings.
        </p>
        <LoginForm />
      </Metin2Frame>
    </div>
  );
}
