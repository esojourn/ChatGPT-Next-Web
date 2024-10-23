import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { S3Client } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { getServerSideConfig } from "../../config/server";

export async function POST(request: Request) {
  const { filename, contentType } = await request.json();
  // 取得文件名扩展
  const fileExtension = filename.split(".").pop();
  const fileKey = uuidv4() + "." + fileExtension;

  try {
    const serverConfig = getServerSideConfig();
    const client = new S3Client({ region: serverConfig.aws_default_region });
    const { url, fields } = await createPresignedPost(client, {
      Bucket: serverConfig.aws_bucket_name,
      Key: fileKey,
      Conditions: [
        ["content-length-range", 0, 10485760], // up to 10 MB
        ["starts-with", "$Content-Type", contentType],
      ],
      Fields: {
        // acl: "public-read",
        "Content-Type": contentType,
      },
      Expires: 600, // Seconds before the presigned post expires. 3600 by default.
    });

    return Response.json({ url, fields, fileKey });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message });
  }
}
