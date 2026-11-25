import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone?: string | null; // only selected by admin pages
  role: "patient" | "admin";
};

/** The signed-in user's profile, or a redirect to /login. */
export async function requireProfile() {
  // Signed-in pages are always per-request (they also read the current date).
  await connection();
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("id", userId)
    .single<Profile>();
  if (!profile) redirect("/login");

  return { supabase, profile };
}

/** Same as requireProfile, but only for admins (others go home). */
export async function requireAdmin() {
  const result = await requireProfile();
  if (result.profile.role !== "admin") redirect("/");
  return result;
}
