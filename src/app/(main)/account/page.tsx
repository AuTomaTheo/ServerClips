import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Metin2Frame } from "@/components/metin2/metin2-frame";
import { Metin2Button } from "@/components/metin2/metin2-button";
import { Metin2Badge } from "@/components/metin2/metin2-badge";
import { SignOutButton } from "@/components/auth/sign-out-button";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { user } = session;
  const isCreator = ["CREATOR", "MODERATOR", "ADMIN"].includes(user.role);
  const isStaff = ["MODERATOR", "ADMIN"].includes(user.role);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <Metin2Frame title="Your Account">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-[#6b5a40]">Display name</p>
            <p className="font-medium text-[#3d2814]">{user.displayName ?? user.name ?? "—"}</p>
          </div>
          {user.username && (
            <div>
              <p className="text-sm text-[#6b5a40]">Profile</p>
              <Link href={`/u/${user.username}`} className="font-medium text-metin2-red hover:underline">
                @{user.username}
              </Link>
            </div>
          )}
          <div>
            <p className="text-sm text-[#6b5a40]">Email</p>
            <p className="font-medium text-[#3d2814]">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-[#6b5a40]">Role</p>
            <Metin2Badge
              variant={
                user.role === "ADMIN" ? "red" : user.role === "CREATOR" ? "gold" : "default"
              }
            >
              {user.role}
            </Metin2Badge>
          </div>

          <div className="flex flex-wrap gap-2 pt-4">
            <Metin2Button href="/account/edit" variant="gold">
              Edit profile
            </Metin2Button>
            {isCreator && (
              <>
                <Metin2Button href="/studio" variant="ghost">
                  Studio
                </Metin2Button>
                <Metin2Button href="/server-dashboard" variant="ghost">
                  Server dashboard
                </Metin2Button>
              </>
            )}
            {isStaff && (
              <Metin2Button href="/admin" variant="ghost">
                Admin
              </Metin2Button>
            )}
            <Metin2Button href="/" variant="ghost">
              Back to Feed
            </Metin2Button>
            <SignOutButton />
          </div>
        </div>
      </Metin2Frame>
    </div>
  );
}
