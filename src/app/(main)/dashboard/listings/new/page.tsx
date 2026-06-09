import { redirect } from "next/navigation";

export default function NewListingRedirect() {
  redirect("/creator/servers/new");
}
