"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Mock session store (client-side, localStorage). Lets the "book an in-field
// expert → meeting room" flow work end-to-end with no backend yet. A real
// `sessions` table + server actions can replace this later without changing the
// UI contract.
// ─────────────────────────────────────────────────────────────────────────────

export interface MockSession {
  id: string;
  expertId: string;
  expertName: string;
  expertRole: string | null;
  roleId: string | null; // the career path this conversation is about
  roleTitle: string | null;
  slot: string; // human-readable chosen time
  topic: string; // what the candidate wants to understand
  createdAt: string; // ISO
  status: "upcoming" | "done";
}

const KEY = "careeros.sessions";

function read(): MockSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as MockSession[]) : [];
  } catch {
    return [];
  }
}

function write(sessions: MockSession[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(sessions));
}

export function listSessions(): MockSession[] {
  return read().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getSession(id: string): MockSession | null {
  return read().find((s) => s.id === id) ?? null;
}

export function addSession(
  input: Omit<MockSession, "id" | "createdAt" | "status">,
): MockSession {
  const session: MockSession = {
    ...input,
    id: `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    status: "upcoming",
  };
  write([session, ...read()]);
  return session;
}

export function removeSession(id: string): void {
  write(read().filter((s) => s.id !== id));
}

// A few plausible upcoming slots for the mock booking picker.
export function mockSlots(): string[] {
  const days = ["Tomorrow", "In 2 days", "This Friday", "Next Monday"];
  const times = ["9:00 AM", "1:00 PM", "4:30 PM", "8:00 PM"];
  const out: string[] = [];
  for (let i = 0; i < 4; i++) {
    out.push(`${days[i]}, ${times[i]}`);
  }
  return out;
}
