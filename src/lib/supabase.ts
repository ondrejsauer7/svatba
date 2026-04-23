export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

function getJwtRoleFromKey(key: string) {
  if (!key.startsWith("eyJ")) return null;
  try {
    const payloadPart = key.split(".")[1];
    if (!payloadPart) return null;

    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded)) as { role?: unknown };
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("Chybí VITE_SUPABASE_URL nebo VITE_SUPABASE_KEY");
}

if (getJwtRoleFromKey(SUPABASE_KEY) === "service_role") {
  throw new Error(
    "VITE_SUPABASE_KEY nesmi byt service_role. Pouzij anon/public klic a RLS."
  );
}

export async function supabaseRequest(
  path: string,
  options: RequestInit = {}
) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Supabase request failed");
  }

  if (response.status === 204) return null;
  return response.json();
}
