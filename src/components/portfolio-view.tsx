import { Briefcase, Trophy, GraduationCap, MapPin, CheckCircle2 } from "lucide-react";
import { PersonAvatar } from "@/components/person-avatar";
import { Badge } from "@/components/ui/badge";

export interface PortfolioExperience {
  title: string;
  org: string;
  period: string;
  highlights: string[];
}
export interface PortfolioAchievement {
  title: string;
  detail: string;
}

export interface PortfolioData {
  id: string;
  fullName: string | null;
  headline: string | null;
  location: string | null;
  university: string | null;
  roleTitle: string | null;
  summary: string | null;
  skills: string[];
  experience: PortfolioExperience[];
  achievements: PortfolioAchievement[];
}

// The Living Portfolio, as employers see it — a compiled, structured record of
// who the candidate is and how they've progressed. The same data feeds AI
// matching, so what's shown here is what the recommendations are built on.
export function PortfolioView({ p }: { p: PortfolioData }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start gap-4">
        <PersonAvatar name={p.fullName} seed={p.id} className="h-14 w-14" />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {p.fullName ?? "Candidate"}
          </h1>
          {p.headline && <p className="text-muted-foreground">{p.headline}</p>}
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {p.roleTitle && <span>{p.roleTitle}</span>}
            {p.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {p.location}
              </span>
            )}
            {p.university && (
              <span className="flex items-center gap-1">
                <GraduationCap className="h-3.5 w-3.5" />
                {p.university}
              </span>
            )}
          </div>
        </div>
      </div>

      {p.summary && (
        <p className="rounded-xl border bg-card p-4 text-sm leading-relaxed">
          {p.summary}
        </p>
      )}

      {/* Skills */}
      {p.skills.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">Skills</h2>
          <div className="flex flex-wrap gap-1.5">
            {p.skills.map((s) => (
              <Badge key={s} variant="secondary">
                {s}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Experience progression */}
      {p.experience.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <Briefcase className="h-4 w-4 text-primary" />
            Experience
          </h2>
          <div className="relative space-y-5 pl-6">
            <div className="absolute bottom-2 left-[7px] top-2 w-px bg-border" />
            {p.experience.map((exp, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-6 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-primary bg-background" />
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <span className="font-medium">{exp.title}</span>
                  <span className="text-xs text-muted-foreground">{exp.period}</span>
                </div>
                <div className="text-sm text-muted-foreground">{exp.org}</div>
                {exp.highlights.length > 0 && (
                  <ul className="mt-1.5 space-y-1">
                    {exp.highlights.map((h, j) => (
                      <li key={j} className="flex gap-1.5 text-sm text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      {p.achievements.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <Trophy className="h-4 w-4 text-primary" />
            Achievements &amp; projects
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {p.achievements.map((a, i) => (
              <div key={i} className="rounded-xl border bg-card p-4">
                <p className="font-medium">{a.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{a.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {p.experience.length === 0 && p.achievements.length === 0 && !p.summary && (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          This candidate hasn&apos;t built out their portfolio yet.
        </p>
      )}
    </div>
  );
}
