"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SetPasswordState = { error?: string };

// Spends the one-time token from the access link (signing the patient in),
// then saves the password they chose.
export async function setPassword(
  _prev: SetPasswordState,
  form: FormData,
): Promise<SetPasswordState> {
  const token = String(form.get("token") ?? "");
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");

  if (password.length < 8) return { error: "A senha precisa ter pelo menos 8 caracteres." };
  if (password !== confirm) return { error: "As senhas não são iguais." };

  const supabase = await createClient();
  const { error: otpError } = await supabase.auth.verifyOtp({
    type: "recovery",
    token_hash: token,
  });
  if (otpError) {
    return { error: "Este link expirou ou já foi usado. Peça um novo para a Lisie." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    console.error("setPassword", error);
    return { error: "Não foi possível salvar a senha. Peça um novo link para a Lisie." };
  }

  redirect("/");
}
