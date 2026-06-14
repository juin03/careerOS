"use client";

import { useState, useActionState, useEffect, useRef, useTransition } from "react";
import {
  Loader2,
  Plus,
  X,
  Eye,
  EyeOff,
  Lock,
  Upload,
  Trophy,
  Briefcase,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  saveProfile,
  analyzeResume,
  type SaveProfileState,
} from "@/app/(app)/candidate/actions";
import { extractPdfText } from "@/lib/pdf-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface RoleOption {
  id: string;
  title: string;
  family: string;
}

type Findability = "open" | "quiet" | "closed";

interface ExperienceItem {
  title: string;
  org: string;
  period: string;
  highlights: string[];
}
interface AchievementItem {
  title: string;
  detail: string;
}

export function ProfileEditor({
  roles,
  initial,
}: {
  roles: RoleOption[];
  initial: {
    fullName: string;
    headline: string;
    location: string;
    university: string;
    roleId: string;
    skills: string[];
    findability: Findability;
    summary: string;
    experience: ExperienceItem[];
    achievements: AchievementItem[];
  };
}) {
  const [roleId, setRoleId] = useState(initial.roleId);
  const [skills, setSkills] = useState<string[]>(initial.skills);
  const [newSkill, setNewSkill] = useState("");
  const [findability, setFindability] = useState<Findability>(initial.findability);
  const [summary, setSummary] = useState(initial.summary);
  const [experience, setExperience] = useState<ExperienceItem[]>(initial.experience);
  const [achievements, setAchievements] = useState<AchievementItem[]>(
    initial.achievements,
  );
  const [headline, setHeadline] = useState(initial.headline);
  const [state, action, saving] = useActionState<SaveProfileState, FormData>(
    saveProfile,
    {},
  );

  // Resume re-upload: extract PDF, re-parse with AI, refresh the whole portfolio.
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [reparsing, startReparse] = useTransition();

  async function handleResumeFile(file: File | undefined) {
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file.");
      return;
    }
    startReparse(async () => {
      let text: string;
      try {
        text = await extractPdfText(file);
      } catch {
        toast.error("Couldn't read that PDF. Try another file.");
        return;
      }
      if (text.length < 30) {
        toast.error("Couldn't read much text from that PDF.");
        return;
      }
      const fd = new FormData();
      fd.set("resumeText", text);
      const result = await analyzeResume({}, fd);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      // Refresh every field from the new resume.
      if (result.headline) setHeadline(result.headline);
      if (result.suggestedRoleId) setRoleId(result.suggestedRoleId);
      if (result.skills?.length) setSkills(result.skills);
      if (result.summary) setSummary(result.summary);
      if (result.experience) setExperience(result.experience);
      if (result.achievements) setAchievements(result.achievements);
      toast.success(
        result.usedAI
          ? "Resume re-read with AI — review and save."
          : "Resume re-read — review and save.",
      );
    });
  }

  useEffect(() => {
    if (state.ok) toast.success("Profile saved.");
    if (state.error) toast.error(state.error);
  }, [state]);

  function addSkill() {
    const s = newSkill.trim();
    if (s && !skills.includes(s)) setSkills([...skills, s]);
    setNewSkill("");
  }

  return (
    <form action={action} className="space-y-6">
      {/* Resume re-upload — refreshes the whole portfolio via AI */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Update from resume
          </CardTitle>
          <CardDescription>
            Upload a new CV (PDF) and AI re-extracts your role, skills, experience,
            and achievements — then review and save.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleResumeFile(e.dataTransfer.files?.[0]);
            }}
            className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-6 transition-colors hover:border-primary/50 hover:bg-accent/50"
          >
            {reparsing ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : (
              <Upload className="h-6 w-6 text-muted-foreground" />
            )}
            <span className="text-sm font-medium">
              {reparsing ? "Re-reading your CV…" : "Upload an updated CV (PDF)"}
            </span>
            <span className="text-xs text-muted-foreground">
              Drag &amp; drop or click
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => handleResumeFile(e.target.files?.[0])}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Basics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" name="fullName" defaultValue={initial.fullName} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              name="headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary">Professional summary</Label>
            <Textarea
              id="summary"
              name="summary"
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="A few sentences employers see first…"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" defaultValue={initial.location} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="university">University</Label>
              <Input
                id="university"
                name="university"
                defaultValue={initial.university}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role &amp; skills</CardTitle>
          <CardDescription>
            Your current role and skills drive the landscape map and matching.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current role</Label>
            <Select value={roleId} onValueChange={setRoleId}>
              <SelectTrigger>
                <SelectValue placeholder="Select your current role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.title} · {r.family}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="currentRoleId" value={roleId} />
          </div>

          <div className="space-y-2">
            <Label>Skills</Label>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <Badge key={s} variant="secondary" className="gap-1 pr-1">
                  {s}
                  <button
                    type="button"
                    onClick={() => setSkills(skills.filter((x) => x !== s))}
                    className="rounded-full p-0.5 hover:bg-background/50"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="Add a skill and press Enter"
              />
              <Button type="button" variant="outline" size="icon" onClick={addSkill}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <input type="hidden" name="skills" value={skills.join(",")} />
          </div>
        </CardContent>
      </Card>

      {/* Experience — the portfolio employers see */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Experience
          </CardTitle>
          <CardDescription>
            Your career progression. Employers see this; the AI reads it for matching.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {experience.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No experience yet — upload a CV above to fill this automatically, or add one.
            </p>
          )}
          {experience.map((exp, i) => (
            <div key={i} className="space-y-2 rounded-lg border p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="grid flex-1 gap-2 sm:grid-cols-2">
                  <Input
                    value={exp.title}
                    placeholder="Role title"
                    onChange={(e) =>
                      setExperience(
                        experience.map((x, j) =>
                          j === i ? { ...x, title: e.target.value } : x,
                        ),
                      )
                    }
                  />
                  <Input
                    value={exp.org}
                    placeholder="Company / org"
                    onChange={(e) =>
                      setExperience(
                        experience.map((x, j) =>
                          j === i ? { ...x, org: e.target.value } : x,
                        ),
                      )
                    }
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setExperience(experience.filter((_, j) => j !== i))}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <Input
                value={exp.period}
                placeholder="e.g. Mar 2025 – Present"
                onChange={(e) =>
                  setExperience(
                    experience.map((x, j) =>
                      j === i ? { ...x, period: e.target.value } : x,
                    ),
                  )
                }
              />
              <Textarea
                rows={2}
                value={exp.highlights.join("\n")}
                placeholder="One highlight per line"
                onChange={(e) =>
                  setExperience(
                    experience.map((x, j) =>
                      j === i
                        ? { ...x, highlights: e.target.value.split("\n").filter(Boolean) }
                        : x,
                    ),
                  )
                }
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() =>
              setExperience([
                ...experience,
                { title: "", org: "", period: "", highlights: [] },
              ])
            }
          >
            <Plus className="h-4 w-4" /> Add experience
          </Button>
          <input type="hidden" name="experience" value={JSON.stringify(experience)} />
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Achievements &amp; projects
          </CardTitle>
          <CardDescription>
            Awards, hackathons, competitions, leadership — the proof beyond job titles.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {achievements.length === 0 && (
            <p className="text-sm text-muted-foreground">
              None yet — upload a CV above, or add one.
            </p>
          )}
          {achievements.map((a, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg border p-3">
              <div className="flex-1 space-y-2">
                <Input
                  value={a.title}
                  placeholder="e.g. Champion, Hack2Hire 2025"
                  onChange={(e) =>
                    setAchievements(
                      achievements.map((x, j) =>
                        j === i ? { ...x, title: e.target.value } : x,
                      ),
                    )
                  }
                />
                <Textarea
                  rows={2}
                  value={a.detail}
                  placeholder="What it was and why it mattered"
                  onChange={(e) =>
                    setAchievements(
                      achievements.map((x, j) =>
                        j === i ? { ...x, detail: e.target.value } : x,
                      ),
                    )
                  }
                />
              </div>
              <button
                type="button"
                onClick={() => setAchievements(achievements.filter((_, j) => j !== i))}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() =>
              setAchievements([...achievements, { title: "", detail: "" }])
            }
          >
            <Plus className="h-4 w-4" /> Add achievement
          </Button>
          <input
            type="hidden"
            name="achievements"
            value={JSON.stringify(achievements)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Findability</CardTitle>
          <CardDescription>
            Control how employers can reach you through Quiet Signals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input type="hidden" name="findability" value={findability} />
          <div className="grid gap-3 sm:grid-cols-3">
            <FindCard
              active={findability === "open"}
              onClick={() => setFindability("open")}
              icon={<Eye className="h-5 w-5" />}
              label="Open"
              sub="Employers can see your shape and reach out."
            />
            <FindCard
              active={findability === "quiet"}
              onClick={() => setFindability("quiet")}
              icon={<EyeOff className="h-5 w-5" />}
              label="Quiet"
              sub="Visible anonymously; only specific, relevant outreach."
            />
            <FindCard
              active={findability === "closed"}
              onClick={() => setFindability("closed")}
              icon={<Lock className="h-5 w-5" />}
              label="Closed"
              sub="Not discoverable. No outreach at all."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving} className="gap-2">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save profile
        </Button>
      </div>
    </form>
  );
}

function FindCard({
  active,
  onClick,
  icon,
  label,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col gap-1.5 rounded-lg border p-3 text-left transition-colors",
        active ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-primary/40",
      )}
    >
      <span className={cn(active ? "text-primary" : "text-muted-foreground")}>
        {icon}
      </span>
      <span className="text-sm font-medium">{label}</span>
      <span className="text-xs text-muted-foreground">{sub}</span>
    </button>
  );
}
