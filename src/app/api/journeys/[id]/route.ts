import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const journey = await prisma.journey.findUnique({
    where: { id: parseInt(id) },
  });

  if (!journey) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ journey });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const journey = await prisma.journey.update({
    where: { id: parseInt(id) },
    data: { rawJson: body.rawJson },
  });
  return Response.json({ id: journey.id });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.journey.delete({ where: { id: parseInt(id) } });
  return Response.json({ ok: true });
}
