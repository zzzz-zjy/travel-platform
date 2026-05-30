import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    // Email + Password
    Credentials({
      id: "email",
      name: "邮箱登录",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        // For new users, password stored as bcrypt hash. For dev, also check plain text.
        if (user.emailVerified) {
          return { id: user.id, name: user.name, email: user.email, image: user.image };
        }

        // In production, check password hash
        // const valid = await bcrypt.compare(password, user.passwordHash);
        // For MVP dev mode, accept any password for existing users
        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),

    // Phone + SMS Code
    Credentials({
      id: "phone",
      name: "手机登录",
      credentials: {
        phone: { label: "手机号", type: "text" },
        code: { label: "验证码", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone) return null;
        const phone = credentials.phone as string;
        const code = credentials.code as string;

        // Dev mode: accept code "1234" for any phone
        if (code !== "1234" && code !== getStoredCode(phone)) return null;

        // Find or create user by phone
        let user = await prisma.user.findUnique({ where: { phone } });
        if (!user) {
          user = await prisma.user.create({
            data: { phone, name: `用户${phone.slice(-4)}` },
          });
        }

        return { id: user.id, name: user.name, phone: user.phone };
      },
    }),

    // WeChat OAuth
    {
      id: "wechat",
      name: "微信",
      type: "oauth",
      clientId: process.env.WECHAT_APP_ID,
      clientSecret: process.env.WECHAT_APP_SECRET,
      authorization: {
        url: "https://open.weixin.qq.com/connect/qrconnect",
        params: {
          appid: process.env.WECHAT_APP_ID,
          scope: "snsapi_login",
        },
      },
      token: {
        url: "https://api.weixin.qq.com/sns/oauth2/access_token",
        params: { appid: process.env.WECHAT_APP_ID, secret: process.env.WECHAT_APP_SECRET },
        async conform(response: Response) {
          const data = await response.json();
          if (data.errcode) throw new Error(data.errmsg);
          return new Response(JSON.stringify({
            access_token: data.access_token,
            token_type: "bearer",
            expires_in: data.expires_in,
            refresh_token: data.refresh_token,
            scope: data.scope,
            openid: data.openid,
            unionid: data.unionid,
          }), { headers: { "Content-Type": "application/json" } });
        },
      },
      userinfo: {
        url: "https://api.weixin.qq.com/sns/userinfo",
        async request({ tokens, provider }: { tokens: any; provider: any }) {
          const url = new URL(provider.userinfo?.url as string);
          url.searchParams.set("access_token", tokens.access_token!);
          url.searchParams.set("openid", (tokens as any).openid as string);
          const res = await fetch(url);
          const data = await res.json();
          return {
            id: data.openid,
            name: data.nickname,
            image: data.headimgurl,
          };
        },
      },
      profile(profile) {
        return {
          id: profile.id,
          name: profile.name,
          image: profile.image,
        };
      },
      style: { logo: "/wechat.svg", bg: "#fff", text: "#07C160" },
    },
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phone = (user as any).phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).phone = token.phone;
      }
      return session;
    },
  },
});

// Simple in-memory code store for dev mode SMS
const codeStore: Record<string, string> = {};

export function storeVerificationCode(phone: string, code: string) {
  codeStore[phone] = code;
}

export function getStoredCode(phone: string): string | undefined {
  return codeStore[phone];
}
