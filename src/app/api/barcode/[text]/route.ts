import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { z } from "zod";

export const runtime = "nodejs";

const paramsSchema = z.object({
  text: z
    .string()
    .min(1)
    .max(64)
    // conservative allowlist for URL path segment
    .regex(/^[a-zA-Z0-9_-]+$/),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ text: string }> },
) {
  const resolved = await params;
  const parsed = paramsSchema.safeParse({ text: resolved.text });
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Parameter tidak valid." }, { status: 400 });
  }

  const png = await QRCode.toBuffer(parsed.data.text, {
    type: "png",
    width: 320,
    margin: 1,
    errorCorrectionLevel: "M",
  });

  const body = new Uint8Array(png);

  return new NextResponse(body, {
    headers: {
      "content-type": "image/png",
      "cache-control": "public, max-age=3600",
    },
  });
}

