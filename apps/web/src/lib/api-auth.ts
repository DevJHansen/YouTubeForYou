import "server-only";
import { createClient as createSbClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "./env";

export type ExtensionUser = { id: string; email: string };

// Validate a Supabase access token from Authorization: Bearer <jwt>.
// Returns the user, or null if invalid/missing.
export async function requireExtensionUser(req: Request): Promise<ExtensionUser | null> {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;

  const supabase = createSbClient(supabaseUrl(), supabaseAnonKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email ?? "" };
}
