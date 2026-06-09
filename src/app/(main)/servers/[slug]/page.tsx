import { redirect } from "next/navigation";

export default function ServersSlugRedirect({ params }: { params: { slug: string } }) {
  redirect(`/server/${params.slug}`);
}
