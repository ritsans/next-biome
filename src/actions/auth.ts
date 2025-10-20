"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { resetPasswordRequestSchema, resetPasswordSchema, signInSchema, signUpSchema } from "@/lib/validations";

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

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validation = signInSchema.safeParse({ email, password });

  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: validation.data.email,
    password: validation.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/mypage");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/logout");
}

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get("email") as string;

  const validation = resetPasswordRequestSchema.safeParse({ email });

  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!siteUrl) {
      return { error: "NEXT_PUBLIC_SITE_URL が設定されていません" };
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(validation.data.email, {
      redirectTo: `${siteUrl}/reset-password`,
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "リセットメールの送信に失敗しました" };
  }
}

export async function resetPassword(formData: FormData) {
  const password = formData.get("password") as string;

  const validation = resetPasswordSchema.safeParse({ password });

  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({
      password: validation.data.password,
    });

    if (error) {
      return { error: error.message };
    }

    redirect("/login?message=パスワードを変更しました");
  } catch (err) {
    if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
      throw err;
    }
    return { error: err instanceof Error ? err.message : "パスワードの変更に失敗しました" };
  }
}
