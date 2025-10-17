// import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const accessToken = url.searchParams.get("access_token");
  const refreshToken = url.searchParams.get("refresh_token");

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      const redirectUrl = new URL(
        `/login?error=${encodeURIComponent(error.message)}`,
        url,
      );
      return NextResponse.redirect(redirectUrl);
    }
  } else if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      const redirectUrl = new URL(
        `/login?error=${encodeURIComponent(error.message)}`,
        url,
      );
      return NextResponse.redirect(redirectUrl);
    }
  } else {
    const redirectUrl = new URL(`/login?error=missing_credentials`, url);
    return NextResponse.redirect(redirectUrl);
  }

  const redirectUrl = new URL("/mypage", url);
  return NextResponse.redirect(redirectUrl);
}
