import { requireCreator } from "@/lib/auth/session";
import { ListingForm } from "@/components/servers/listing-form";

export const metadata = { title: "New Server Profile" };

export default async function NewServerPage() {
  await requireCreator();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="app-card p-6">
        <h1 className="mb-2 text-xl font-bold text-white">Create server profile</h1>
        <p className="mb-6 text-sm text-zinc-400">
          Server profiles require admin approval. Upload videos separately.
        </p>
        <ListingForm mode="create" />
      </div>
    </div>
  );
}
