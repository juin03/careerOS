import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getCandidateShape } from "@/lib/candidate-data";
import { suggestedPrompts } from "@/lib/ai/coach";
import { CoachChat, type ChatMessage } from "./coach-chat";

export default async function CoachPage() {
  const profile = await requireProfile("candidate");
  const shape = await getCandidateShape(profile);
  const supabase = await createClient();

  const { data: history } = await supabase
    .from("coach_messages")
    .select("id, role, content")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: true });

  const messages: ChatMessage[] = (history ?? []).map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const prompts = suggestedPrompts({
    roleTitle: shape.roleTitle,
    seedRoleId: shape.seedRoleId,
    skills: shape.skills,
    summary: shape.summary,
    experience: [],
  });

  return (
    <CoachChat
      initialMessages={messages}
      suggestedPrompts={prompts}
      roleTitle={shape.roleTitle}
    />
  );
}
