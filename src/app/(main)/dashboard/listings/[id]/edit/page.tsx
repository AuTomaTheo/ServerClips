import { redirect } from "next/navigation";

export default function EditListingRedirect({ params }: { params: { id: string } }) {
  redirect(`/creator/servers/${params.id}/edit`);
}
