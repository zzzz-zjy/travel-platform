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
