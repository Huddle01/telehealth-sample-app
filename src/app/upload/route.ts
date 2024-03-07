import * as fs from "fs";
import { SpheronClient, ProtocolEnum } from "@spheron/storage";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const data = await request.formData();
  const { searchParams } = new URL(request.url);
  const fileName = searchParams.get("fileName");

  if (!fileName) {
    return new Response("Missing fileName", { status: 400 });
  }

  const fileBlob = data.get("file") as Blob | null;

  if (!fileBlob) {
    return new Response("Missing file", { status: 400 });
  }

  const buffer = Buffer.from(await fileBlob.arrayBuffer());

  const tempPath = `/tmp/${fileName}`;

  fs.writeFileSync(tempPath, buffer);

  const client = new SpheronClient({
    token: process.env.SPHERON_TOKEN as string,
  });

  const { protocolLink } = await client.upload(tempPath, {
    protocol: ProtocolEnum.IPFS,
    name: fileName,
    onUploadInitiated: (uploadId: string) => {
      console.log(`Upload initiated with ID ${uploadId}`);
    },
  });

  fs.unlinkSync(tempPath);

  return new Response(`${protocolLink}/${fileName}`, {
    status: 200,
  });
}
