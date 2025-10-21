"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { signUpSchema } from "@/lib/validations";

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validation = signUpSchema.safeParse({ email, password });

  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!siteUrl) {
      return { error: "NEXT_PUBLIC_SITE_URL が設定されていません" };
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
      email: validation.data.email,
      password: validation.data.password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    });

    if (error) {
      return { error: error.message };
    }

    redirect("/signup/verify");
  } catch (err) {
    if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
      throw err;
    }
    return { error: err instanceof Error ? err.message : "登録に失敗しました" };
  }
}
