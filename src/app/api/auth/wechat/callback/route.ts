import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SignJWT } from "jose";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=wechat_denied", request.url));
  }

  // Exchange code for access token
  const appId = process.env.WECHAT_APP_ID!;
  const appSecret = process.env.WECHAT_APP_SECRET!;
  const tokenRes = await fetch(
    `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${appSecret}&code=${code}&grant_type=authorization_code`
  );
  const tokenData = await tokenRes.json();

  if (tokenData.errcode) {
    console.error("WeChat token error:", tokenData);
    return NextResponse.redirect(new URL("/login?error=wechat_token", request.url));
  }

  // Get user info
  const userRes = await fetch(
    `https://api.weixin.qq.com/sns/userinfo?access_token=${tokenData.access_token}&openid=${tokenData.openid}`
  );
  const userData = await userRes.json();

  if (userData.errcode) {
    console.error("WeChat userinfo error:", userData);
    return NextResponse.redirect(new URL("/login?error=wechat_userinfo", request.url));
  }

  // Find or create user
  let user = await prisma.user.findFirst({
    where: {
      accounts: {
        some: {
          provider: "wechat",
          providerAccountId: userData.openid,
        },
      },
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: userData.nickname,
        image: userData.headimgurl,
        accounts: {
          create: {
            type: "oauth",
            provider: "wechat",
            providerAccountId: userData.openid,
          },
        },
      },
    });
  }

  // Create JWT token using jose
  const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);
  const token = await new SignJWT({
    sub: user.id,
    name: user.name,
    picture: user.image,
    id: user.id,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  // Set session cookie and redirect
  const resp = NextResponse.redirect(new URL("/my", request.url));
  resp.cookies.set("authjs.session-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  });

  return resp;
}
