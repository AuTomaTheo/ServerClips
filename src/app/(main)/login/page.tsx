import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <div className="app-card p-6">
        <h1 className="text-xl font-bold text-white">Welcome back</h1>
        <p className="mb-6 mt-2 text-sm text-zinc-400">
          Log in to like, comment, and manage listings.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
