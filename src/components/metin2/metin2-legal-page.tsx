import { Metin2Frame } from "@/components/metin2/metin2-frame";

export function Metin2LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Metin2Frame title={title}>
        <div className="metin2-prose space-y-4">{children}</div>
      </Metin2Frame>
    </div>
  );
}
