import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { PUBLIC_SAMPLE_VIDEO_URLS, videoUrlForPlayback } from "../src/lib/media-url";

async function main() {
  const videos = await prisma.video.findMany({
    select: { id: true, title: true, videoUrl: true },
  });

  let updated = 0;
  for (let i = 0; i < videos.length; i++) {
    const video = videos[i];
    const resolved = videoUrlForPlayback(video.videoUrl);
    const canonical =
      video.videoUrl.startsWith("/videos/sample") && resolved
        ? PUBLIC_SAMPLE_VIDEO_URLS[i % PUBLIC_SAMPLE_VIDEO_URLS.length]
        : resolved;

    if (canonical && canonical !== video.videoUrl && canonical.startsWith("http")) {
      await prisma.video.update({
        where: { id: video.id },
        data: { videoUrl: canonical },
      });
      console.log(`Fixed: ${video.title}`);
      updated++;
    }
  }

  console.log(`Done. Updated ${updated} video(s).`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
