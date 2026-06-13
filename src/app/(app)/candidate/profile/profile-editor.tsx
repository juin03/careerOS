"use client";

import { useState, useActionState, useEffect } from "react";
import { Loader2, Plus, X, Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "sonner";
import { saveProfile, type SaveProfileState } from "@/app/(app)/candidate/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  };
}) {
  const [roleId, setRoleId] = useState(initial.roleId);
  const [skills, setSkills] = useState<string[]>(initial.skills);
  const [newSkill, setNewSkill] = useState("");
  const [findability, setFindability] = useState<Findability>(initial.findability);
  const [state, action, saving] = useActionState<SaveProfileState, FormData>(
    saveProfile,
    {},
  );

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
            <Input id="headline" name="headline" defaultValue={initial.headline} />
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
