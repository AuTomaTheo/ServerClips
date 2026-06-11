import { mediaUrlForDisplay } from "@/lib/media-url";
import { cn } from "@/lib/utils";

/** Use native img for uploaded media — avoids next/image turning /uploads into //uploads. */
export function ServerMediaImage({
  src,
  alt,
  className,
  priority,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const url = mediaUrlForDisplay(src);
  if (!url) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      className={cn("h-full w-full object-cover", className)}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
