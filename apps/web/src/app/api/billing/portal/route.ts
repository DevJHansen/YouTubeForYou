import { CustomerPortal } from "@polar-sh/nextjs";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { polar, appUrl } from "@/lib/env";

const cfg = polar();

const handler = CustomerPortal({
  accessToken: cfg.accessToken,
  server: cfg.server,
  returnUrl: `${appUrl()}/billing`,
  getExternalCustomerId: async () => {
    const session = await getSession();
    return session?.userId ?? "";
  },
});

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(`${appUrl()}/auth/signin?next=/billing`);
  }
  return handler(request as Parameters<typeof handler>[0]);
}
