import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { phone, code, email, password } = await request.json();

  let user: any = null;

  if (phone) {
    if (code !== "1234") {
      return NextResponse.json({ error: "验证码错误" }, { status: 401 });
    }
    user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({
        data: { phone, name: `用户${phone.slice(-4)}` },
      });
    }
  } else if (email) {
    user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "用户不存在" }, { status: 401 });
  } else {
    return NextResponse.json({ error: "缺少参数" }, { status: 400 });
  }

  const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);
  const token = await new SignJWT({ id: user.id, name: user.name, phone: user.phone })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  return NextResponse.json({
    token,
    user: { id: user.id, name: user.name, phone: user.phone, email: user.email },
  });
}
