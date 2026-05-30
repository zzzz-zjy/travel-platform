import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const appId = process.env.WECHAT_APP_ID!;
  const baseUrl = process.env.WECHAT_REDIRECT_URL || request.nextUrl.origin;
  const redirectUri = encodeURIComponent(
    `${baseUrl}/api/auth/wechat/callback`
  );
  const state = Math.random().toString(36).substring(2, 15);
  const url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_userinfo&state=${state}#wechat_redirect`;

  const resp = NextResponse.redirect(url);
  resp.cookies.set("wechat_state", state, { httpOnly: true, maxAge: 600 });
  return resp;
}
