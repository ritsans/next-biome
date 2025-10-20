"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { profileSchema } from "@/lib/validations";

export async function updateProfile(formData: FormData) {
  const username = formData.get("username") as string;
  const displayName = formData.get("display_name") as string;
  const bio = formData.get("bio") as string;
  const avatarUrl = formData.get("avatar_url") as string;

  const validation = profileSchema.safeParse({
    username,
    display_name: displayName,
    bio,
    avatar_url: avatarUrl,
  });

  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "認証されていません" };
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        username: validation.data.username,
        display_name: validation.data.display_name,
        bio: validation.data.bio || null,
        avatar_url: validation.data.avatar_url || null,
      })
      .eq("id", user.id);

    if (error) {
      if (error.code === "23505") {
        return { error: "このユーザー名は既に使用されています" };
      }
      return { error: error.message };
    }

    redirect("/mypage");
  } catch (err) {
    if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
      throw err;
    }
    return {
      error: err instanceof Error ? err.message : "プロフィール更新に失敗しました",
    };
  }
}
