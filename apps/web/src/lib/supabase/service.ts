import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseServiceKey, supabaseUrl } from "../env";

// Service-role client. Bypasses RLS. Never import from code that ships to the browser.
export function createServiceClient() {
  return createClient(supabaseUrl(), supabaseServiceKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
