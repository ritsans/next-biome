import { z } from "zod";

export const signUpSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(6, "パスワードは6文字以上で入力してください"),
});

export const signInSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(1, "パスワードを入力してください"),
});

export const profileSchema = z.object({
  username: z
    .string()
    .min(3, "ユーザー名は3文字以上で入力してください")
    .max(30, "ユーザー名は30文字以下で入力してください")
    .regex(
      /^[a-z0-9_]+$/,
      "ユーザー名は小文字英数字とアンダースコアのみ使用できます",
    ),
  display_name: z
    .string()
    .min(1, "表示名を入力してください")
    .max(50, "表示名は50文字以下で入力してください"),
  bio: z
    .string()
    .max(500, "自己紹介は500文字以下で入力してください")
    .optional(),
  avatar_url: z
    .string()
    .url("有効なURLを入力してください")
    .optional()
    .or(z.literal("")),
});
