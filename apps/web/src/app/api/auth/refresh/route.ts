import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "@/lib/env";

export async function POST(request: Request) {
  let body: { refresh_token?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const refresh_token = body.refresh_token;
  if (!refresh_token) {
    return NextResponse.json({ error: "missing_refresh_token" }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl(), supabaseAnonKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.refreshSession({ refresh_token });
  if (error || !data.session) {
    return NextResponse.json({ error: "invalid_refresh" }, { status: 401 });
  }

  return NextResponse.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at ?? 0,
  });
}
