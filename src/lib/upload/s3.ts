import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
type UploadKind = "image" | "video";

function getS3Client() {
  const region = process.env.S3_REGION;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  const endpoint = process.env.S3_ENDPOINT;

  if (!region || !accessKeyId || !secretAccessKey || !process.env.S3_BUCKET) {
    return null;
  }

  return new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
    ...(endpoint ? { endpoint, forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true" } : {}),
  });
}

export function isS3Configured(): boolean {
  return !!(
    process.env.S3_BUCKET &&
    process.env.S3_REGION &&
    process.env.S3_ACCESS_KEY_ID &&
    process.env.S3_SECRET_ACCESS_KEY
  );
}

export function getS3PublicUrl(key: string): string {
  const bucket = process.env.S3_BUCKET!;
  const publicBase =
    process.env.S3_PUBLIC_URL?.replace(/\/$/, "") ??
    (process.env.S3_ENDPOINT
      ? `${process.env.S3_ENDPOINT.replace(/\/$/, "")}/${bucket}`
      : `https://${bucket}.s3.${process.env.S3_REGION}.amazonaws.com`);

  return `${publicBase}/${key}`;
}

export async function uploadToS3(
  file: File,
  kind: UploadKind,
  key: string
): Promise<{ url: string; key: string }> {
  const client = getS3Client();
  const bucket = process.env.S3_BUCKET;
  if (!client || !bucket) {
    throw new Error("Object storage is not configured");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return { url: getS3PublicUrl(key), key };
}
