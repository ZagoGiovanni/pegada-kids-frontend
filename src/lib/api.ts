export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:3333";

type SessionKind = "admin" | "cliente";

const tokenKeys: Record<SessionKind, string> = {
  admin: "pegada_kids_admin_token",
  cliente: "pegada_kids_cliente_token",
};

export function getAuthToken(kind: SessionKind) {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(tokenKeys[kind]);
}

export async function apiFetch(
  path: string,
  init: RequestInit = {},
  authenticatedAs?: SessionKind,
) {
  const headers = new Headers(init.headers);
  if (authenticatedAs) {
    const token = getAuthToken(authenticatedAs);
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(`${API_URL}${path}`, { ...init, headers });
}
