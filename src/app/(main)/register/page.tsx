import { RegisterForm } from "@/components/auth/register-form";
import { Metin2Frame } from "@/components/metin2/metin2-frame";

export const metadata = { title: "Sign up" };

export default function RegisterPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <Metin2Frame title="Create an account">
        <p className="mb-4 text-sm text-[#4a3020]">
          Join ServerClips to discover and engage with server communities.
        </p>
        <RegisterForm />
      </Metin2Frame>
    </div>
  );
}
