import { supabase } from "./supabaseClient";

export async function logActivity(action, description) {
  const { error } = await supabase
    .from("ActivityLog")
    .insert([
      {
        action,
        description,
      },
    ]);

  if (error) {
    console.error("Activity log error:", error);
  }
}