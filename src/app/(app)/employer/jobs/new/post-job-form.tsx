"use client";

import { useState, useActionState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { postJob, type PostJobState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
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
  salaryMin: number;
  salaryMax: number;
}

export function PostJobForm({ roles }: { roles: RoleOption[] }) {
  const [roleId, setRoleId] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [title, setTitle] = useState("");
  const [state, action, pending] = useActionState<PostJobState, FormData>(
    postJob,
    {},
  );

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state]);

  function onRoleChange(id: string) {
    setRoleId(id);
    const role = roles.find((r) => r.id === id);
    if (role) {
      if (!title) setTitle(role.title);
      setSalaryMin(String(role.salaryMin));
      setSalaryMax(String(role.salaryMax));
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label>Role in the graph</Label>
            <Select value={roleId} onValueChange={onRoleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select the role this maps to" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.title} · {r.family}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="roleId" value={roleId} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Job title</Label>
            <Input
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Software Engineer, Payments"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" placeholder="Kuala Lumpur" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salaryMin">Salary min (RM)</Label>
              <Input
                id="salaryMin"
                name="salaryMin"
                type="number"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                placeholder="6000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salaryMax">Salary max (RM)</Label>
              <Input
                id="salaryMax"
                name="salaryMax"
                type="number"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                placeholder="9000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={5}
              placeholder="What the role involves and who thrives in it…"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={pending || !roleId} className="gap-2">
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Post job
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
