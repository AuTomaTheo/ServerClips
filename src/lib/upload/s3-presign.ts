import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getS3PublicUrl, isS3Configured } from "@/lib/upload/s3";

function getS3ClientForPresign(): S3Client | null {
  const region = process.env.S3_REGION;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  const endpoint = process.env.S3_ENDPOINT;

  if (!isS3Configured() || !region || !accessKeyId || !secretAccessKey) {
    return null;
  }

  return new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
    ...(endpoint
      ? { endpoint, forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true" }
      : {}),
  });
}

export async function createPresignedUpload(params: {
  key: string;
  contentType: string;
}): Promise<{ uploadUrl: string; publicUrl: string; key: string } | null> {
  const client = getS3ClientForPresign();
  const bucket = process.env.S3_BUCKET;
  if (!client || !bucket) return null;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: params.key,
    ContentType: params.contentType,
    CacheControl: "public, max-age=31536000, immutable",
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 3600 });

  return {
    uploadUrl,
    publicUrl: getS3PublicUrl(params.key),
    key: params.key,
  };
}
