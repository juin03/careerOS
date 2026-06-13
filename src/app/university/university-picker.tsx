"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function UniversityPicker({
  current,
  options,
}: {
  current: string;
  options: { id: string; name: string }[];
}) {
  const router = useRouter();
  return (
    <Select value={current} onValueChange={(id) => router.push(`/university?uni=${id}`)}>
      <SelectTrigger className="w-64">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.id} value={o.id}>
            {o.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
