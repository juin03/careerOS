import { requireProfile } from "@/lib/auth";
import { getCandidateShape } from "@/lib/candidate-data";
import { InvitationsView } from "./invitations-view";

// People who want to meet the current candidate about the path they're on.
// The candidate's own role is the "path" the requests are framed around.
export default async function InvitationsPage() {
  const profile = await requireProfile("candidate");
  const shape = await getCandidateShape(profile);
  return <InvitationsView aboutPath={shape.roleTitle} />;
}
