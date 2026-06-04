import { prisma } from "./prisma";

export async function checkRateLimit(
  ip: string,
  dailyLimit: number = 5,
): Promise<{ allowed: boolean; remaining: number }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let record = await prisma.rateLimit.findUnique({
    where: { ipDate: { ip, date: today } },
  });

  if (!record) {
    record = await prisma.rateLimit.create({
      data: { ip, date: today, count: 0 },
    });
  }

  const remaining = dailyLimit - record.count;

  if (remaining <= 0) {
    return { allowed: false, remaining: 0 };
  }

  await prisma.rateLimit.update({
    where: { id: record.id },
    data: { count: { increment: 1 } },
  });

  return { allowed: true, remaining: remaining - 1 };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "127.0.0.1";
}
