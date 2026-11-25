"use server";

import { headers } from "next/headers";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export type AccessLink = { link: string; name: string; phone: string | null };
export type AccessState = { error?: string; access?: AccessLink };

/** Digits only, with Brazil's 55 added to local numbers (DDD + number). */
function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  return digits.length <= 11 ? `55${digits}` : digits;
}

// One-time link to /acesso, where the patient sets their password. The token
// is only spent when they submit that form, so WhatsApp's link preview can't
// use it up.
async function accessLink(email: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
  });
  if (error || !data.properties?.hashed_token) {
    console.error("accessLink", error);
    return null;
  }
  const h = await headers();
  const origin = h.get("origin") ?? `https://${h.get("host")}`;
  return `${origin}/acesso?token=${encodeURIComponent(data.properties.hashed_token)}`;
}

export async function createPatient(
  _prev: AccessState,
  form: FormData,
): Promise<AccessState> {
  await requireAdmin();

  const name = String(form.get("full_name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const phone = normalizePhone(String(form.get("phone") ?? ""));
  if (!name) return { error: "Informe o nome." };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Informe um e-mail válido." };
  if (phone && (phone.length < 12 || phone.length > 13)) {
    return { error: "WhatsApp inválido. Use DDD + número." };
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: name },
  });
  if (error) {
    if (error.code === "email_exists") {
      return { error: "Já existe uma conta com este e-mail." };
    }
    console.error("createPatient", error);
    return { error: "Não foi possível criar o paciente." };
  }

  // The auth trigger creates the profile; add what it doesn't know.
  await admin
    .from("profiles")
    .update({ full_name: name, phone })
    .eq("id", data.user.id);

  const link = await accessLink(email);
  if (!link) {
    return { error: "Paciente criado, mas o link falhou. Gere outro na página do paciente." };
  }
  return { access: { link, name, phone } };
}

/** New access link for an existing patient (first access or forgotten password). */
export async function newAccessLink(patientId: string): Promise<AccessState> {
  await requireAdmin();

  const admin = createAdminClient();
  const { data: patient } = await admin
    .from("profiles")
    .select("email, full_name, phone")
    .eq("id", patientId)
    .single();
  if (!patient?.email) return { error: "Paciente não encontrado." };

  const link = await accessLink(patient.email);
  if (!link) return { error: "Não foi possível gerar o link." };
  return {
    access: { link, name: patient.full_name ?? patient.email, phone: patient.phone },
  };
}
