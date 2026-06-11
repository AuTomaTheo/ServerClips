export function Metin2LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="app-card p-6 sm:p-8">
        <h1 className="mb-6 text-2xl font-bold text-white">{title}</h1>
        <div className="space-y-4 text-sm leading-relaxed text-zinc-400 [&_h2]:mt-6 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-zinc-200 [&_a]:text-red-400 [&_a]:hover:underline [&_li]:ml-4 [&_ul]:list-disc [&_ul]:space-y-1">
          {children}
        </div>
      </div>
    </div>
  );
}
