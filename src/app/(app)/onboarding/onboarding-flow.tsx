"use client";

import { useState, useActionState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Wand2, ArrowRight, Plus, X } from "lucide-react";
import { toast } from "sonner";
import {
  analyzeResume,
  saveProfile,
  type SaveProfileState,
} from "@/app/(app)/candidate/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RoleOption {
  id: string;
  title: string;
  family: string;
}

const SAMPLE_RESUME = `Nurul Hidayah
Kuala Lumpur, Malaysia

Software Engineer with 2 years building web applications.
Currently at a fintech startup working with React, TypeScript, and Node.js.
Comfortable with SQL and Git. Interested in moving toward product.

Experience:
- Software Engineer, FinPay (2024–present): shipped customer-facing features in React/TypeScript
- Graduate Developer, Tech Co (2023–2024): backend APIs in Node.js

Education: BSc Computer Science, Universiti Malaya
Skills: JavaScript, TypeScript, React, Node.js, SQL, Git`;

export function OnboardingFlow({
  roles,
  defaultName,
}: {
  roles: RoleOption[];
  defaultName: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);

  // Parsed/editable profile state.
  const [fullName, setFullName] = useState(defaultName);
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [roleId, setRoleId] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  const [parsing, startParsing] = useTransition();
  const [saveState, saveActionFn, saving] = useActionState<
    SaveProfileState,
    FormData
  >(saveProfile, {});

  // Parse the resume in an event handler (not an effect) and hydrate the form.
  function handleParse(formData: FormData) {
    startParsing(async () => {
      const result = await analyzeResume({}, formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.fullName) setFullName(result.fullName);
      if (result.headline) setHeadline(result.headline);
      if (result.location) setLocation(result.location);
      if (result.suggestedRoleId) setRoleId(result.suggestedRoleId);
      if (result.skills?.length) setSkills(result.skills);
      setStep(2);
      toast.success(
        result.usedAI
          ? "Resume parsed with AI — review and adjust below."
          : "Resume read — review and adjust below.",
      );
    });
  }

  useEffect(() => {
    if (saveState.ok) {
      toast.success("Profile saved. Mapping your landscape…");
      router.push("/candidate/landscape");
    }
    if (saveState.error) toast.error(saveState.error);
  }, [saveState, router]);

  function addSkill() {
    const s = newSkill.trim();
    if (s && !skills.includes(s)) setSkills([...skills, s]);
    setNewSkill("");
  }

  return (
    <div className="w-full max-w-xl">
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <StepDot n={1} active={step === 1} done={step > 1} label="Resume" />
        <div className="h-px flex-1 bg-border" />
        <StepDot n={2} active={step === 2} done={false} label="Review" />
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Let&apos;s read your resume
            </CardTitle>
            <CardDescription>
              Paste your resume and we&apos;ll extract your skills and current
              role — so the map is about you, not a generic template.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleParse} className="space-y-4">
              <Textarea
                name="resumeText"
                rows={12}
                placeholder="Paste your resume here…"
                defaultValue=""
                className="resize-none font-mono text-xs"
                required
              />
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    const ta = (e.currentTarget.closest("form") as HTMLFormElement)
                      .elements.namedItem("resumeText") as HTMLTextAreaElement;
                    ta.value = SAMPLE_RESUME;
                  }}
                  className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Use a sample resume
                </button>
                <Button type="submit" disabled={parsing} className="gap-2">
                  {parsing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                  {parsing ? "Reading…" : "Parse resume"}
                </Button>
              </div>
              <p className="text-center text-xs text-muted-foreground">
                or{" "}
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  skip and fill in manually
                </button>
              </p>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Review your profile</CardTitle>
            <CardDescription>
              Everything is editable. This is your shape — the map reads from it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={saveActionFn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="headline">Headline</Label>
                <Input
                  id="headline"
                  name="headline"
                  value={headline}
                  placeholder="e.g. Software Engineer, 2 yrs, fintech"
                  onChange={(e) => setHeadline(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={location}
                    placeholder="Kuala Lumpur"
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="university">University</Label>
                  <Input
                    id="university"
                    name="university"
                    placeholder="Universiti Malaya"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Current role</Label>
                <Select value={roleId} onValueChange={setRoleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your current role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.title}{" "}
                        <span className="text-muted-foreground">· {r.family}</span>
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
                  {skills.length === 0 && (
                    <span className="text-xs text-muted-foreground">
                      No skills yet — add some below.
                    </span>
                  )}
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

              <input type="hidden" name="findability" value="open" />

              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(1)}
                  size="sm"
                >
                  ← Back
                </Button>
                <Button type="submit" disabled={saving || !roleId} className="gap-2">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  See my landscape <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              {!roleId && (
                <p className="text-right text-xs text-muted-foreground">
                  Pick a current role to continue.
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StepDot({
  n,
  active,
  done,
  label,
}: {
  n: number;
  active: boolean;
  done: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
          active || done
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {n}
      </span>
      <span className={active ? "font-medium text-foreground" : ""}>{label}</span>
    </div>
  );
}
