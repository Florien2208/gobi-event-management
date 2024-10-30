// lib/session.js
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const SESSION_COOKIE = "session";

export async function createSession(userId) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);

  return token;
}

export async function getSession() {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE);

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token.value, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function verifyAuth() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}
