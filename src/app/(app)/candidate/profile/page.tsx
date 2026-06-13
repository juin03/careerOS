import { requireProfile } from "@/lib/auth";
import { getCandidateShape } from "@/lib/candidate-data";
import { ROLES } from "@/lib/career-graph/seed-data";
import { ProfileEditor } from "./profile-editor";

export default async function ProfilePage() {
  const profile = await requireProfile("candidate");
  const shape = await getCandidateShape(profile);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Your profile</h1>
        <p className="mt-1 text-muted-foreground">
          This is your shape — the whole platform reads from it.
        </p>
      </div>
      <ProfileEditor
        roles={ROLES.map((r) => ({ id: r.id, title: r.title, family: r.family }))}
        initial={{
          fullName: profile.full_name ?? "",
          headline: profile.headline ?? "",
          location: profile.location ?? "",
          university: profile.university ?? "",
          roleId: shape.seedRoleId ?? "",
          skills: shape.skills,
          findability: profile.findability,
        }}
      />
    </div>
  );
}
