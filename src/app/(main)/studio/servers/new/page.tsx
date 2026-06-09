import { requireCreator } from "@/lib/auth/session";
import { ListingForm } from "@/components/servers/listing-form";
import { Metin2Frame } from "@/components/metin2/metin2-frame";

export const metadata = { title: "New Server Profile" };

export default async function NewServerPage() {
  await requireCreator();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Metin2Frame title="Create server profile">
        <p className="mb-4 text-sm text-[#4a3020]">Server profiles require admin approval. Upload videos separately.</p>
        <ListingForm mode="create" />
      </Metin2Frame>
    </div>
  );
}
