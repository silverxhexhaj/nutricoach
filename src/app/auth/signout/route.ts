import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const url = new URL(request.url);
  const origin = url.origin;
  const redirectTo = url.searchParams.get("redirect");
  const destination = redirectTo
    ? redirectTo.startsWith("/")
      ? `${origin}${redirectTo}`
      : `${origin}/`
    : `${origin}/`;
  return NextResponse.redirect(destination, { status: 302 });
}
