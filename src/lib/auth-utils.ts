import { jwtVerify } from "jose";

export async function getUserFromRequest(request: Request): Promise<{ id: string; name: string; phone?: string } | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    return { id: payload.id as string, name: payload.name as string, phone: payload.phone as string };
  } catch {
    return null;
  }
}
