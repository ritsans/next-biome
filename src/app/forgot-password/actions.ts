"use server";

import { createClient } from "@/utils/supabase/server";
import { resetPasswordRequestSchema } from "@/lib/validations";

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
