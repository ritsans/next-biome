"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { resetPasswordSchema } from "@/lib/validations";
import { errorToJP } from "@/lib/errors";

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
      return { error: errorToJP(error) };
    }

    redirect("/login?message=パスワードを変更しました");
  } catch (err) {
    if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
      throw err;
    }
    return { error: err instanceof Error ? err.message : "パスワードの変更に失敗しました" };
  }
}
