import { NextRequest, NextResponse } from "next/server";
import { storeVerificationCode } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { phone } = await request.json();
  if (!phone) return NextResponse.json({ error: "手机号不能为空" }, { status: 400 });

  // Dev mode: always use code "1234"
  const code = "1234";
  storeVerificationCode(phone, code);

  console.log(`[DEV SMS] Phone: ${phone}, Code: ${code}`);

  // In production: send SMS via service provider
  // await sendSMS(phone, code);

  return NextResponse.json({ success: true, message: "验证码已发送（开发模式：1234）" });
}
