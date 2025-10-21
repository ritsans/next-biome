"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { signInSchema } from "@/lib/validations";
import { errorToJP } from "@/lib/errors";

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
    return { error: errorToJP(error) };
  }

  redirect("/mypage");
}
