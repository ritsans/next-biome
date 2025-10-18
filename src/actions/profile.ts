"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function updateProfile(formData: FormData) {
  const username = formData.get("username") as string;
  const displayName = formData.get("display_name") as string;
  const bio = formData.get("bio") as string;
  const avatarUrl = formData.get("avatar_url") as string;

  // display_nameは必須
  if (!displayName || displayName.trim() === "") {
    return { error: "表示名は必須です" };
  }

  // usernameのバリデーション
  if (!username || username.trim() === "") {
    return { error: "ユーザー名は必須です" };
  }

  const usernameRegex = /^[a-z0-9_]{3,30}$/;
  if (!usernameRegex.test(username)) {
    return {
      error:
        "ユーザー名は3〜30文字の小文字英数字とアンダースコアのみ使用できます",
    };
  }

  try {
    const supabase = await createClient();

    // 現在のユーザーを取得
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "認証されていません" };
    }

    // プロフィールを更新
    const { error } = await supabase
      .from("profiles")
      .update({
        username,
        display_name: displayName.trim(),
        bio: bio.trim() || null,
        avatar_url: avatarUrl.trim() || null,
      })
      .eq("id", user.id);

    if (error) {
      // 一意制約違反をチェック
      if (error.code === "23505") {
        return { error: "このユーザー名は既に使用されています" };
      }
      return { error: error.message };
    }

    // 成功したらマイページへリダイレクト
    redirect("/mypage");
  } catch (err) {
    if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
      throw err;
    }
    return {
      error:
        err instanceof Error ? err.message : "プロフィール更新に失敗しました",
    };
  }
}
