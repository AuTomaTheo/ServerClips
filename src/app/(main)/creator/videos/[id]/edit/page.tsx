import { redirect } from "next/navigation";

export default function CreatorVideoEditRedirect({ params }: { params: { id: string } }) {
  redirect(`/studio/videos/${params.id}/edit`);
}
