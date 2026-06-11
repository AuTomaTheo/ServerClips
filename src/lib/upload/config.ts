import { isS3Configured } from "@/lib/upload/s3";

export function isUploadThingConfigured(): boolean {
  return !!process.env.UPLOADTHING_TOKEN;
}

export function isObjectStorageConfigured(): boolean {
  return isS3Configured() || isUploadThingConfigured();
}
