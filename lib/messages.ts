import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type Message = {
  id: number;
  content: string;
  created_at: string;
};

const TABLE_NAME = "messages";
const MAX_LENGTH = 500;

export function normalizeMessageContent(content: unknown) {
  if (typeof content !== "string") {
    throw new Error("Az üzenet szövege hiányzik.");
  }

  const normalizedContent = content.trim();

  if (!normalizedContent) {
    throw new Error("Az üzenet nem lehet üres.");
  }

  if (normalizedContent.length > MAX_LENGTH) {
    throw new Error(`Az üzenet legfeljebb ${MAX_LENGTH} karakter lehet.`);
  }

  return normalizedContent;
}

export async function listMessages() {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("id, content, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Message[];
}

export async function createMessage(content: string) {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert({ content })
    .select("id, content, created_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Message;
}

export async function deleteMessage(id: number) {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}