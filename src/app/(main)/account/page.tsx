import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const metadata = { title: "Profile" };

export default async function AccountPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const username = session.user.username;
  if (!username) {
    redirect("/account/edit");
  }

  const tab = searchParams.tab;
  redirect(tab ? `/u/${username}?tab=${tab}` : `/u/${username}`);
}
