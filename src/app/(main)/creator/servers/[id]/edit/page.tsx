import { redirect } from "next/navigation";

export default function CreatorServerEditRedirect({ params }: { params: { id: string } }) {
  redirect(`/studio/servers/${params.id}/edit`);
}
