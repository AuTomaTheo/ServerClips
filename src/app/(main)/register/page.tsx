import { RegisterForm } from "@/components/auth/register-form";

export const metadata = { title: "Sign up" };

export default function RegisterPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <div className="app-card p-6">
        <h1 className="text-xl font-bold text-white">Create account</h1>
        <p className="mb-6 mt-2 text-sm text-zinc-400">
          Join ServerClips to discover servers and share promo clips.
        </p>
        <RegisterForm />
      </div>
    </div>
  );
}
