import { ServerSubmissionForm } from "@/components/servers/server-submission-form";
import type { ServerSubmissionInput } from "@/lib/validators/server-submission";

interface ListingFormProps {
  defaultValues?: Partial<ServerSubmissionInput>;
  listingId?: string;
  mode: "create" | "edit";
}

export function ListingForm({ listingId, mode, defaultValues }: ListingFormProps) {
  return (
    <ServerSubmissionForm
      serverId={listingId}
      mode={mode === "create" ? "studio-create" : "edit"}
      defaultValues={defaultValues}
      redirectTo="/studio"
    />
  );
}
