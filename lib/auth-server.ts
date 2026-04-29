import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const SECRET = process.env.NEXTAUTH_SECRET || "luxsilver-saas-secret";

export interface SessionUser {
  id: string;
  email: string;
  name?: string;
  role: "user" | "admin";
}

export function signToken(payload: SessionUser) {
  return jwt.sign(payload, SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, SECRET) as SessionUser;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const c = await cookies();
  const token = c.get("lux-session")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setSessionCookie(user: SessionUser) {
  const token = signToken(user);
  const c = await cookies();
  c.set("lux-session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie() {
  const c = await cookies();
  c.delete("lux-session");
}

export function isAdminCreds(email: string, password: string) {
  const adminEmail = process.env.ADMIN_EMAIL || "grwmspace@gmail.com";
  const adminPass = process.env.ADMIN_PASSWORD || "Password@123";
  return email.trim().toLowerCase() === adminEmail.toLowerCase() && password === adminPass;
}
